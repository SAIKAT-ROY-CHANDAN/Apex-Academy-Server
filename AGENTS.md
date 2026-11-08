# AGENTS.md — EIMS Server

## Stack

Express 5 + TypeScript (CommonJS, ES2023) + Prisma 7 + MariaDB (via `@prisma/adapter-mariadb`).
Validation: Zod. Auth: JWT (access + refresh). Uploads: Multer memory → Sharp WebP.

## Commands

```bash
npm run build            # tsc → dist/
npm run start:dev        # tsx watch ./src/app.ts  (port 5000)
npm run start:prod       # node ./dist/src/app.js
npm run lint             # eslint .
npm run lint:fix         # eslint . --fix
npm run prettier         # format src/
npm run prisma:migrate   # migrate dev + generate
npm run seed-permissions # seed permission strings
npm run seed-super-admin # seed permissions + Super Admin role + admin user
```

No test suite exists. No CI config found.

## Architecture

**Entry point:** `src/app.ts` → mounts all routes under `/api/v1`.

**Module pattern** (56 modules in `src/app/modules/<name>/`):
```
<name>.routes.ts      ← Express Router
<name>.controller.ts  ← thin handler, wrapped in catchAsync()
<name>.service.ts     ← business logic + Prisma queries
<name>.validation.ts  ← Zod schemas (optional)
<name>.type.ts        ← TS interfaces (optional)
```

Route chain: `auth()` → `permission()` → `multer()` → `parseFormData()` → `validation()` → controller → service → Prisma.

**Central router:** `src/app/routes/index.ts` — maps path prefixes to module routers.

## Key Conventions

- **Prisma client** is generated to `generated/prisma/` (not `node_modules/.prisma`). Import via `../../generated/prisma/client`.
- **Enums** for Zod validation: import from `generated/prisma/enums.ts` and use `z.nativeEnum(...)`.
- **Permissions** are typed constants in `src/app/constant/permissions.ts`. Always reference these, not raw strings.
- **Three auth types:** `'administrator' | 'teacher' | 'student'`. Teachers/students bypass RBAC permission checks entirely.
- **Teachers** login by phone; **admins and students** login by email.
- **Response format:** always use `sendResponse()` — returns `{ success, statusCode, message, meta?, data, token? }`.
- **Query builder:** `buildPrismaQuery()` in `src/app/builders/prismaBuilderQuery.ts` for paginated/searchable/sortable list endpoints.
- **Images** are converted to WebP (quality 80) and saved to `public/images/`. Documents go to `public/files/`.
- **FormData:** when sending nested objects via multipart, stringify them — `parseFormData` middleware handles this.

## DB Schema

- All models use `@id @default(uuid())`, timestamps `created_at`/`updated_at`, and `@@map("snake_case_plural")`.
- Cascade deletes on most FK relationships.
- Institution supports two modes: `SCHOOL` and `COLLEGE_UNIVERSITY` — college mode uses `Program` and `Department` models.
- `InstitutionConfig.active_modules` (JSON) toggles feature modules (ACADEMICS, PAYROLL, FINANCE, HOSTEL, WEBSITE).

## Gotchas

- `permission()` middleware is a no-op for teachers and students — they are implicitly authorized if `auth()` passes.
- `globalErrorHandler` leaks `stack` traces in responses.
- `routes/index.ts` has duplicate route registrations for some paths (later registration shadows earlier).
- No `.env.example` — see `.env` for required vars (DATABASE_URL, JWT secrets, ADMIN_* creds).
- `prisma.config.ts` is excluded from ESLint.
- The `generated/` directory is gitignored — run `prisma:migrate` (or `npx prisma generate`) after pulling to regenerate.
- `public/images` and `public/files` are gitignored — `ensureUploadDirs()` creates them on startup.

## New Module Checklist

Recipe for adding a feature module end-to-end (reference implementations:
`institutionInvoiceSetting` = singleton settings with image upload,
`hostel-allocation` = CRUD with query builder):

1. **Prisma schema** (`prisma/schema.prisma`): add the model with `@id @default(cuid())|uuid()`,
   `created_at`/`updated_at` timestamps, `@@map("snake_case_plural")`. Run
   `npx prisma migrate dev --name <descriptive_name>` (the npm script is interactive — pass `--name`).
2. **Module folder** `src/app/modules/<kebab-or-camel-name>/` with up to 5 files:
   `<name>.routes.ts`, `<name>.controller.ts`, `<name>.service.ts`, `<name>.validation.ts`, `<name>.type.ts`.
   - Controller: wrap handlers in `catchAsync()`, respond with `sendResponse()`.
   - Service: Prisma queries; throw `AppError(status, message)` for expected failures.
   - Validation: `z.object({ body: z.object({ ... }) })` — the `validation()` middleware parses `{ body: req.body }`.
3. **If the module accepts uploads:** add every multipart field name to the
   `IMAGE_FIELDS` or `FILE_FIELDS` whitelist in `src/app/middlewares/multer.ts`
   (unknown field names are rejected by `fileFilter`). In the controller convert
   files to URLs with `getSingleImageUrl()` / `getMultipleImageUrls()` /
   `getSinglePdfUrl()` from `src/app/utils/getUrl.ts` and merge into `req.body`.
4. **Register the router** in `src/app/routes/index.ts`: import it, add
   `{ path: '/<kebab-route>', route: <Name>Routes }` to `moduleRoutes`.
5. **Auth/permissions:** route chain `auth('administrator')` → `upload...` → `processUploads`
   → `validation(...)` → controller. Add permission strings to
   `src/app/constant/permissions.ts` and uncomment the `permission()` call when RBAC is wired
   (several older modules ship with it commented out).
6. **Singleton settings modules** (one config row, not a table of rows): read via
   `findFirst({ orderBy: { createdAt: 'asc' } })`, and have the frontend create-once /
   update-afterwards based on whether a record exists (see `institutionInvoiceSetting`).
7. Verify with `npm run build` (includes `tsc`); lint with `npm run lint`.

## File Structure Quick Reference

```
src/app.ts                          ← entry point
src/app/routes/index.ts             ← central router
src/app/modules/                    ← 56 feature modules
src/app/builders/prismaBuilderQuery.ts
src/app/configs/index.ts            ← env config (dotenv)
src/app/constant/permissions.ts     ← RBAC permission strings
src/app/middlewares/                 ← auth, permission, validation, multer, error handlers
src/app/utils/                      ← catchAsync, sendResponse, JWT helpers, email, file utils
src/app/errors/                     ← AppError, Prisma error mapper, Zod error mapper
src/app/types/                      ← global Express augmentation, shared types
src/db/db.config.ts                 ← PrismaClient singleton
src/db/seed.ts                      ← seed permissions
src/db/seedSuperAdmin.ts            ← seed Super Admin + all permissions
prisma/schema.prisma                ← full DB schema (~1400 lines)
generated/prisma/                   ← generated Prisma client (gitignored)
```
