export interface StylePreset {
  id: string;
  label: string;
  /** 拼接到 prompt 末尾的关键词。前置 ", " 由组件统一处理。 */
  suffix: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'guofeng',
    label: '国风水墨',
    suffix: '国风水墨,工笔细描,写意,留白构图,中国传统美学',
  },
  {
    id: 'anime',
    label: '动漫日漫',
    suffix: '日系动漫风格,赛璐璐,鲜艳色彩,细腻线条',
  },
  {
    id: 'cyberpunk',
    label: '赛博朋克',
    suffix: '赛博朋克,霓虹灯光,雨夜街道,反乌托邦,电影感构图',
  },
  {
    id: 'pixar',
    label: '3D Pixar',
    suffix: '3D 渲染,Pixar 风格,可爱卡通,柔和光照,体积光',
  },
  {
    id: 'oil',
    label: '油画肖像',
    suffix: '古典油画,厚涂笔触,温暖色调,伦勃朗光,博物馆质感',
  },
  {
    id: 'minimal',
    label: '极简扁平',
    suffix: '极简主义,扁平插画,大色块,几何构图,留白',
  },
  {
    id: 'film',
    label: '复古胶片',
    suffix: '复古胶片摄影,柯达 Portra 400,颗粒感,暖黄调,1980 年代氛围',
  },
  {
    id: 'steampunk',
    label: '蒸汽朋克',
    suffix: '蒸汽朋克,黄铜齿轮,维多利亚时代,蒸汽机械,昏黄灯光',
  },
  {
    id: 'pixel',
    label: '像素艺术',
    suffix: '16-bit 像素艺术,复古游戏,有限调色板,清晰像素边缘',
  },
  {
    id: 'photoreal',
    label: '写实摄影',
    suffix: '超写实摄影,8k 画质,景深,自然光,Sony A7R IV,大师级构图',
  },
  {
    id: 'concept',
    label: '概念设计',
    suffix: '概念艺术,Artstation 风格,电影概念图,史诗氛围,大场面',
  },
  {
    id: 'manhwa',
    label: '韩漫插画',
    suffix: '韩漫风格,clean line art,粉嫩色调,精致五官,光滑渲染',
  },
];

const SEPARATOR = ', ';

export function applyPresets(prompt: string, presetIds: string[]): string {
  const trimmed = prompt.trim();
  if (presetIds.length === 0) return trimmed;
  const suffix = presetIds
    .map((id) => STYLE_PRESETS.find((p) => p.id === id)?.suffix)
    .filter(Boolean)
    .join(SEPARATOR);
  if (!suffix) return trimmed;
  return trimmed ? `${trimmed}${SEPARATOR}${suffix}` : suffix;
}
