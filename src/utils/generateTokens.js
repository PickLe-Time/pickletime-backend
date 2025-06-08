// Generate JWT access and refresh tokens for user, sets cookie, and saves to DB
export async function generateTokens({ user, reply, prisma }) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  const accessToken = await reply.jwtSign(payload, { expiresIn: '15m' });
  const refreshToken = await reply.jwtSign(payload, { expiresIn: '7d' });

  await prisma.user.update({
    where: { username: user.username },
    data: { refreshToken },
  });

  reply.setCookie('refreshJWT', refreshToken, {
    path: '/',
    maxAge: 24 * 60 * 60 * 7,  // 7 days
    httpOnly: true,
    sameSite: 'None',
    secure: true,
  });

  return accessToken;
}
