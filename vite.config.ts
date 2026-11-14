import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    {
      name: 'backup-directory-index',
      configureServer(server) {
        // Serve the same public directory indexes as the production static host.
        server.middlewares.use((req, _res, next) => {
          const [pathname, query] = (req.url ?? '').split(/\?(.*)/s);
          if (/^\/backup(?:\/(?:privacy|terms))?\/?$/.test(pathname)) {
            req.url = pathname.replace(/\/?$/, '/index.html') + (query ? '?' + query : '');
          }
          next();
        });
      },
    },
    reactRouter(),
    tsconfigPaths(),
  ],
  publicDir: 'public', // Ensure public directory is copied to build
  build: {
    assetsInlineLimit: 0, // Don't inline any assets
  },
});
