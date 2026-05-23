import { listCreations } from '@/lib/db';
import { downloadBlob } from './download';

/**
 * 把所有作品的元数据（prompt / 模型 / 尺寸 / 时间等）打包为 JSON 下载。
 *
 * 不包含原图 Blob —— 完整文件请到画廊单张下载，避免 JSON 体积爆炸。
 */
export async function exportCreationsJson(): Promise<number> {
  const items = await listCreations();
  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    note: '图片二进制不在此文件内，请到画廊单张下载',
    items: items.map((c) => ({
      id: c.id,
      prompt: c.prompt,
      negativePrompt: c.negativePrompt,
      model: c.model,
      size: c.size,
      quality: c.quality,
      favorite: c.favorite,
      createdAt: c.createdAt,
      createdAtIso: new Date(c.createdAt).toISOString(),
    })),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const stamp = new Date()
    .toISOString()
    .slice(0, 19)
    .replace(/[:T]/g, '')
    .replace(/-/g, '');
  downloadBlob(blob, `your-image-creations_${stamp}.json`);
  return items.length;
}
