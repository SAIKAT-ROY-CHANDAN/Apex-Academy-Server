import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client';

const databaseUrl = process.env.DATABASE_URL || '';

let adapter: any;

if (
  databaseUrl.startsWith('postgresql://') ||
  databaseUrl.startsWith('postgres://')
) {
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 10,
  });
  adapter = new PrismaPg(pool);
} else {
  const getBooleanEnv = (
    value: string | undefined,
    fallback: boolean,
  ): boolean => {
    if (value === undefined) return fallback;
    return value.toLowerCase() === 'true';
  };
  const parsedDatabaseUrl = databaseUrl ? new URL(databaseUrl) : null;
  const resolvedHost =
    process.env.DATABASE_HOST ?? parsedDatabaseUrl?.hostname;
  const resolvedUser =
    process.env.DATABASE_USER ??
    (parsedDatabaseUrl?.username
      ? decodeURIComponent(parsedDatabaseUrl.username)
      : undefined);
  const resolvedPassword =
    process.env.DATABASE_PASSWORD ??
    (parsedDatabaseUrl?.password
      ? decodeURIComponent(parsedDatabaseUrl.password)
      : undefined);
  const resolvedDatabase =
    process.env.DATABASE_NAME ?? parsedDatabaseUrl?.pathname.replace(/^\//, '');
  const resolvedPort =
    process.env.DATABASE_PORT !== undefined
      ? Number(process.env.DATABASE_PORT)
      : parsedDatabaseUrl?.port
        ? Number(parsedDatabaseUrl.port)
        : undefined;

  const host = resolvedHost === 'localhost' ? '127.0.0.1' : resolvedHost;

  const adapterOptions: any = {
    host,
    user: resolvedUser,
    password: resolvedPassword,
    database: resolvedDatabase,
    port: Number.isFinite(resolvedPort) ? resolvedPort : undefined,
    connectionLimit: 10,
    allowPublicKeyRetrieval: getBooleanEnv(
      process.env.DB_ALLOW_PUBLIC_KEY_RETRIEVAL,
      true,
    ),
  };

  if (process.env.DB_RSA_PUBLIC_KEY) {
    adapterOptions.rsaPublicKey = process.env.DB_RSA_PUBLIC_KEY;
  }
  if (process.env.DB_CACHING_RSA_PUBLIC_KEY) {
    adapterOptions.cachingRsaPublicKey = process.env.DB_CACHING_RSA_PUBLIC_KEY;
  }

  adapter = new PrismaMariaDb(adapterOptions);
}

const prisma = new PrismaClient({ adapter });

export default prisma;
