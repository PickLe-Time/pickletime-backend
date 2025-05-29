import prisma from '../../utils/prisma.js';

// Get all sessions
export async function handleGetSessions(req, reply) {
  const sessions = await prisma.session.findMany({
    select: {
      id: true,
      creationDate: true,
      startTime: true,
      endTime: true,
      userId: true,
      user: {
        select: {
          username: true,
          displayName: true,
        }
      },
    },
  });
  return reply.code(200).send(sessions);
}

// Get session that match session id
export async function handleGetSessionsBySessionID(req, reply) {
  const { id } = req.params;
  const session = await prisma.session.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      creationDate: true,
      startTime: true,
      endTime: true,
      user: {
        select: {
          username: true,
          displayName: true,
        }
      },
    },
  });
  if (!session) {
    return reply.code(404).send({ error: 'Session not found' });
  }
  const { user, ...sessionFields } = session;  // separate user from session object
  return reply.code(200).send({...sessionFields, ...user});
}

// Updates existing session.
export async function handleUpdateSession(req, reply) {
  const { id } = req.params;
  const {
     startTime, endTime, userId, ...props
  } = req.body;
  // Validate data
  if (startTime > endTime) {
    return reply.code(400).send({
      message: 'Start time cannot be after end time',
    });
  }
  // Check if user exists
  const foundUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!foundUser) {
    return reply.code(404).send({
      message: 'User not found',
    });
  }
  // Update session
  try {
    const session = await prisma.session.update({
      where: {
        id,
      },
      data: {
        ...props,
        startTime,
        endTime,
        userId: userId,
      },
    });
    return reply.code(200).send(session);
  } catch (e) {
    return reply.code(500).send(e);
  }
}

// Delete sessions that matches id
export async function handleDeleteSession(req, reply) {
  const { id } = req.params;
  await prisma.session.delete({
    where: {
      id: id,
    },
  });
  return reply.code(204).send();
}
