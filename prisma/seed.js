import prisma from '../src/utils/prisma.js';

export async function createUserIfNotExists(userData) {
  const existingUser = await prisma.user.findUnique({
    where: { username: userData.username },
  });
  if (existingUser) {
    console.log(`  User "${userData.username}" already exists. Skipping.`);
    return;
  }
  await prisma.user.create({
    data: userData,
  });
  console.log(`  Created user "${userData.username}".`);
}

// Passwords are password when not encrypted
async function main() {
  console.log('\n🌱 Starting database seeding...');
  await createUserIfNotExists({
    username: 'admin',
      displayName: 'admin',
      password: '$2b$10$04xyjuFXfrfEqjY.hyzWR.Cx3dtzHsf6T1.9hBcIzmCfrqL5tKg2S',
      role: 'ADMIN',
      settings: { create: {} },
  });
  await createUserIfNotExists({
    username: 'user1',
      displayName: 'user',
      password: '$2b$10$04xyjuFXfrfEqjY.hyzWR.Cx3dtzHsf6T1.9hBcIzmCfrqL5tKg2S',
      role: 'BASIC',
      settings: { create: {} },
  });
  await createUserIfNotExists({
    username: 'user2',
      displayName: 'user',
      password: '$2b$10$04xyjuFXfrfEqjY.hyzWR.Cx3dtzHsf6T1.9hBcIzmCfrqL5tKg2S',
      role: 'BASIC',
      settings: { create: {} },
  });
  await createUserIfNotExists({
    username: 'user3',
      displayName: 'user',
      password: '$2b$10$04xyjuFXfrfEqjY.hyzWR.Cx3dtzHsf6T1.9hBcIzmCfrqL5tKg2S',
      role: 'BASIC',
      settings: { create: {} },
  });
  await createUserIfNotExists({
    username: 'user3',
      displayName: 'user',
      password: '$2b$10$04xyjuFXfrfEqjY.hyzWR.Cx3dtzHsf6T1.9hBcIzmCfrqL5tKg2S',
      role: 'BASIC',
      settings: { create: {} },
  });
  await createUserIfNotExists({
    username: 'cvan',
    displayName: 'Chris',
    password: '$2b$10$04xyjuFXfrfEqjY.hyzWR.Cx3dtzHsf6T1.9hBcIzmCfrqL5tKg2S',
    role: 'BASIC',
    sessions: {
      create: {
        startTime: '2024-01-08T17:00:00.000-04:00',
        endTime: '2024-01-09T22:00:00.000-04:00',
      },
    },
    settings: { create: {} },
  });
 
  console.log('✅ Seeding finished successfully.\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
