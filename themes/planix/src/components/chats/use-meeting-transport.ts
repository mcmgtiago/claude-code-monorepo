"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  ChatMeetingParticipant,
  ChatMeetingSession,
  ChatMeetingSignalEnvelope,
} from "@/data/chats";

type MeetingTransportPatch = {
  micEnabled?: boolean;
  cameraEnabled?: boolean;
  speakerEnabled?: boolean;
  screenSharing?: boolean;
};

type RemoteMeetingMedia = {
  participantId: string;
  stream: MediaStream;
  hasAudio: boolean;
  hasVideo: boolean;
  connectionState: RTCPeerConnectionState | "new";
};

type UseMeetingTransportOptions = {
  contactId: string | null;
  meeting: ChatMeetingSession | null;
  meetingMode: "audio" | "video" | null;
  enabled: boolean;
  onTransportPatch: (patch: MeetingTransportPatch) => Promise<void>;
};

type PeerEntry = {
  pc: RTCPeerConnection;
  polite: boolean;
  makingOffer: boolean;
  ignoreOffer: boolean;
  isSettingRemoteAnswerPending: boolean;
  audioTransceiver: RTCRtpTransceiver;
  videoTransceiver: RTCRtpTransceiver;
};

const FALLBACK_ICE_SERVERS: RTCIceServer[] = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
];

let rtcConfigurationPromise: Promise<RTCConfiguration> | null = null;

function normalizeRtcConfiguration(iceServers: RTCIceServer[] | null | undefined): RTCConfiguration {
  if (Array.isArray(iceServers) && iceServers.length > 0) {
    return { iceServers };
  }

  return { iceServers: FALLBACK_ICE_SERVERS };
}

async function getRtcConfiguration() {
  if (!rtcConfigurationPromise) {
    rtcConfigurationPromise = (async () => {
      try {
        const response = await fetch("/api/app-config/public", {
          cache: "no-store",
        });

        if (!response.ok) {
          return normalizeRtcConfiguration(null);
        }

        const result = await readJsonSafely<{
          config?: {
            rtcIceServers?: RTCIceServer[];
          };
        }>(response);

        return normalizeRtcConfiguration(result?.config?.rtcIceServers);
      } catch {
        return normalizeRtcConfiguration(null);
      }
    })();
  }

  return rtcConfigurationPromise;
}

function readTracks(stream: MediaStream | null) {
  return {
    audio: stream?.getAudioTracks().find((track) => track.readyState === "live") ?? null,
    video: stream?.getVideoTracks().find((track) => track.readyState === "live") ?? null,
  };
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function isFiniteTimestamp(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  return Number.isFinite(Date.parse(value));
}

async function readJsonSafely<T>(response: Response) {
  const text = await response.text();

  if (!text.trim()) {
    return null as T | null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null as T | null;
  }
}

function buildCombinedStream(audioStream: MediaStream | null, videoStream: MediaStream | null) {
  const stream = new MediaStream();
  const audioTrack = audioStream?.getAudioTracks().find((track) => track.readyState === "live");
  const videoTrack = videoStream?.getVideoTracks().find((track) => track.readyState === "live");

  if (audioTrack) {
    stream.addTrack(audioTrack);
  }

  if (videoTrack) {
    stream.addTrack(videoTrack);
  }

  return stream;
}

function toSignalPayload(input: RTCIceCandidateInit | RTCSessionDescriptionInit) {
  return JSON.parse(JSON.stringify(input)) as Record<string, unknown>;
}

export function useMeetingTransport({
  contactId,
  meeting,
  meetingMode,
  enabled,
  onTransportPatch,
}: UseMeetingTransportOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteMedia, setRemoteMedia] = useState<RemoteMeetingMedia[]>([]);
  const [transportError, setTransportError] = useState("");
  const peerEntriesRef = useRef<Map<string, PeerEntry>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const processedSignalIdsRef = useRef<Set<string>>(new Set());
  const lastSignalAtRef = useRef<string | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const rtcConfigurationRef = useRef<RTCConfiguration>(normalizeRtcConfiguration(null));
  const participantsRef = useRef<ChatMeetingParticipant[]>(meeting?.participants ?? []);
  const contactIdRef = useRef(contactId);
  const patchInFlightRef = useRef<Promise<void> | null>(null);

  const selfParticipant = meeting?.participants.find((participant) => participant.isCurrentUser) ?? null;

  useEffect(() => {
    participantsRef.current = meeting?.participants ?? [];
    contactIdRef.current = contactId;
  }, [contactId, meeting?.participants]);

  useEffect(() => {
    let cancelled = false;

    void getRtcConfiguration().then((configuration) => {
      if (!cancelled) {
        rtcConfigurationRef.current = configuration;
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const sendSignal = useCallback(async (
    targetUserId: string,
    type: "offer" | "answer" | "ice-candidate",
    payload: Record<string, unknown>,
  ) => {
    const nextContactId = contactIdRef.current;

    if (!nextContactId) {
      return;
    }

    const response = await fetch(`/api/messages/threads/${nextContactId}/meeting/signals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        targetUserId,
        type,
        payload,
      }),
    });
    const result = await readJsonSafely<{ error?: string }>(response);

    if (!response.ok) {
      throw new Error(result?.error || "Failed to exchange meeting transport signals.");
    }
  }, []);

  const applyTransportPatch = useCallback(async (patch: MeetingTransportPatch) => {
    if (patchInFlightRef.current) {
      await patchInFlightRef.current.catch(() => undefined);
    }

    const nextPromise = onTransportPatch(patch);
    patchInFlightRef.current = nextPromise;

    try {
      await nextPromise;
    } finally {
      if (patchInFlightRef.current === nextPromise) {
        patchInFlightRef.current = null;
      }
    }
  }, [onTransportPatch]);

  const commitRemoteMedia = useCallback(() => {
    const participantIds = new Set(
      (participantsRef.current ?? [])
        .filter((participant) => !participant.isCurrentUser)
        .map((participant) => participant.id),
    );

    const nextRemoteMedia: RemoteMeetingMedia[] = Array.from(participantIds).map((participantId) => {
      const stream = remoteStreamsRef.current.get(participantId) ?? new MediaStream();
      const peerEntry = peerEntriesRef.current.get(participantId);

      return {
        participantId,
        stream,
        hasAudio: stream.getAudioTracks().some((track) => track.readyState === "live"),
        hasVideo: stream.getVideoTracks().some((track) => track.readyState === "live"),
        connectionState: peerEntry?.pc.connectionState ?? "new",
      };
    });

    setRemoteMedia(nextRemoteMedia);
  }, []);

  const closePeerConnection = useCallback((participantId: string) => {
    const entry = peerEntriesRef.current.get(participantId);

    if (!entry) {
      return;
    }

    entry.pc.onicecandidate = null;
    entry.pc.ontrack = null;
    entry.pc.onconnectionstatechange = null;
    entry.pc.onnegotiationneeded = null;
    entry.pc.close();
    peerEntriesRef.current.delete(participantId);
    remoteStreamsRef.current.delete(participantId);
    commitRemoteMedia();
  }, [commitRemoteMedia]);

  const syncPeerTracks = useCallback(async (participantId: string) => {
    const entry = peerEntriesRef.current.get(participantId);

    if (!entry) {
      return;
    }

    const { audio, video } = readTracks(localStreamRef.current);
    await Promise.all([
      entry.audioTransceiver.sender.replaceTrack(audio),
      entry.videoTransceiver.sender.replaceTrack(video),
    ]);
  }, []);

  const ensurePeerConnection = useCallback((participantId: string, currentUserId: string) => {
    const existing = peerEntriesRef.current.get(participantId);

    if (existing) {
      return existing;
    }

    const pc = new RTCPeerConnection(rtcConfigurationRef.current);
    const remoteStream = new MediaStream();
    const entry: PeerEntry = {
      pc,
      polite: currentUserId.localeCompare(participantId) > 0,
      makingOffer: false,
      ignoreOffer: false,
      isSettingRemoteAnswerPending: false,
      audioTransceiver: pc.addTransceiver("audio", { direction: "sendrecv" }),
      videoTransceiver: pc.addTransceiver("video", { direction: "sendrecv" }),
    };

    pc.ontrack = (event) => {
      for (const track of event.streams[0]?.getTracks() ?? [event.track]) {
        if (!remoteStream.getTracks().some((candidate) => candidate.id === track.id)) {
          remoteStream.addTrack(track);
        }

        track.onended = () => {
          remoteStream.getTracks()
            .filter((candidate) => candidate.id === track.id)
            .forEach((candidate) => remoteStream.removeTrack(candidate));
          commitRemoteMedia();
        };
      }

      remoteStreamsRef.current.set(participantId, remoteStream);
      commitRemoteMedia();
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed") {
        try {
          pc.restartIce();
        } catch {
          // Ignore restart failures and let the polling loop recover.
        }
      }

      if (pc.connectionState === "closed") {
        remoteStreamsRef.current.delete(participantId);
      }

      commitRemoteMedia();
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate) {
        return;
      }

      void sendSignal(participantId, "ice-candidate", toSignalPayload(event.candidate.toJSON()))
        .catch((error) => {
          setTransportError(error instanceof Error ? error.message : "Failed to send ICE candidate.");
        });
    };

    pc.onnegotiationneeded = async () => {
      try {
        entry.makingOffer = true;
        await syncPeerTracks(participantId);
        await pc.setLocalDescription();

        if (!pc.localDescription) {
          return;
        }

        await sendSignal(
          participantId,
          pc.localDescription.type as "offer" | "answer",
          toSignalPayload(pc.localDescription.toJSON()),
        );
      } catch (error) {
        setTransportError(error instanceof Error ? error.message : "Failed to negotiate call transport.");
      } finally {
        entry.makingOffer = false;
      }
    };

    peerEntriesRef.current.set(participantId, entry);
    remoteStreamsRef.current.set(participantId, remoteStream);
    void syncPeerTracks(participantId).catch(() => undefined);
    commitRemoteMedia();

    return entry;
  }, [commitRemoteMedia, sendSignal, syncPeerTracks]);

  const processSignal = useCallback(async (
    signal: ChatMeetingSignalEnvelope,
    currentUserId: string,
  ) => {
    if (processedSignalIdsRef.current.has(signal.id) || signal.senderUserId === currentUserId) {
      return;
    }

    processedSignalIdsRef.current.add(signal.id);
    const entry = ensurePeerConnection(signal.senderUserId, currentUserId);
    const { pc } = entry;

    if (signal.type === "ice-candidate") {
      try {
        const candidate = signal.payload.candidate || signal.payload;
        await pc.addIceCandidate(candidate ? new RTCIceCandidate(candidate as RTCIceCandidateInit) : null);
      } catch (error) {
        if (!entry.ignoreOffer) {
          throw error;
        }
      }

      return;
    }

    const description = new RTCSessionDescription(signal.payload as unknown as RTCSessionDescriptionInit);
    const readyForOffer = !entry.makingOffer && (pc.signalingState === "stable" || entry.isSettingRemoteAnswerPending);
    const offerCollision = description.type === "offer" && !readyForOffer;

    entry.ignoreOffer = !entry.polite && offerCollision;

    if (entry.ignoreOffer) {
      return;
    }

    entry.isSettingRemoteAnswerPending = description.type === "answer";

    await pc.setRemoteDescription(description);
    entry.isSettingRemoteAnswerPending = false;

    if (description.type === "offer") {
      await syncPeerTracks(signal.senderUserId);
      await pc.setLocalDescription();

      if (!pc.localDescription) {
        return;
      }

      await sendSignal(signal.senderUserId, "answer", toSignalPayload(pc.localDescription.toJSON()));
    }
  }, [ensurePeerConnection, sendSignal, syncPeerTracks]);

  useEffect(() => {
    if (!enabled || !meeting || meeting.status !== "active" || !contactId || !selfParticipant) {
      return;
    }

    const currentSelf = selfParticipant;
    let cancelled = false;

    async function pollSignals() {
      try {
        const query = lastSignalAtRef.current && isFiniteTimestamp(lastSignalAtRef.current)
          ? `?after=${encodeURIComponent(lastSignalAtRef.current)}`
          : "";
        const response = await fetch(`/api/messages/threads/${contactId}/meeting/signals${query}`, {
          cache: "no-store",
        });
        const result = await readJsonSafely<{
          data?: ChatMeetingSignalEnvelope[];
          error?: string;
        }>(response);

        if (!response.ok || !result?.data) {
          throw new Error(result?.error || "Failed to refresh call transport.");
        }

        for (const signal of result.data) {
          if (cancelled) {
            return;
          }

          await processSignal(signal, currentSelf.id);
          lastSignalAtRef.current = signal.createdAt;
        }

        setTransportError("");
      } catch (error) {
        if (!cancelled) {
          setTransportError(error instanceof Error ? error.message : "Failed to refresh call transport.");
        }
      }
    }

    void pollSignals();
    const intervalId = window.setInterval(() => {
      void pollSignals();
    }, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [contactId, enabled, meeting, processSignal, selfParticipant]);

  useEffect(() => {
    if (!enabled || !meeting || meeting.status !== "active" || !selfParticipant) {
      return;
    }

    const currentSelf = selfParticipant;
    const activeRemoteIds = new Set(
      meeting.participants
        .filter((participant) => !participant.isCurrentUser)
        .map((participant) => participant.id),
    );

    for (const participantId of peerEntriesRef.current.keys()) {
      if (!activeRemoteIds.has(participantId)) {
        closePeerConnection(participantId);
      }
    }

    for (const participant of meeting.participants) {
      if (!participant.isCurrentUser) {
        ensurePeerConnection(participant.id, currentSelf.id);
      }
    }

    commitRemoteMedia();
  }, [closePeerConnection, commitRemoteMedia, enabled, ensurePeerConnection, meeting, selfParticipant]);

  useEffect(() => {
    if (!enabled || !meeting || meeting.status !== "active" || !selfParticipant || typeof navigator === "undefined") {
      stopStream(microphoneStreamRef.current);
      stopStream(cameraStreamRef.current);
      stopStream(screenStreamRef.current);
      microphoneStreamRef.current = null;
      cameraStreamRef.current = null;
      screenStreamRef.current = null;
      localStreamRef.current = null;
      setLocalStream(null);
      return;
    }

    const currentSelf = selfParticipant;
    let cancelled = false;

    async function syncLocalMedia() {
      const audioNeeded = currentSelf.micEnabled;

      try {
        if (audioNeeded && (!microphoneStreamRef.current || readTracks(microphoneStreamRef.current).audio === null)) {
          microphoneStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        }

        const microphoneTrack = readTracks(microphoneStreamRef.current).audio;

        if (microphoneTrack) {
          microphoneTrack.enabled = currentSelf.micEnabled;
        }
      } catch (error) {
        if (currentSelf.micEnabled) {
          void applyTransportPatch({ micEnabled: false });
        }

        if (!cancelled) {
          setTransportError(error instanceof Error ? error.message : "Microphone access was blocked.");
        }
      }

      try {
        if (meetingMode !== "video") {
          stopStream(cameraStreamRef.current);
          stopStream(screenStreamRef.current);
          cameraStreamRef.current = null;
          screenStreamRef.current = null;
        } else if (currentSelf.screenSharing) {
          stopStream(cameraStreamRef.current);
          cameraStreamRef.current = null;

          if (!screenStreamRef.current || readTracks(screenStreamRef.current).video === null) {
            screenStreamRef.current = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
            const displayTrack = readTracks(screenStreamRef.current).video;

            if (displayTrack) {
              displayTrack.onended = () => {
                void applyTransportPatch({ screenSharing: false });
              };
            }
          }
        } else if (currentSelf.cameraEnabled) {
          stopStream(screenStreamRef.current);
          screenStreamRef.current = null;

          if (!cameraStreamRef.current || readTracks(cameraStreamRef.current).video === null) {
            cameraStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });
          }
        } else {
          stopStream(cameraStreamRef.current);
          stopStream(screenStreamRef.current);
          cameraStreamRef.current = null;
          screenStreamRef.current = null;
        }
      } catch (error) {
        if (currentSelf.screenSharing) {
          void applyTransportPatch({ screenSharing: false });
        } else if (currentSelf.cameraEnabled) {
          void applyTransportPatch({ cameraEnabled: false });
        }

        if (!cancelled) {
          setTransportError(error instanceof Error ? error.message : "Video device access was blocked.");
        }
      }

      if (cancelled) {
        return;
      }

      const nextLocalStream = buildCombinedStream(
        microphoneStreamRef.current,
        screenStreamRef.current ?? cameraStreamRef.current,
      );

      localStreamRef.current = nextLocalStream;
      setLocalStream(nextLocalStream);
      await Promise.all(
        Array.from(peerEntriesRef.current.keys()).map((participantId) => syncPeerTracks(participantId)),
      );
      setTransportError("");
    }

    void syncLocalMedia();

    return () => {
      cancelled = true;
    };
  }, [
    applyTransportPatch,
    enabled,
    meeting,
    meetingMode,
    selfParticipant,
    syncPeerTracks,
  ]);

  useEffect(() => {
    return () => {
      for (const participantId of Array.from(peerEntriesRef.current.keys())) {
        closePeerConnection(participantId);
      }

      stopStream(microphoneStreamRef.current);
      stopStream(cameraStreamRef.current);
      stopStream(screenStreamRef.current);
      microphoneStreamRef.current = null;
      cameraStreamRef.current = null;
      screenStreamRef.current = null;
      localStreamRef.current = null;
    };
  }, [closePeerConnection]);

  useEffect(() => {
    processedSignalIdsRef.current.clear();
    lastSignalAtRef.current = null;
  }, [meeting?.id]);

  const remoteMediaById = useMemo(
    () => Object.fromEntries(remoteMedia.map((entry) => [entry.participantId, entry])) as Record<string, RemoteMeetingMedia>,
    [remoteMedia],
  );

  return {
    localStream,
    remoteMedia,
    remoteMediaById,
    transportError,
  };
}

export type MeetingRemoteMedia = RemoteMeetingMedia;
