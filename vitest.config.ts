import { defineConfig } from 'vitest/config';

// Boundary tests only: the preview server's file boundary (scripts/static-files.test.ts) and the works importer's
// validation (scripts/works-validate.test.ts).
export default defineConfig({
  test: {
    include: ['scripts/**/*.test.ts'],
    environment: 'node',
  },
});
