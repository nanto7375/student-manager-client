import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  publicDir: 'public', // Ensure public directory is copied to build
  build: {
    assetsInlineLimit: 0, // Don't inline any assets
  },
});
