import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '../../utils/prisma.js';
import { flattenSessionsWithUser } from '../../utils/flattenSessionsWithUser.js';

const SALT_ROUNDS = 10;

// Creates a new user. Checks if username is unique, hashes passwrd,
// and creates user in db.
export async function handleCreateUser(req, reply) {
  let { username, displayName } = req.body;
  const { password } = req.body;
  // Validate data
  username = username.toLowerCase();
  // Error message  if user already exists
  const foundUser = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  if (foundUser) {
    return reply.code(401).send({
      message: 'User already exists with this username',
    });
  }
  // If no display name, set to username
  if (!displayName) displayName = username;
  // Hashes password and creates user in db
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        username,
        displayName,
        password: hash,
        role: 'BASIC',
        settings: { create: {} },
      },
    });

    return reply.code(201).send(user);
  } catch (e) {
    return reply.code(500).send(e);
  }
}

// Get users that match username
export async function handleGetUsers(req, reply) {
  const users = await prisma.user.findMany({
    select: {
      username: true,
      password: true,
      id: true,
      displayName: true,
      role: true,
      sessions: true,
    },
  });
  return reply.code(200).send(users);
}

// Get user by id
export async function handleGetUserByID(req, reply) {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      username: true,
      id: true,
      displayName: true,
      role: true,
    },
  });
  if (!user) {
    return reply.code(404).send({
      message: 'User not found',
    });
  }
  return reply.code(200).send(user);
}

// Updates existing user.
export async function handleUpdateUser(req, reply) {
  const { id } = req.params;
  let { username } = req.body;
  const { password, ...props } = req.body;
  let newPassword = password;
  // Validate data
  username = username.toLowerCase();
  // Hashes password and updates user in db
  try {
    // If new password, hash new.
    const oldUsersList = await prisma.user.findMany({
      where: {
        id,
      },
      select: {
        password: true,
        refreshToken: true,
      },
    });
    if (oldUsersList.length <= 0) return reply.code(404).send();
    const oldUser = oldUsersList[0];
    if (password !== oldUser?.password) {
      newPassword = await bcrypt.hash(password, SALT_ROUNDS);
    }
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        ...props,
        username,
        password: newPassword,
        refreshToken: oldUser.refreshToken,
      },
    });
    return reply.code(200).send(user);
  } catch (e) {
    return reply.code(500).send(e);
  }
}

// Patches existing user.
export async function handlePatchUserByID(req, reply) {
  const { id: userID } = req.params;
  let { username } = req.body;
  const { password, settings, ...props } = req.body;

  // Validate data
  if (username != null) username = username.toLowerCase();

  let newPassword = password;
  try {
    // Hashes password and updates user in db
    if (password != null) {
      // If new password, hash new.
      const oldUsersList = await prisma.user.findMany({
        where: {
          id: userID,
        },
        select: {
          password: true,
        },
      });
      if (oldUsersList.length <= 0) return reply.code(404).send();
      const oldUser = oldUsersList[0];
      if (password !== oldUser?.password) {
        newPassword = await bcrypt.hash(password, SALT_ROUNDS);
      }
    }

    // Patch user
    const user = await prisma.user.update({
      where: {
        id: userID,
      },
      data: {
        ...props,
        username,
        password: newPassword,
        ...(settings && {
          settings: {
            update: settings,
          },
        }),
      },
      include: {
        settings: true,
      },
    });
    const filteredUser = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      settings: user.settings
        ? {
            id: user.settings.id,
            theme: user.settings.theme,
            color: user.settings.color,
          }
        : null,
    };
    return reply.code(200).send(filteredUser);
  } catch (e) {
    return reply.code(500).send(e);
  }
}

// Delete user that matches username
export async function handleDeleteUser(req, reply) {
  let { id } = req.params;
  // Check if user exists
  const foundUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  if (!foundUser) {
    return reply.code(404).send({
      message: 'User not found',
    });
  }
  // Delete user
  await prisma.user.delete({
    where: {
      id,
    },
  });
  return reply.code(204).send();
}

// Get sessions that match user id
export async function handleGetSessionsByUser(req, reply) {
  let { id } = req.params;
  // Check if user exists
  const foundUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  if (!foundUser) {
    return reply.code(404).send({
      message: 'User not found',
    });
  }
  const sessions = await prisma.session.findMany({
    where: {
      user: { id },
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });
  // Flatten nested values
  const formattedSessions = flattenSessionsWithUser(sessions);

  return reply.code(200).send(formattedSessions);
}

// Create sessions from user /api/users/:id/sessions/
export async function handlePostSessionsByUser(req, reply) {
  let { id : userId} = req.params;
  let { id : sessionID } = req.body;
  const { startTime, endTime, username } = req.body;
  // Validate start time is before end time
  if (startTime > endTime) {
    return reply.code(400).send({
      message: 'Start time cannot be after end time',
    });
  }

  if (!sessionID) sessionID = crypto.randomUUID();
  // Check if user exists
  const foundUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!foundUser) {
    // If username is provided, check if user exists by username
    if (username) {
      const foundUserByUsername = await prisma.user.findUnique({
        where: {
          username: username.toLowerCase(),
        },
      });
      if (foundUserByUsername) {
        userId = foundUserByUsername.id;
      } else {
        return reply.code(404).send({
          message: 'User not found',
        });
      }
    }
  }
  // Create session
  try {
    const session = await prisma.session.create({
      data: {
        id: sessionID,
        userId: userId,
        startTime,
        endTime,
      },
    });
    return reply.code(201).send({...session});
    // return reply.code(201).send({...session, username: foundUser.username});
  } catch (e) {
    return reply.code(500).send(e);
  }
}

// User Settings
// Get user settings by username
export async function handleGetSettingByUsername(req, reply) {
  const { username } = req.params;
  const settings = await prisma.setting.findUnique({
    where: {
      username,
    },
    select: {
      theme: true,
      color: true,
    },
  });
  return reply.code(200).send(settings);
}

// Update existing user settings by username
export async function handleUpdateSettingByUsername(req, reply) {
  const { username } = req.params;
  const { theme, color, ...props } = req.body;
  // Validate data
  if (theme.toLowerCase() !== 'dark' && theme.toLowerCase() !== 'light') {
    return reply.code(400).send({
      message: 'Theme must be either light or dark',
    });
  }

  const re = /^#[0-9A-F]{6}$/i;

  if (!(re.test(color))) {
    return reply.code(400).send({
      message: 'Color must valid hex',
    });
  }

  // Check if user exists
  const validatedUsername = username.toLowerCase();
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
  // Update settings
  try {
    const session = await prisma.setting.update({
      where: {
        username: foundUser.username,
      },
      data: {
        ...props,
        color,
        theme: theme.toUpperCase(),
        username: validatedUsername,
      },
    });
    return reply.code(200).send(session);
  } catch (e) {
    return reply.code(500).send(e);
  }
}
