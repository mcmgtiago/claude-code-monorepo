"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type ShellCountsPayload = {
  unreadNotificationsCount?: number;
};

const notificationsCountEventName = "crm-notifications-unread-changed";

export function ReminderDeliveryPoller({
  initialUnreadNotificationsCount
}: {
  initialUnreadNotificationsCount: number;
}) {
  const router = useRouter();
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioEnabledRef = useRef(false);
  const unreadCountRef = useRef(initialUnreadNotificationsCount);

  useEffect(() => {
    unreadCountRef.current = initialUnreadNotificationsCount;
  }, [initialUnreadNotificationsCount]);

  useEffect(() => {
    const unlockAudio = async () => {
      const AudioContextCtor = window.AudioContext;

      if (!AudioContextCtor) {
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextCtor();
      }

      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume().catch(() => undefined);
      }

      audioEnabledRef.current = audioContextRef.current.state === "running";
    };

    const playNotificationTone = () => {
      const context = audioContextRef.current;

      if (!context || context.state !== "running") {
        return;
      }

      const gainNode = context.createGain();
      gainNode.connect(context.destination);
      gainNode.gain.setValueAtTime(0.0001, context.currentTime);

      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1320, context.currentTime + 0.18);
      oscillator.connect(gainNode);

      gainNode.gain.exponentialRampToValueAtTime(0.11, context.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.34);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.36);
    };

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const syncUnreadCount = (count: number) => {
      window.dispatchEvent(new CustomEvent(notificationsCountEventName, { detail: { count: Math.max(0, count) } }));
    };

    const run = () => {
      void (async () => {
        try {
          const response = await fetch("/api/app-shell/counts", {
            cache: "no-store"
          });

          if (!response.ok) {
            return;
          }

          const payload = (await response.json().catch(() => null)) as ShellCountsPayload | null;
          const nextUnreadCount = Math.max(0, payload?.unreadNotificationsCount || 0);
          const previousUnreadCount = unreadCountRef.current;
          unreadCountRef.current = nextUnreadCount;

          if (!cancelled && nextUnreadCount !== previousUnreadCount) {
            syncUnreadCount(nextUnreadCount);
            router.refresh();
          }

          if (!cancelled && nextUnreadCount > previousUnreadCount && audioEnabledRef.current) {
            playNotificationTone();
          }
        } catch {
          // Silent retry on next poll.
        }
      })();
    };

    const enableAudio = () => {
      void unlockAudio();
    };

    window.addEventListener("pointerdown", enableAudio, { passive: true });
    window.addEventListener("keydown", enableAudio);

    const timeoutId = setTimeout(() => {
      if (cancelled) {
        return;
      }

      run();
      intervalId = setInterval(run, 60_000);
    }, 15_000);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      window.removeEventListener("pointerdown", enableAudio);
      window.removeEventListener("keydown", enableAudio);
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        void audioContextRef.current.close().catch(() => undefined);
      }
    };
  }, [router]);

  return null;
}
