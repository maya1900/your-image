import { zhipuFetch, ZhipuError } from './zhipu';
import { sleep } from '@/lib/utils/concurrency';
import type { ImageModel } from '@/lib/store/settings';
import type { Quality } from '@/types/creation';

export interface CogViewRequest {
  model: ImageModel;
  prompt: string;
  size?: string;
  quality?: Quality;
  user_id?: string;
}

export interface CogViewResponse {
  created: number;
  data: { url: string }[];
  content_filter?: { role: string; level: number }[];
}

export const generateImage = (req: CogViewRequest, signal?: AbortSignal) =>
  zhipuFetch<CogViewResponse>('/images/generations', req, {
    signal,
    timeoutMs: 120_000,
  });

/**
 * 在 429 限流时按退避节奏自动重试。
 * 免费模型（cogview-3-flash）的 QPS 通常是 1/s 级别，并发场景下
 * 几乎一定会撞到 429，这里把瞬时限流"吃掉"再吐回给用户。
 */
const RETRY_DELAYS_MS = [1500, 4500];

export async function generateImageWithRetry(
  req: CogViewRequest,
  signal?: AbortSignal
): Promise<CogViewResponse> {
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await generateImage(req, signal);
    } catch (e) {
      const isRateLimit = e instanceof ZhipuError && e.status === 429;
      if (isRateLimit && attempt < RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }
      throw e;
    }
  }
  throw new ZhipuError(429, '调用过快，多次重试后仍未成功');
}
