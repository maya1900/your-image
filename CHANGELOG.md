# Changelog

本项目所有显著更改将记录在此文件。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

---

## [Unreleased]

待补充。

---

## [0.2.0] — 2026-05-23

首个 init 之后的迭代版本，主要补齐了部署适配、移动端体验、关于页与水印开关。

### Added

- **多平台部署支持**：在 `vite-plugins/image-proxy.ts` 之外新增三套等价的 `/api/img` 代理实现，前端代码完全不动即可在任意环境跑通智谱 CDN 图片下载
  - `api/img.ts` — Vercel Edge Function（生产）
  - `server/index.mjs` — Hono + Node 22 服务（Docker / 自托管）
  - `functions/api/img.ts` — Cloudflare Pages Function（边缘 CDN）
- **Docker 一键部署**：`Dockerfile`（三段式 multi-stage，`node:22-alpine`，非 root 用户，含 healthcheck）+ `docker-compose.yml` + `.dockerignore`；镜像约 120 MB
- **Vercel SPA 部署配置**：`vercel.json` 配置 SPA fallback rewrite
- **移动端侧栏抽屉**：< 768px 时顶栏汉堡按钮 → 左滑抽屉 + 半透明遮罩；支持 Esc / 点遮罩 / 点导航项 / 路由切换自动收起；打开时锁背景滚动
- **「关于」对话框**：侧栏底部「关于 · v0.2.0」按钮触发；包含项目简介、GitHub 仓库链接、Issues 反馈链接、License；版本号自动读取 `package.json`
- **去除水印开关**：设置页新增 toggle，请求 `/images/generations` 时附加 `watermark: false`；付费 CogView-4 系列完整生效，免费 `cogview-3-flash` 由智谱服务端决定
- **UI primitives**：新增 `Switch` 组件（无障碍 `role="switch"`，紫色激活态）
- **文档与许可**：
  - MIT `LICENSE`
  - 三张界面截图（创作 / 画廊 / 设置，JPG 压缩约 130 KB / 张）
  - `README.md` 增加徽章、界面预览、快捷键表、贡献指南、完整部署章节、四套代理对照表
  - `docs/screenshots/README.md` 截图命名与压缩规约

### Changed

- `package.json` `scripts` 增加 `start` / `docker:build` / `docker:up` / `docker:down`
- `package.json` 增加运行时依赖 `hono` + `@hono/node-server`（仅 Node 服务使用，不进客户端 bundle）
- `tsconfig.json` 把 `api/` 与 `functions/` 纳入类型检查
- `useSettings` store 新增 `removeWatermark` 字段（默认 `true`，持久化）
- `Sidebar` 重构：单一组件同时承载桌面常驻栏与移动抽屉，共享同一份内容渲染
- `App.tsx` 注入 `sidebarOpen` 状态管理与路由感知收起

### Fixed

- **Vercel 生产环境生成图 404**：智谱返回的 UCloud CDN（`*.ufileos.com`）不带 CORS 头，浏览器 fetch 直接失败。补充 Vercel Edge Function `api/img.ts` 处理 `/api/img` 路径
- **Vercel 上深链 / 刷新返回 404**：初版 `vercel.json` 使用了负向预查正则 `((?!api/|assets/...).*)`，Vercel 的 `path-to-regexp` 不支持 lookahead，规则被静默忽略。改用通配 `/(.*)` 全量 rewrite，靠 Vercel 路由优先级（静态 > api/ > rewrites）自动排开真实路由
- **空状态「设置页」链接触发全量跳转**：`ResultGrid` 内部 `<a href="/settings">` 改为 React Router 的 `<Link>`，避免命中 Vercel 静态层 404

---

## [0.1.0] — 2026-05-23

首个完整功能版本（Phase 0 → Phase 4 全部交付）。

### Added

- **文生图**：CogView-3-Flash（免费）/ CogView-4 / cogview-4-250304 / glm-image
- **优化提示词**：✨ 按钮调用 GLM-4-Flash 把简短描述扩写为详尽 prompt，支持「撤销」恢复原文
- **风格预设**：12 种内置风格（国风水墨 / 动漫 / 赛博朋克 / 3D Pixar / 油画 / 极简扁平 / 复古胶片 / 蒸汽朋克 / 像素艺术 / 写实摄影 / 概念设计 / 韩漫插画），可叠加
- **Prompt 历史**：localStorage 自动记录最近 50 条，chip 一键复用，可单条移除
- **批量生成**：每次提交 1 / 2 / 4 张
- **免费模型并发治理**：`cogview-3-flash` 自动串行（并发 1）避免撞 QPS；429 自动指数退避重试（1.5s → 4.5s）
- **本地画廊**：IndexedDB 存储 Blob，浏览 / 下载 / 收藏 / 再生成 / 删除；全部 / 收藏过滤
- **Lightbox 大图**：键盘 ← → 翻页，Esc 关闭，底部元信息条
- **设置中心**：API Key 输入（密码框 + 显示切换 + 复制 + 一键清除）；连通性测试；默认图像 / 对话模型选择；数据导出 JSON；分级清理（仅 prompt 历史 / 全部本地数据）
- **快捷键**：Prompt 框内 ⌘/Ctrl + Enter 触发生成
- **错误边界**：`ErrorBoundary` 包裹主路由，崩溃时显示重试 / 刷新
- **图片代理**：`vite-plugins/image-proxy.ts` 解决 dev/preview 阶段智谱 CDN 跨域问题
- **设计系统**：完整 `DESIGN.md`（深空夜晚 / 紫粉电光氛围）
- **文档**：`docs/PRD.md` / `docs/ARCHITECTURE.md` / `docs/DEV_PLAN.md` / `docs/DESIGN.md`

### 技术栈

- 构建：Vite 6
- 框架：React 18 + TypeScript 5
- 样式：Tailwind CSS 3
- 状态：Zustand（含 persist 中间件）
- 路由：React Router 6
- 存储：IndexedDB（idb 包）+ localStorage
- 图标：lucide-react
- 动效：framer-motion
- Toast：sonner

---

[Unreleased]: https://github.com/maya1900/your-image/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/maya1900/your-image/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/maya1900/your-image/releases/tag/v0.1.0
