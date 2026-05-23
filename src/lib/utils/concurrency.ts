/**
 * 简单并发池：N 个 worker 从队列里取任务，直到队列空。
 * worker 内部错误自行处理，不会中断池子。
 */
export async function runPool<T>(
  items: T[],
  limit: number,
  worker: (item: T, idx: number) => Promise<void>
): Promise<void> {
  if (items.length === 0) return;
  const queue = items.map((item, idx) => ({ item, idx }));
  const consume = async () => {
    while (queue.length) {
      const entry = queue.shift();
      if (!entry) return;
      try {
        await worker(entry.item, entry.idx);
      } catch {
        // worker 内部应负责把错误同步到 UI；这里仅吞错以防中断池子
      }
    }
  };
  const workers = Array.from(
    { length: Math.min(Math.max(limit, 1), items.length) },
    consume
  );
  await Promise.all(workers);
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
