import 'dotenv/config';
import prisma from './db.config';
import { allPermissions } from '../app/constant/permissions';

const seedPermissions = async () => {
  const existingPermissions = await prisma.permission.findMany({
    select: {
      permission: true,
    },
  });

  const existingPermissionSet = new Set(
    existingPermissions.map((item) => item.permission),
  );

  const permissionsToCreate = allPermissions.filter(
    (permission) => !existingPermissionSet.has(permission),
  );

  if (permissionsToCreate.length === 0) {
    console.log('No new permissions to seed.');
    return;
  }

  await prisma.permission.createMany({
    data: permissionsToCreate.map((permission) => ({ permission })),
    skipDuplicates: true,
  });

  console.log(`Seeded ${permissionsToCreate.length} permissions.`);
};

const run = async () => {
  const command = process.argv[2];

  if (command !== 'seed-permissions') {
    console.log('Usage: tsx src/db/seed.ts seed-permissions');
    return;
  }

  await seedPermissions();
};

run()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
