export function statusFromMeetingError(error: unknown) {
  const message = error instanceof Error ? error.message.trim() : "";

  if (!message) {
    return 500;
  }

  if (
    message.includes("required")
    || message.includes("Invalid")
    || message.includes("cannot remove themselves")
    || message.includes("must end the call")
  ) {
    return 400;
  }

  if (
    message.includes("Only the meeting host")
    || message.includes("removed from this meeting")
    || message.includes("must be in the meeting")
    || message.includes("use call transport")
  ) {
    return 403;
  }

  if (
    message.includes("could not be found")
    || message.includes("not part of this workspace")
    || message.includes("not found")
  ) {
    return 404;
  }

  return 500;
}
