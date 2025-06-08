import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../../utils/prisma.js';
import { generateTokens } from '../../utils/generateTokens.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Login user. Checks if user already exists, password matches
export async function handleLogin(req, reply) {
  let { username } = req.body;
  const { password } = req.body;
  // Validate user data.
  username = username.toLowerCase();
  // Get if user already exists
  const user = await prisma.user.findUnique({ where: { username } });
  // Check if password matches user
  const isMatch = user && (await bcrypt.compare(password, user.password));
  // If no user exists or user doesn't match password. invalid message
  if (!user || !isMatch) {
    return reply.code(401).send({
      message: 'Invalid username or password',
    });
  }
  // Create jwt access and refresh tokens
  const accessToken = await generateTokens({ user, reply, prisma });

  // Return access id, token, username, displayName, and role
  return {
    id: user.id,
    accessToken,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };
}

// Handle Google login. Upsert user in DB, create access token, and return user data
export async function handleGoogleLogin(req, reply) {
  const { token } = req.body;

  try {
    // Get token info from Google
    const ticket = await client.getTokenInfo(token);

    // Set user data from Google token
    const email = ticket.email;
    const googleId = ticket.sub;
    const username = email.split('@')[0].toLowerCase();
    const displayName = username;

    if (!email || !googleId) {
      return reply.code(400).send({ message: 'Invalid Google token' });
    }
    // Check if user already exists in DB
    const existingUser = await prisma.user.findUnique({ where: { username } });
    // Upsert user in DB
    const user = await prisma.user.upsert({
      where: { username },
      update: {
        displayName: existingUser?.displayName || username,
      },
      create: {
        // googleId,
        username,
        displayName,
        password: "12398u1y23dsjkasbupassword", // FIXME: Placeholder password
        role: 'BASIC',
        settings: { create: {} },
      },
    });
    // Set JWT payload
    const accessToken = await generateTokens({ user, reply, prisma });
    return reply.code(200).send({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    accessToken,
  });
  } catch {
    return reply.code(401).send({ message: 'Invalid Google token' });
  }
}

// Logout. Clears cookies and DB refresh token. Client must delete accessToken
export async function handleLogout(req, reply) {
  const { cookies } = req;
  // No content to clear
  if (!cookies?.refreshJWT) return reply.code(204).send();
  // If refresh token in DB, clear DB
  const refreshToken = cookies.refreshJWT;
  const foundUser = await prisma.user.findUnique({
    where: { refreshToken },
  });
  if (foundUser) {
    // Clear DB refresh token
    await prisma.user.update({
      where: { refreshToken },
      data: { refreshToken: null },
    });
  }
  // Clear cookies
  reply.clearCookie('refreshJWT', {
    path: '/',
    httpOnly: true,
    sameSite: 'None',
    secure: true,
  });
  return reply.code(200).send();
}

//  Gives new access token if refresh token is still valid
export async function handleRefresh(req, reply) {
  const { cookies } = req;
  // Check if cookie exists with jwt
  if (!cookies?.refreshJWT) {
    return reply.code(401).send({
      message: 'No cookie',
    });
  }
  const refreshToken = cookies.refreshJWT;
  // Get if user has refresh token saved in DB
  const foundUser = await prisma.user.findUnique({
    where: { refreshToken },
  });
  // If no user found, error
  if (!foundUser) {
    return reply.code(403).send('No user found');
  }
  // Get user settings
  const userSettings = await prisma.setting.findUnique({
    where: {
      username: foundUser.username,
    },
  });
  // Evaluate JWT
  const payload = {
    id: foundUser.id,
    username: foundUser.username,
    role: foundUser.role,
  };
  req.jwt.verify(
    refreshToken,
    process.env.JWT_TOKEN_SECRET,
    (err, decoded) => {
      // Check if token is valid or token doesn't match user
      if (err || foundUser.username !== decoded.username) {
        return reply.code(403).send({ message: 'Invalid token' });
      }
      return reply.code(200);
    },
  );
  const accessToken = await reply.jwtSign(payload, { expiresIn: '15m' });
  return reply.code(200).send({
    id: foundUser.id,
    username: foundUser.username,
    displayName: foundUser.displayName,
    role: foundUser.role,
    color: userSettings.color,
    theme: userSettings.theme,
    accessToken,
  });
}
