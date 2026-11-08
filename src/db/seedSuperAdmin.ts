import 'dotenv/config';
import bcrypt from 'bcryptjs';
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

  if (permissionsToCreate.length > 0) {
    await prisma.permission.createMany({
      data: permissionsToCreate.map((permission) => ({ permission })),
      skipDuplicates: true,
    });
  }
};

const seedSuperAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME;

  if (!adminEmail || !adminPassword || !adminName) {
    throw new Error(
      'ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME must be set in the environment',
    );
  }

  await seedPermissions();

  const permissionRecords = await prisma.permission.findMany({
    select: {
      id: true,
      permission: true,
    },
  });

  const roleName = 'Super Admin';

  const existingRole = await prisma.role.findFirst({
    where: {
      role_name: roleName,
    },
  });

  const role =
    existingRole ??
    (await prisma.role.create({
      data: {
        role_name: roleName,
      },
    }));

  await prisma.rolePermission.deleteMany({
    where: {
      roleId: role.id,
    },
  });

  if (permissionRecords.length > 0) {
    await prisma.rolePermission.createMany({
      data: permissionRecords.map((permission) => ({
        roleId: role.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const administrator = await prisma.administrator.upsert({
    where: {
      email: adminEmail,
    },
    update: {
      name: adminName,
      password: hashedPassword,
      is_active: true,
    },
    create: {
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      is_active: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId: administrator.id,
    },
    update: {
      roleId: role.id,
    },
    create: {
      userId: administrator.id,
      roleId: role.id,
    },
  });

  process.stdout.write('Super admin seeded successfully.\n');
};

const run = async () => {
  const command = process.argv[2];

  if (command !== 'seed-super-admin') {
    process.stdout.write(
      'Usage: tsx src/db/seedSuperAdmin.ts seed-super-admin\n',
    );
    return;
  }

  await seedSuperAdmin();
};

run()
  .catch((error) => {
    process.stderr.write(`Seed process failed: ${String(error)}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
