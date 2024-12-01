import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensure relative paths are used
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html',
        project1: './src/project1/index.html',
        project2: './src/project2/index.html',
        project3: './src/project3/index.html',
      },
      external: [],
    },
  },
  optimizeDeps: {
    include: ['three'],
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  plugins: [
    {
      name: 'configure-response-headers',
      configureServer: server => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          next();
        });
      },
    },
  ],
});
