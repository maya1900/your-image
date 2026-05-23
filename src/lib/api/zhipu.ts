import { useSettings } from '@/lib/store/settings';

const BASE = 'https://open.bigmodel.cn/api/paas/v4';

export class ZhipuError extends Error {
  status: number;
  friendly: string;
  raw?: string;
  constructor(status: number, friendly: string, raw?: string) {
    super(raw ?? friendly);
    this.name = 'ZhipuError';
    this.status = status;
    this.friendly = friendly;
    this.raw = raw;
  }
}

interface FetchOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export async function zhipuFetch<T>(
  path: string,
  body: unknown,
  opts: FetchOptions = {}
): Promise<T> {
  const apiKey = useSettings.getState().apiKey;
  if (!apiKey) throw new ZhipuError(0, '请先在设置中填入 API Key');

  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort();
  opts.signal?.addEventListener('abort', onAbort);
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 60_000);

  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw mapError(res.status, text);
    }
    return (await res.json()) as T;
  } catch (e) {
    const err = e as Error & { name?: string };
    if (err.name === 'AbortError') {
      throw new ZhipuError(0, '请求超时或已取消');
    }
    if (e instanceof ZhipuError) throw e;
    throw new ZhipuError(0, '网络异常，无法连接智谱服务', err.message);
  } finally {
    clearTimeout(timer);
    opts.signal?.removeEventListener('abort', onAbort);
  }
}

function mapError(status: number, raw: string): ZhipuError {
  if (status === 401) return new ZhipuError(401, 'API Key 无效，请检查后重试', raw);
  if (status === 403) return new ZhipuError(403, '内容审核未通过或权限不足', raw);
  if (status === 429)
    return new ZhipuError(429, '调用过快或额度不足，请稍后重试或前往智谱平台充值', raw);
  if (status >= 500) return new ZhipuError(status, '智谱服务繁忙，稍后再试', raw);
  return new ZhipuError(status, `请求失败 (${status})`, raw);
}
