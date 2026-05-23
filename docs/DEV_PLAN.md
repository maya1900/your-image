# Your Image — 开发计划 (DEV_PLAN)

> 文档版本：v2.0 ｜ 2026-05-22
> 配套：[PRD.md](./PRD.md)、[ARCHITECTURE.md](./ARCHITECTURE.md)、[DESIGN.md](./DESIGN.md)

---

## 总览

按四个阶段推进。每阶段结束都能跑通一个"可用闭环"，便于即用即调。

| 阶段 | 目标 | 可验证产出 |
|---|---|---|
| **Phase 0** | 项目脚手架 + 设计落地 | `pnpm dev` 启动后可见空壳界面 |
| **Phase 1** | 设置中心 + Key 连通 | 在设置页填 Key 并 ✓ 连通 |
| **Phase 2** | 文生图主流程 + 本地画廊 | 输入 prompt → 生成 → 入库 → 画廊可见 |
| **Phase 3** | 优化提示词 + 风格预设 + 批量 + 历史 | 完整 v1.0 功能 |
| **Phase 4** | 打磨 / 边界 / 构建 | 可发布的 dist/ |

---

## Phase 0：脚手架 & 设计

### 0.1 创建 Vite 项目
- `pnpm create vite@latest . --template react-ts`
- 选 React + TypeScript

### 0.2 装基础依赖
```bash
pnpm add react-router-dom zustand idb lucide-react framer-motion clsx tailwind-merge sonner
pnpm add -D tailwindcss postcss autoprefixer @types/node prettier eslint
```

### 0.3 配置 Tailwind + shadcn
- `pnpm exec tailwindcss init -p`
- 安装 shadcn cli: `pnpm dlx shadcn@latest init`
- 主题：默认 Dark，CSS 变量按 DESIGN.md
- 装常用组件：`button`, `input`, `textarea`, `dialog`, `select`, `switch`, `toggle`, `card`, `tabs`, `tooltip`, `dropdown-menu`

### 0.4 目录骨架
按 ARCHITECTURE 第 2 节创建空目录与占位文件。

### 0.5 路由与基本布局
- `App.tsx`：左侧 Sidebar + 主区域
- 三个路由：`/create`（默认）、`/gallery`、`/settings`
- Sidebar 显示三个入口图标 + 文字

### 0.6 设计系统落地
- 用 `stitch-design:taste-design` 生成 [docs/DESIGN.md](./DESIGN.md)
- 用 `stitch-design:generate-design` 生成主界面 mockup 作参考
- 把 DESIGN.md 的色板/字号/间距转写到 `tailwind.config.ts` 和 `globals.css`

**验收**：`pnpm dev` 看到深色主题骨架，三个页签可切换，每页是空 placeholder。

---

## Phase 1：设置中心 + Key 连通

### 1.1 Zustand `useSettings` store
- `apiKey`, `defaultImageModel`, `defaultChatModel`
- `persist` middleware 写入 `your-image:settings`

### 1.2 API 封装
- `lib/api/zhipu.ts`：`zhipuFetch` + `ZhipuError` + `mapError`
- `lib/api/glm-chat.ts`：`testConnection`, `optimizePrompt`（先写 stub，Phase 3 启用 optimize）

### 1.3 Settings 页 UI
- Key 输入（密码框 + 显示/隐藏切换 + 复制 + 清空）
- 模型选择两个 `<Select>`
- "测试连通性" 按钮 → 调 `testConnection()`：
  - loading 态
  - 成功：✓ 绿色"已连通"，并写入 `useSettings.lastTestedAt`
  - 失败：红色错误条 + friendly message
- 数据管理区：
  - "导出全部为 JSON" 按钮（Phase 2 后再实现）
  - "清空所有作品" 按钮（带确认对话）
  - "一键清除所有本地数据" 按钮（带二次确认）

### 1.4 TopBar 显示连通状态
- 顶栏右上角小圆点：未配置 灰、已配置未测 黄、已测试 绿、最近一次失败 红

**验收**：填入真 Key 点测试，看到"已连通"。错 Key 看到"API Key 无效"。

---

## Phase 2：文生图主流程 + 画廊

### 2.1 IndexedDB
- `lib/db.ts`：openDB + creations object store
- 工具：`addCreation`, `listCreations`, `removeCreation`, `getCreation`

### 2.2 文生图 API
- `lib/api/cogview.ts`：`generateImage`
- `lib/utils/image.ts`：
  - `urlToBlob(url)`：fetch + blob
  - `blobToThumbnail(blob, maxSize=256)`：用 Canvas 缩成 dataURL

### 2.3 Create 页 UI
- 左侧参数面板：
  - `PromptInput`：多行 textarea + 字符计数
  - `SizeSelector`：预设按钮组 + 自定义
  - `ModelSelector`：3 个模型
  - `QualityToggle`：仅 cogview-4 系列可选
  - `CountSelector`：1/2/4 toggle
  - 主按钮"生成图像"
- 右侧结果区：
  - `ResultGrid`：1 或 2×2 网格
  - `ResultCard`：成功显示图 + 操作；失败显示重试；进行中显示骨架

### 2.4 生成流程实现
```ts
async function handleGenerate() {
  const req = buildRequest(form);
  const taskIds = Array.from({ length: count }, () => uuid());
  taskIds.forEach((id) => tasks.start(id));

  await Promise.allSettled(
    taskIds.map(async (id) => {
      try {
        const resp = await generateImage(req);
        const blob = await urlToBlob(resp.data[0].url);
        const thumb = await blobToThumbnail(blob);
        const creation: Creation = { id, ...req, blob, thumbnailDataUrl: thumb, createdAt: Date.now() };
        await addCreation(creation);
        gallery.add(creation);
        tasks.finish(id, creation);
      } catch (e) {
        tasks.fail(id, (e as ZhipuError).friendly);
      }
    })
  );
}
```

### 2.5 Lightbox
- 点击成功卡片：fullscreen 查看 + 上一张/下一张

### 2.6 Gallery 页
- 顶部筛选 tabs：全部 / 收藏
- 瀑布流 / 网格 切换（默认网格）
- 缩略图懒加载（IntersectionObserver）
- 每张图操作：下载、再生成（带 prompt 跳回 /create）、复制 prompt、收藏、删除

### 2.7 下载工具
- `lib/utils/download.ts`：blob → file 下载，文件名 `your-image_{timestamp}.png`

**验收**：
- 填 prompt → 生成 1 张 → 显示在右侧 → 出现在画廊 → 关闭浏览器再开仍在
- 选 4 张 → 4 个卡片并发生成，其中 1 张故意用错 prompt 触发审核失败 → 1 张红色重试

---

## Phase 3：优化提示词 + 风格预设 + 历史

### 3.1 优化提示词
- `lib/api/glm-chat.ts` 启用 `optimizePrompt`
- `OptimizeButton` 组件：✨ 图标 + loading 态
- 输入框上方"已优化 · 撤销"提示条（保留 origin，可点回）

### 3.2 风格预设
- `lib/presets/styles.ts`：12 个预设
  ```ts
  export const STYLE_PRESETS = [
    { id: 'guofeng', label: '国风水墨', suffix: ', 国风水墨, 工笔细描, 写意, 中国传统美学' },
    { id: 'anime', label: '动漫日漫', suffix: ', 日系动漫, 赛璐璐, 鲜艳色彩' },
    // ...
  ];
  ```
- `StylePresetsBar` 组件：按钮组 + 已选 chip 行
- 生成时把已选预设的 suffix 拼到 prompt 末尾

### 3.3 Prompt 历史
- 输入 prompt 提交后写入 `localStorage your-image:prompt-history`（最近 50，去重）
- `PromptHistoryChips`：Prompt 框下方显示最近 5 条 chip，点击填入
- 设置页"清除 prompt 历史"按钮

### 3.4 数据导出
- 设置页"导出全部为 JSON" 按钮
  - 把 creations 序列化（blob → base64 内联，警告体积大）
  - 触发下载 `your-image-backup-{date}.json`

**验收**：
- 短描述 → ✨ → 输入框被扩展 → "撤销" 复原
- 选择"国风水墨" + "油画肖像" 两个预设 → prompt 末尾自动追加
- 历史 chip 可复用
- 导出 JSON 文件可下载

---

## Phase 4：打磨 / 边界 / 发布

### 4.1 错误与提示
- 全局 Toast（sonner）
- ErrorBoundary 包三个页面
- 空状态插画与文案
- 无 Key 时主操作禁用 + 引导横幅

### 4.2 性能
- 图片 `loading="lazy"`
- Gallery 虚拟滚动（若 > 100 张时再上 `@tanstack/react-virtual`）
- 缩略图 dataURL 控制在 80KB 内

### 4.3 可访问性 & 键盘
- 主操作可 Tab 聚焦 + Enter 触发
- Lightbox：Esc 关、← → 切换
- 颜色对比度 ≥ 4.5:1

### 4.4 README
- 写 README.md：项目介绍、截图、安装、使用、隐私说明

### 4.5 构建产物
- `pnpm build` 检查无报错
- `pnpm preview` 本机验收
- 输出大小检查：核心 chunk < 500KB（gzipped）

### 4.6 CSP（可选）
- index.html 加 `<meta http-equiv="Content-Security-Policy" content="connect-src 'self' https://open.bigmodel.cn https://aigc-files.bigmodel.cn; ...">`

**验收**：把 `dist/` 拖到任意静态服务器，全部功能正常。

---

## 任务清单（细到可执行）

### Phase 0
- [ ] `pnpm create vite@latest . --template react-ts`
- [ ] 安装依赖（tailwind/zustand/idb/lucide/framer-motion/sonner/clsx）
- [ ] `pnpm dlx shadcn@latest init`
- [ ] 装 shadcn 组件：button, input, textarea, dialog, select, switch, toggle, card, tabs, tooltip, dropdown-menu, scroll-area, badge
- [ ] 建立目录骨架
- [ ] 配置路由 + 布局 (Sidebar / TopBar)
- [ ] 生成 DESIGN.md（taste-design）
- [ ] 写 tailwind.config.ts + globals.css 主题变量

### Phase 1
- [ ] `lib/api/zhipu.ts` 通用 fetch + 错误映射
- [ ] `lib/api/glm-chat.ts::testConnection`
- [ ] `store/settings.ts` Zustand + persist
- [ ] Settings 页：Key 输入、模型选择、测试按钮、数据管理区
- [ ] TopBar 状态点

### Phase 2
- [ ] `lib/db.ts` IndexedDB 封装
- [ ] `lib/api/cogview.ts`
- [ ] `lib/utils/image.ts` (urlToBlob, blobToThumbnail)
- [ ] `lib/utils/id.ts` uuid
- [ ] `store/gallery.ts` + `store/tasks.ts`
- [ ] PromptInput 组件
- [ ] SizeSelector / ModelSelector / QualityToggle / CountSelector
- [ ] ResultGrid + ResultCard
- [ ] handleGenerate 主流程
- [ ] Lightbox
- [ ] Gallery 页（瀑布流/网格、筛选、操作）
- [ ] `lib/utils/download.ts`

### Phase 3
- [ ] `optimizePrompt` 启用
- [ ] OptimizeButton 组件
- [ ] `presets/styles.ts` + StylePresetsBar
- [ ] Prompt 历史读写 + chip 组件
- [ ] 数据导出

### Phase 4
- [ ] Toaster 全局接入
- [ ] ErrorBoundary
- [ ] 空状态
- [ ] 键盘可达
- [ ] README.md
- [ ] CSP meta
- [ ] `pnpm build` 通过

---

## 开发约定

- **不上 lint/类型错就不提交**
- **每个 Phase 完成后跑一次 `pnpm build` 确认产物 OK**
- **真实用户密钥不要提交到 git**
- **不引入超出 ARCHITECTURE 的依赖**，如需要先和需求方确认

---

## 风险登记

| 风险 | 应对 |
|---|---|
| 智谱图像 URL 30 天过期 | 拿到后立即 fetch 为 Blob 写入 IndexedDB |
| IndexedDB 写入失败（配额） | catch QuotaExceededError，弹窗提示用户清理 |
| 用户连续点"生成" | 主按钮 disabled while pending；或允许多任务并存（建议后者，体验更好） |
| GLM-4 优化结果过长（>1500 字） | 截断或提示用户调整 |
