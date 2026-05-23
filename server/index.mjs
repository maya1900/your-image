// 生产 Node 服务 · 把 dist/ 静态资源 + /api/img 代理一起提供。
//
// 在本机/Docker/任何能跑 Node 22+ 的环境运行：
//   pnpm build && node server/index.mjs
//
// 端口可通过环境变量 PORT 配置（默认 3000）。

import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');

const ALLOW = [/\.bigmodel\.cn$/i, /\.ufileos\.com$/i];

const app = new Hono();

// 1. 图片代理 —— 必须在静态资源之前注册
app.get('/api/img', async (c) => {
  const target = c.req.query('url');
  if (!target) return c.text('missing url', 400);

  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    return c.text('invalid url', 400);
  }
  if (!ALLOW.some((re) => re.test(parsed.host))) {
    return c.text('host not allowed', 403);
  }

  try {
    const upstream = await fetch(target, { redirect: 'follow' });
    const headers = new Headers({ 'access-control-allow-origin': '*' });
    const ct = upstream.headers.get('content-type');
    if (ct) headers.set('content-type', ct);
    const cl = upstream.headers.get('content-length');
    if (cl) headers.set('content-length', cl);
    headers.set('cache-control', 'private, max-age=300');
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (e) {
    return c.text(`proxy error: ${e.message}`, 502);
  }
});

// 2. 静态文件（SPA 构建产物）
app.use('/*', serveStatic({ root: './dist' }));

// 3. SPA 路由 fallback —— 把所有未匹配请求返回 index.html
const indexHtml = readFileSync(join(DIST_DIR, 'index.html'), 'utf-8');
app.notFound((c) => c.html(indexHtml, 200));

const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOST || '0.0.0.0';

serve({ fetch: app.fetch, port, hostname }, (info) => {
  console.log(`Your Image · listening on http://${info.address}:${info.port}`);
});
