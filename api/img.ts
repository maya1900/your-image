/**
 * Vercel Edge Function · /api/img?url=<encoded url>
 *
 * 生产环境的图片代理，复刻 vite-plugins/image-proxy.ts 的逻辑。
 *
 * 智谱图像生成接口返回的 CDN（UCloud `*.ufileos.com`）不返回 CORS 头，
 * 浏览器无法直接 fetch 拿到 Blob，因此走这个 Edge Function 代理一次。
 */

export const config = {
  runtime: 'edge',
};

const ALLOW = [/\.bigmodel\.cn$/i, /\.ufileos\.com$/i];

const corsHeaders = {
  'access-control-allow-origin': '*',
};

function badRequest(msg: string, status = 400) {
  return new Response(msg, {
    status,
    headers: { ...corsHeaders, 'content-type': 'text/plain; charset=utf-8' },
  });
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const target = url.searchParams.get('url');
  if (!target) return badRequest('missing url', 400);

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return badRequest('invalid url', 400);
  }
  if (!ALLOW.some((re) => re.test(parsed.host))) {
    return badRequest('host not allowed', 403);
  }

  try {
    const upstream = await fetch(target, { redirect: 'follow' });
    const headers = new Headers(corsHeaders);
    const ct = upstream.headers.get('content-type');
    if (ct) headers.set('content-type', ct);
    const cl = upstream.headers.get('content-length');
    if (cl) headers.set('content-length', cl);
    // 签名 URL 有时效性，不长缓存；客户端拿到 Blob 后直接入库
    headers.set('cache-control', 'private, max-age=300');
    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (e) {
    return badRequest(`proxy error: ${(e as Error).message}`, 502);
  }
}
