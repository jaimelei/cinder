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
          if (!req.url || !req.url.startsWith('/api/')) {
            return next();
          }

          const pathname = req.url.split('?')[0];
          const routeMap: Record<string, string> = {
            '/api/my-videos': './api/my-videos.ts',
            '/api/delete-video': './api/delete-video.ts',
            '/api/sync': './api/sync.ts',
            '/api/pandora-import': './api/pandora-import.ts',
          };

          const scriptPath = routeMap[pathname];
          if (!scriptPath) {
            return next();
          }

          try {
            // Parse JSON body for POST/PUT requests
            if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
              const buffers: any[] = [];
              for await (const chunk of req) {
                buffers.push(chunk);
              }
              const rawBody = Buffer.concat(buffers).toString();
              if (rawBody) {
                try {
                  (req as any).body = JSON.parse(rawBody);
                } catch {
                  (req as any).body = rawBody;
                }
              }
            }

            const handlerModule = await server.ssrLoadModule(scriptPath);
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
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'internal server error' }));
          }
        });
      }
    }
  ],
})