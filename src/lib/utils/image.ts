/**
 * 把智谱返回的图片 URL 下载为 Blob。
 *
 * 智谱图像 CDN (`*.ufileos.com`) 不返回 CORS 头，浏览器无法直接 fetch，
 * 因此走本地 Vite 中间件 `/api/img?url=...` 代理一次（见 vite-plugins/image-proxy.ts）。
 */
export async function urlToBlob(url: string): Promise<Blob> {
  const proxied = `/api/img?url=${encodeURIComponent(url)}`;
  try {
    const res = await fetch(proxied);
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`图片下载失败 (${res.status})${detail ? ' · ' + detail : ''}`);
    }
    return await res.blob();
  } catch (e) {
    const msg = (e as Error).message ?? '';
    if (msg.includes('Failed to fetch') || msg.toLowerCase().includes('csp')) {
      throw new Error('无法访问图片代理，请确认 dev / preview 服务器在运行');
    }
    throw e;
  }
}

/** 把 Blob 等比缩放到 maxSize px，输出 JPEG dataURL，体积控制在 ≤ ~80KB */
export async function blobToThumbnail(blob: Blob, maxSize = 320): Promise<string> {
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    const { width, height } = scaleSize(img.naturalWidth, img.naturalHeight, maxSize);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法创建画布');
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.78);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片解码失败'));
    img.src = src;
  });
}

function scaleSize(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w / h;
  return ratio > 1
    ? { width: max, height: Math.round(max / ratio) }
    : { width: Math.round(max * ratio), height: max };
}

/** 解析 size 字符串 "1024x1024" */
export function parseSize(size: string): { width: number; height: number } {
  const [w, h] = size.split('x').map((n) => parseInt(n, 10));
  return { width: w || 1024, height: h || 1024 };
}
