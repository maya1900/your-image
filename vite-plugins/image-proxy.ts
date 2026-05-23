import type { IncomingMessage, ServerResponse } from 'node:http';
import { Plugin } from 'vite';

/**
 * /api/img?url=<encoded url>
 *
 * 智谱图像生成接口返回的 CDN（UCloud *.ufileos.com）不带 CORS 头，
 * 浏览器无法直接 fetch 拿到 Blob。
 * 这个中间件在 Vite 开发/预览服务器中代理这类图片，加上 ACAO 头。
 *
 * 部署到纯静态站时不可用，需要另起一个等价的 serverless 函数。
 */
export function imageProxyPlugin(): Plugin {
  const handler = async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URLSearchParams((req.url ?? '').split('?')[1] ?? '').get('url');
    if (!url) {
      res.statusCode = 400;
      res.setHeader('access-control-allow-origin', '*');
      res.end('missing url');
      return;
    }
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      res.statusCode = 400;
      res.setHeader('access-control-allow-origin', '*');
      res.end('invalid url');
      return;
    }
    // 仅放行已知的智谱 / UCloud 图床域名
    const ALLOW = [/\.bigmodel\.cn$/i, /\.ufileos\.com$/i];
    if (!ALLOW.some((re) => re.test(parsed.host))) {
      res.statusCode = 403;
      res.setHeader('access-control-allow-origin', '*');
      res.end('host not allowed');
      return;
    }
    try {
      const upstream = await fetch(url, { redirect: 'follow' });
      res.statusCode = upstream.status;
      res.setHeader('access-control-allow-origin', '*');
      res.setHeader(
        'content-type',
        upstream.headers.get('content-type') ?? 'application/octet-stream'
      );
      const cl = upstream.headers.get('content-length');
      if (cl) res.setHeader('content-length', cl);
      // cache-control 透传可选
      const cc = upstream.headers.get('cache-control');
      if (cc) res.setHeader('cache-control', cc);

      const body = upstream.body;
      if (!body) {
        res.end();
        return;
      }
      const reader = body.getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) res.write(Buffer.from(value));
      }
      res.end();
    } catch (e) {
      res.statusCode = 502;
      res.setHeader('access-control-allow-origin', '*');
      res.end(`proxy error: ${(e as Error).message}`);
    }
  };

  return {
    name: 'your-image-proxy',
    configureServer(server) {
      server.middlewares.use('/api/img', handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/img', handler);
    },
  };
}
