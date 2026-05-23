# Your Image — 技术架构文档 (ARCHITECTURE)

> 文档版本：v2.0 ｜ 2026-05-22
> 配套：[PRD.md](./PRD.md)、[DEV_PLAN.md](./DEV_PLAN.md)

---

## 1. 技术栈

| 层 | 选型 | 理由 |
|---|---|---|
| 构建 | **Vite 5** | 启动快、原生 ESM |
| 框架 | **React 18 + TypeScript 5** | 主流稳定 |
| 样式 | **Tailwind CSS 3** + **shadcn/ui** | 与 Stitch 输出对齐 |
| 状态 | **Zustand** | 轻量 |
| 路由 | **React Router v6** | 多页切换 |
| 本地存储 | **IndexedDB（idb 包）** | 大 Blob 友好 |
| HTTP | **fetch** + 轻封装 | 不引入 axios |
| 图标 | **lucide-react** | 与 shadcn 默契 |
| 动效 | **framer-motion** | 卡片入场 |
| 工具 | **prettier + eslint** | 标准 |

**禁止引入**：Redux、MUI、antd、axios、fabric.js（v1 不需要画布编辑）。

---

## 2. 目录结构

```
your-image/
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DEV_PLAN.md
│   └── DESIGN.md
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx                        # 布局 + 路由
│   ├── pages/
│   │   ├── Create.tsx                 # 文生图主页
│   │   ├── Gallery.tsx                # 本地画廊
│   │   └── Settings.tsx               # 设置中心
│   ├── components/
│   │   ├── ui/                        # shadcn primitives
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   ├── prompt/
│   │   │   ├── PromptInput.tsx
│   │   │   ├── OptimizeButton.tsx
│   │   │   ├── StylePresetsBar.tsx
│   │   │   └── PromptHistoryChips.tsx
│   │   ├── params/
│   │   │   ├── SizeSelector.tsx
│   │   │   ├── ModelSelector.tsx
│   │   │   ├── QualityToggle.tsx
│   │   │   └── CountSelector.tsx
│   │   ├── results/
│   │   │   ├── ResultGrid.tsx
│   │   │   ├── ResultCard.tsx
│   │   │   └── Lightbox.tsx
│   │   ├── gallery/
│   │   │   ├── GalleryGrid.tsx
│   │   │   └── CreationCard.tsx
│   │   └── feedback/
│   │       ├── ErrorBoundary.tsx
│   │       ├── EmptyState.tsx
│   │       └── Toaster.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── zhipu.ts               # 通用 fetch 封装
│   │   │   ├── cogview.ts             # 文生图
│   │   │   └── glm-chat.ts            # GLM-4 对话（优化 prompt + 连通测试）
│   │   ├── db.ts                      # IndexedDB 封装
│   │   ├── store/
│   │   │   ├── settings.ts
│   │   │   ├── gallery.ts
│   │   │   └── tasks.ts
│   │   ├── presets/
│   │   │   └── styles.ts
│   │   └── utils/
│   │       ├── image.ts               # Blob ↔ thumbnail
│   │       ├── download.ts            # url → blob → file 下载
│   │       └── id.ts                  # uuid
│   ├── types/
│   │   ├── creation.ts
│   │   └── settings.ts
│   └── styles/
│       └── globals.css
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── vite.config.ts
├── components.json                    # shadcn config
└── README.md
```

---

## 3. 数据模型

```ts
// types/creation.ts
export interface Creation {
  id: string;                  // uuid
  prompt: string;
  negativePrompt?: string;
  model: 'glm-image' | 'cogview-3-flash' | 'cogview-4' | 'cogview-4-250304';
  size: string;                // '1024x1024'
  quality?: 'standard' | 'hd';
  blob: Blob;                  // 实际图像
  thumbnailDataUrl: string;    // 列表用，<=80KB
  favorite?: boolean;
  createdAt: number;
}

// types/settings.ts
export interface Settings {
  apiKey: string;
  defaultImageModel: Creation['model'];
  defaultChatModel: 'glm-4-flash' | 'glm-4-plus';
}
```

---

## 4. 智谱 API 适配层

### 4.1 通用封装 `lib/api/zhipu.ts`

```ts
const BASE = 'https://open.bigmodel.cn/api/paas/v4';

export class ZhipuError extends Error {
  constructor(public status: number, public friendly: string, raw?: string) {
    super(raw ?? friendly);
    this.name = 'ZhipuError';
  }
}

export async function zhipuFetch<T>(
  path: string,
  body: unknown,
  opts: { signal?: AbortSignal; timeoutMs?: number } = {}
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
      const text = await res.text();
      throw mapError(res.status, text);
    }
    return (await res.json()) as T;
  } catch (e) {
    if ((e as Error).name === 'AbortError') {
      throw new ZhipuError(0, '请求超时或已取消');
    }
    throw e;
  } finally {
    clearTimeout(timer);
    opts.signal?.removeEventListener('abort', onAbort);
  }
}

function mapError(status: number, raw: string): ZhipuError {
  if (status === 401) return new ZhipuError(401, 'API Key 无效，请检查设置', raw);
  if (status === 403) return new ZhipuError(403, '提示词含敏感内容，请修改后重试', raw);
  if (status === 429) return new ZhipuError(429, '调用过快或额度用尽，请稍后重试或前往智谱平台充值', raw);
  if (status >= 500) return new ZhipuError(status, '智谱服务繁忙，稍后再试', raw);
  return new ZhipuError(status, `请求失败 (${status})`, raw);
}
```

### 4.2 文生图 `lib/api/cogview.ts`

```ts
export interface CogViewRequest {
  model: string;
  prompt: string;
  size?: string;
  quality?: 'standard' | 'hd';
  user_id?: string;
}
export interface CogViewResponse {
  created: number;
  data: { url: string }[];
}

export const generateImage = (req: CogViewRequest, signal?: AbortSignal) =>
  zhipuFetch<CogViewResponse>('/images/generations', req, { signal, timeoutMs: 120_000 });
```

### 4.3 GLM-4 对话 `lib/api/glm-chat.ts`

```ts
export const PROMPT_OPTIMIZER_SYSTEM = `你是一名顶级 AI 绘图提示词专家...`; // PRD F3 已列

export interface ChatCompletionResp {
  choices: { message: { content: string } }[];
}

export async function optimizePrompt(input: string, model = 'glm-4-flash') {
  const resp = await zhipuFetch<ChatCompletionResp>('/chat/completions', {
    model,
    messages: [
      { role: 'system', content: PROMPT_OPTIMIZER_SYSTEM },
      { role: 'user', content: input },
    ],
    temperature: 0.7,
  });
  return resp.choices[0].message.content.trim();
}

export async function testConnection(model = 'glm-4-flash'): Promise<boolean> {
  await zhipuFetch<ChatCompletionResp>('/chat/completions', {
    model,
    messages: [{ role: 'user', content: 'hi' }],
    max_tokens: 1,
  }, { timeoutMs: 10_000 });
  return true;
}
```

---

## 5. 关键流程

### 5.1 文生图主流程

```
1. 用户在 Create 页面填 prompt、参数，点"生成"
2. 前端：根据 count (1/2/4) 创建 N 个 TaskCard 占位
3. Promise.allSettled(Array.from({length: n}, () => generateImage(req)))
4. 对每个 fulfilled：
   a. fetch(data[0].url) 拿到远程图
   b. Canvas resize → 缩略图 dataURL
   c. db.creations.put({ ...creation, blob, thumbnailDataUrl })
   d. store.gallery.prepend(creation)
   e. 更新对应 TaskCard 为成功态
5. 对每个 rejected：
   - TaskCard 显示错误 + "重试"按钮
```

### 5.2 优化提示词

```
1. 用户填 prompt 后点 ✨
2. setOptimizing(true)；保存 origin = prompt
3. const optimized = await optimizePrompt(prompt)
4. setPrompt(optimized)
5. 显示 "已优化 · [撤销]"，撤销 = setPrompt(origin)
```

### 5.3 Key 连通性测试（设置页）

```
1. setTesting(true)
2. try { await testConnection() } catch (e) { 显示 e.friendly }
3. 成功：✓ 已连通
```

---

## 6. 存储

### 6.1 localStorage

| Key | 内容 |
|---|---|
| `your-image:settings` | Zustand persist 序列化（不含 apiKey 也行，统一一起） |
| `your-image:apiKey` | string（单列出便于一键清除） |
| `your-image:prompt-history` | string[]（最近 50 条） |

### 6.2 IndexedDB

```ts
// lib/db.ts
const DB_NAME = 'your-image-db';
const VERSION = 1;

export const db = await openDB(DB_NAME, VERSION, {
  upgrade(d) {
    if (!d.objectStoreNames.contains('creations')) {
      const store = d.createObjectStore('creations', { keyPath: 'id' });
      store.createIndex('by-createdAt', 'createdAt');
      store.createIndex('by-favorite', 'favorite');
    }
  },
});
```

---

## 7. Zustand stores

```ts
// store/settings.ts
export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      apiKey: '',
      defaultImageModel: 'cogview-3-flash',
      defaultChatModel: 'glm-4-flash',
      setApiKey: (k) => set({ apiKey: k }),
      update: (patch) => set(patch),
      clearAll: () => set({ apiKey: '', defaultImageModel: 'cogview-3-flash', defaultChatModel: 'glm-4-flash' }),
    }),
    { name: 'your-image:settings' }
  )
);

// store/gallery.ts
export const useGallery = create<GalleryStore>((set, get) => ({
  items: [] as Creation[],
  loaded: false,
  load: async () => {
    const all = await db.getAllFromIndex('creations', 'by-createdAt');
    set({ items: all.reverse(), loaded: true });
  },
  add: (c) => set((s) => ({ items: [c, ...s.items] })),
  remove: async (id) => {
    await db.delete('creations', id);
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
  },
  toggleFavorite: async (id) => { /* ... */ },
}));

// store/tasks.ts —— 当前正在生成的占位
export interface TaskItem {
  id: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
  resultId?: string;
}
export const useTasks = create<TasksStore>(/* ... */);
```

---

## 8. UI 主题

- **基色**：深色背景 `#0A0A0F`、卡片 `#14141C`、边框 `#1F1F2A`
- **强调色**：紫粉渐变 `from-violet-500 to-fuchsia-500`
- **文字**：主 `#F4F4F7`、次 `#A1A1AA`、禁用 `#52525B`
- **字体**：Inter / 思源黑体
- **圆角**：`rounded-xl` 为主，`rounded-2xl` 用于大卡
- **动效**：framer-motion 卡片入场（fade + translate-y 4px）

详见 [DESIGN.md](./DESIGN.md)（由 stitch-design 输出）。

---

## 9. 错误处理与提示

- 任何用户操作的失败都用 toast 提示（基于 sonner / shadcn Toast）
- ZhipuError 显示 `friendly`，开发者面板可看 `raw`
- ErrorBoundary 包裹三个页面 + Lightbox，崩溃时显示重启按钮

### CSP 与图片 CDN

智谱 `/images/generations` 接口返回的 URL **不一定**位于 `aigc-files.bigmodel.cn`。
实测会返回 UCloud 对象存储域名（如 `maas-watermark-prod-new.cn-wlcb.ufileos.com`）。
因此 `index.html` 的 CSP 必须在 `connect-src` 和 `img-src` 中放行：

```
connect-src 'self' https://open.bigmodel.cn https://*.bigmodel.cn https://*.ufileos.com;
img-src 'self' data: blob: https://*.bigmodel.cn https://*.ufileos.com;
```

`urlToBlob()` 在 CSP 拦截或网络错误时会抛出包含 host 的诊断信息，方便用户排错。

---

## 10. 构建与发布

```bash
pnpm i
pnpm dev        # localhost:5173
pnpm build      # 产物到 dist/
pnpm preview    # 静态预览
```

部署目标：纯静态站，可发到 Vercel / Cloudflare Pages / 本地。
