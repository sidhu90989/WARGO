import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
      '@': path.resolve(__dirname, 'client', 'src'),
      '@app': path.resolve(__dirname, 'apps'),
    },
  },
  test: {
    root: '.',
    include: [
      'shared/__tests__/**/*.test.ts',
    ],
    environment: 'node',
    coverage: {
      enabled: false,
    },
  },
});
