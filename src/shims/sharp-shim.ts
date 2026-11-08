/**
 * Cloudflare Workers shim for sharp.
 * Sharp is a C++ native library that cannot run inside V8 isolates.
 * When running in Cloudflare Workers, this shim provides no-op methods
 * to prevent startup crashes.
 */
const sharpShim = (input?: any) => {
  return {
    webp: () => ({
      toFile: async () => ({}),
      toBuffer: async () => input,
    }),
    jpeg: () => ({
      toFile: async () => ({}),
      toBuffer: async () => input,
    }),
    png: () => ({
      toFile: async () => ({}),
      toBuffer: async () => input,
    }),
    resize: () => sharpShim(input),
    toFile: async () => ({}),
    toBuffer: async () => input,
  };
};

export default sharpShim;
