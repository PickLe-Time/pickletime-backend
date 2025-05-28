import prisma from '../../utils/prisma.js';
import { flattenSessionsWithUser } from '../../utils/flattenSessionsWithUser.js';


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
  return reply.code(200).send(flattenSessionsWithUser(sessions));
}

// Get session that match session id
export async function handleGetSessionsBySessionID(req, reply) {
  const { sessionid } = req.params;
  const session = await prisma.session.findUnique({
    where: {
      id: sessionid,
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
    username, startTime, endTime, ...props
  } = req.body;
  // Validate data
  const validatedUsername = username.toLowerCase();
  if (startTime > endTime) {
    return reply.code(400).send({
      message: 'Start time cannot be after end time',
    });
  }
  // Check if user exists
  const foundUser = await prisma.user.findUnique({
    where: {
      username: validatedUsername,
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
        username: validatedUsername,
      },
    });
    return reply.code(200).send(session);
  } catch (e) {
    return reply.code(500).send(e);
  }
}

// Delete sessions that matches sessionid
export async function handleDeleteSession(req, reply) {
  const { sessionid } = req.params;
  await prisma.session.delete({
    where: {
      id: sessionid,
    },
  });
  return reply.code(204).send();
}
