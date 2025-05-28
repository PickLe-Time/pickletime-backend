// Flatten sessions array with nested user values
export function flattenSessionsWithUser(sessions) {
  if (!sessions || sessions.length === 0) {
    return [];
  }

  return sessions.map(s => ({
    id: s.id,
    creationDate: s.creationDate,
    startTime: s.startTime,
    endTime: s.endTime,
    userId: s.userId,
    ...s.user
  }));
}

