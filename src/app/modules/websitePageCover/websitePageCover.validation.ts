import z from 'zod';

const upsertWebsitePageCoverValidation = z.object({
  body: z.object({}).passthrough(),
});

export const WebsitePageCoverValidation = {
  upsertWebsitePageCoverValidation,
};
