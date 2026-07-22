import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
  },
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    {
      name: 'api-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/my-videos')) {
            try {
              const handlerModule = await server.ssrLoadModule('./api/my-videos.ts');
              const handler = handlerModule.default;
              
              const vercelRes = {
                status(statusCode: number) {
                  res.statusCode = statusCode;
                  return this;
                },
                json(data: any) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return this;
                },
                setHeader(name: string, value: string) {
                  res.setHeader(name, value);
                  return this;
                }
              };
              
              await handler(req as any, vercelRes as any);
            } catch (err: any) {
              console.error('Error in local API middleware:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message || 'internal server error' }));
            }
            return;
          }
          next();
        });
      }
    }
  ],
})