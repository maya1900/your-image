# Design System: Your Image

> AI 文生图工作台 · 设计系统规范 v1.0
> 基调：深空夜晚 / 艺术家专业工具 / 克制未来感

---

## 1. 设计哲学

Your Image 是一个为创作者准备的「无干扰画室」。整体氛围像深夜里一台被精心调校的工业设计软件——黑底深邃、留白克制、细节精致。我们追求 **"高级克制"**，而非"AI 炫技"：暗黑画布让生成的图片成为主角，紫粉色仅在关键 CTA、生成态、聚焦环上闪现，绝不滥用；动效以"呼吸感"为主，杜绝跳跃和浮夸。整个系统的密度落在「Daily App Balanced 5」，方差「Offset Asymmetric 6」，动效「Fluid CSS 5」，让用户既能像专业工具一样高密度操作，又有清晰的视觉节奏。

---

## 2. 色板与角色

### 2.1 中性色（Surface 层）

| 名称 | HEX | 用途 |
|---|---|---|
| **Void Black** | `#0A0A0F` | 应用画布最底层（深空夜晚） |
| **Carbon Surface** | `#0F0F16` | 顶栏与侧栏背景，与 Void 微差形成层次 |
| **Slate Card** | `#14141C` | 卡片、面板、Dialog、参数区背景 |
| **Slate Card Raised** | `#1A1A24` | 卡片悬停 / 选中态、Tab 激活背景 |
| **Hairline Border** | `#1F1F2A` | 1px 结构性分隔线、卡片边框 |
| **Hairline Subtle** | `rgba(255, 255, 255, 0.06)` | 微弱分割（如表单内部） |

### 2.2 文字与图标

| 名称 | HEX | 用途 |
|---|---|---|
| **Spectral White** | `#F4F4F7` | 主文字、Display、Heading |
| **Mist Gray** | `#A1A1AA` | 次级文字、说明、标签 |
| **Faded Steel** | `#71717A` | 占位符、辅助说明、低权重 metadata |
| **Disabled Dust** | `#3F3F46` | Disabled 文字、占位图标 |

### 2.3 强调色（单一系统 · 紫粉电光）

| 名称 | HEX | 用途 |
|---|---|---|
| **Aurora Violet** | `#8B5CF6` | 主 CTA 起点色、聚焦环、激活态 |
| **Aurora Fuchsia** | `#D946EF` | 主 CTA 终点色、生成中态色 |
| **Aurora Soft** | `rgba(139, 92, 246, 0.12)` | 选中背景晕、Chip 选中底色 |
| **Aurora Ring** | `rgba(217, 70, 239, 0.35)` | 焦点圈（聚焦时的薄光环） |

**渐变方向**：默认 `135deg`，自左上 Violet → 右下 Fuchsia。仅用于主 CTA 与 Logo，**禁止用于大面积背景或文字 fill**。

### 2.4 状态色

| 名称 | HEX | 用途 |
|---|---|---|
| **Pulse Green** | `#10B981` | 已连通、成功 toast、收藏激活 |
| **Caution Amber** | `#F59E0B` | 警告、容量提示 |
| **Signal Red** | `#EF4444` | 错误 toast、删除确认、Key 失效 |
| **Probe Cyan** | `#22D3EE` | 加载/请求中的辅助光晕（图片骨架） |

### 2.5 禁用色与禁用模式

- **禁用纯黑** `#000000`：会让 OLED 屏出现锯齿，已用 Void Black 替代
- **禁用马卡龙** / 高亮度低饱和的粉/绿/黄：与暗黑画布冲突
- **禁用毛玻璃过度叠加**：仅顶栏可有轻微 `backdrop-blur-sm`，其它面板用纯色 Surface
- **禁用整图渐变文字**：仅限 Logo 与不超过 4 字的 Display

---

## 3. 字号阶梯

### 3.1 字体栈

```
sans:   'Inter', 'PingFang SC', 'Source Han Sans CN', 'Microsoft YaHei', system-ui, sans-serif
mono:   'JetBrains Mono', 'SF Mono', 'Cascadia Code', ui-monospace, monospace
```

> 说明：用户明确要求使用 Inter + 思源黑体，作为本项目的视觉签名（中英文兼顾、字面紧凑），整套设计已围绕该字体调校字重和字距。

### 3.2 字号 / 字重 / 行高

| Token | 字号 | 字重 | 行高 | letter-spacing | 用途 |
|---|---|---|---|---|---|
| `display` | 40 / 48px | 600 | 1.1 | -0.02em | 营销/欢迎页大标题 |
| `h1` | 28px | 600 | 1.2 | -0.015em | 页面主标题 |
| `h2` | 22px | 600 | 1.25 | -0.01em | 区块标题 |
| `h3` | 18px | 600 | 1.3 | -0.005em | 卡片标题 / 模态标题 |
| `h4` | 16px | 600 | 1.4 | 0 | 列表组标题 |
| `body-lg` | 16px | 400 | 1.55 | 0 | 主要正文 |
| `body` | 14px | 400 | 1.55 | 0 | 默认正文（最多 65ch） |
| `body-sm` | 13px | 400 | 1.5 | 0 | 表单 helper、说明 |
| `caption` | 12px | 500 | 1.4 | 0.02em | 标签、metadata、时间戳 |
| `overline` | 11px | 600 | 1.3 | 0.08em | 全大写小标签（如「FREE」「HD」） |
| `mono-num` | 13px | 500 | 1.4 | 0 | 尺寸/数值标识（如 1024×1024） |

**Display / H1 在 < 768px 缩放**：`clamp(24px, 5.5vw, 40px)`。
**正文最大行宽 65ch**：所有长描述、tooltip、说明都尊重此限制。

---

## 4. 间距 / 圆角 / 阴影 / 栅格

### 4.1 8px 基础栅格

```
space: 0 | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 64
```

- **组件内 padding**：8 / 12 / 16
- **组件间 gap**：12 / 16 / 24
- **区块 section gap**：32 / 48 / 64
- **页面内边距**：桌面 24，移动 16

### 4.2 圆角

| Token | 值 | 用途 |
|---|---|---|
| `radius-xs` | 4px | Chip、Badge、Tag |
| `radius-sm` | 6px | Input、Select、Button |
| `radius-md` | 10px | Toggle group、风格预设按钮 |
| `radius-lg` | 14px | 卡片、Panel |
| `radius-xl` | 20px | 大卡片、Lightbox 图片容器 |
| `radius-full` | 9999px | 头像、状态圆点 |

### 4.3 阴影（克制使用）

```css
/* 仅悬浮元素使用，杜绝外发光 */
shadow-card:   0 1px 0 rgba(255,255,255,0.04) inset,
               0 4px 16px rgba(0,0,0,0.4);
shadow-pop:    0 8px 28px rgba(0,0,0,0.5),
               0 0 0 1px rgba(255,255,255,0.04) inset;
shadow-focus:  0 0 0 3px rgba(217, 70, 239, 0.18);  /* 仅 focus ring */
```

> **禁用**：紫色外发光、霓虹光晕、Bootstrap default `box-shadow`。

### 4.4 栅格

- 主内容区最大宽 `1440px`，居中
- 创作页采用 **左 360px 参数面板 + 右弹性结果区** 的非对称双栏
- 画廊页采用 **CSS Grid auto-fill**，`minmax(220px, 1fr)`，gap 16

---

## 5. 组件视觉规范

### 5.1 按钮 Button

**主操作 Primary CTA**（如"生成图像"、"测试连通性"）：
- 高度 40px，padding `0 20px`，`radius-sm`
- 背景：紫粉渐变 `linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)`
- 文字：Spectral White，字重 600
- Hover：渐变向上偏移 2%、整体 scale `1.01`
- Active：translate-y `1px`（轻微按压感），无外发光
- Disabled：背景 `#27272F`，文字 Disabled Dust
- Loading：内部 spinner 改为"沙漏点点点"打字机循环

**次操作 Secondary**：
- 透明背景 + 1px Hairline Border + Mist Gray 文字
- Hover：背景变 Slate Card Raised，文字变 Spectral White

**幽灵按钮 Ghost**（如 ✨ 优化提示词）：
- 仅图标 + 文字，hover 时 Aurora Soft 背景
- 用于工具栏图标按钮

**危险按钮 Destructive**：
- 透明背景 + Signal Red 文字
- Hover：背景 `rgba(239, 68, 68, 0.1)`

### 5.2 输入框 Input / Textarea

- 背景 Carbon Surface，1px Hairline Border
- Hover 边框变 `#2A2A36`
- Focus：边框变 Aurora Violet + `shadow-focus`
- 占位符 Faded Steel，字号同 body
- Textarea 自动增高（min 96px / max 320px），右下角原生 resize 隐藏，改为 16px 拖拽提示符
- 字数计数右下角 caption，超限时变 Signal Red

### 5.3 卡片 Card

- 背景 Slate Card，1px Hairline Border，`radius-lg`
- Hover：背景 Slate Card Raised，边框变 `#28283A`
- 选中态：边框 Aurora Violet 1px + 内层 `shadow-focus`
- 内 padding 16，标题与正文间 gap 8

### 5.4 结果卡片 ResultCard（图片）

- `radius-xl`，aspect 跟随 size 比例
- 加载中：骨架闪烁 + Probe Cyan 渐变扫光（2s 循环）
- 失败：红色 ribbon 横贯顶部 + 中央错误描述 + 重试按钮
- 悬停：图片底部弹出半透明操作条（下载/复制/再生成/收藏/删除）
- 点击：lightbox

### 5.5 Tabs

- Underline 风格，激活态下划线为紫粉渐变 2px
- 非激活：Mist Gray 文字；激活：Spectral White 文字
- hover 时显示 Aurora Soft 背景轻晕（仅 4px 高的 underline 区）

### 5.6 Dialog / Modal

- 遮罩 `rgba(10, 10, 15, 0.7)` + 4px backdrop-blur
- 容器 Slate Card，`radius-xl`，最大宽 480px（确认） / 720px（设置子页） / 90vw（lightbox）
- 顶部 16 标题，主体 16 padding，底部 16 操作条
- 入场：fade + scale `0.96 → 1`，190ms ease-out

### 5.7 Toast（基于 sonner）

- 位置：右下角，距边距 24
- 背景 Slate Card Raised，`radius-md`，左侧 3px 状态色条
- 包含图标 + 标题 + 可选副本
- 自动消失：success 3s / info 4s / error 6s（手动可关）

### 5.8 Lightbox

- 全屏 `Void Black` 90% 遮罩
- 中央图片最大 `min(90vw, 90vh)`，`radius-xl`
- 顶部右侧：关闭(Esc)、下载、删除
- 左右大箭头切换，键盘 ← → 支持
- 图片底部漂浮信息条：prompt 摘要 + 模型 + 尺寸 + 时间

### 5.9 空状态 Empty State

- 不用 emoji，不用「No data」
- 中央 64px 抽象线条插画（用 lucide 图标 + 紫粉渐变描边）
- 标题 h3 + 说明 body-sm + 引导按钮
- 三个页面分别有定制空状态：
  - 创作页：「在左侧描述你想要的画面」+ 链接「打开设置填入 Key →」
  - 画廊页：「这里会保存你生成的所有作品」+ 链接「去创作 →」
  - 设置页 Key 未填：横幅引导

### 5.10 骨架屏 Skeleton

- 基底 Slate Card Raised
- 渐变扫光：`linear-gradient(90deg, transparent, rgba(34,211,238,0.08), transparent)`
- 2s 周期 `infinite`，从左到右滑过
- **只在图片/网格区使用**，不要全页骨架

### 5.11 Chip / Tag（用于风格预设 & Prompt 历史）

- 高度 28px，padding `0 12px`，`radius-xs`
- 未选：透明背景 + 1px Hairline Border + Mist Gray 文字
- 已选：Aurora Soft 背景 + Aurora Violet 文字 + 右侧 ✕ 移除图标
- Hover：边框变 Aurora Violet

### 5.12 Select / Dropdown

- 高度 36px，与 Input 同视觉
- 打开后下拉列表：Slate Card Raised，`radius-md`，shadow-pop
- 选项 hover：Aurora Soft 背景
- 当前选中：左侧 Aurora Violet 2px 指示条

### 5.13 Switch

- 32×18px，背景 `#27272F`（关）/ Aurora Violet（开）
- 滑块 14px 白色圆点，280ms spring

### 5.14 Slider（自定义尺寸用）

- 轨道 4px Hairline Border 圆角，已选部分紫粉渐变
- 滑钮 16px Spectral White 圆点，shadow-pop
- 悬停时滑钮上方浮出当前值 tooltip

### 5.15 状态指示灯（顶栏）

- 6px 圆点：未配置 `Disabled Dust` / 已配未测 `Caution Amber` / 已测试 `Pulse Green` / 失败 `Signal Red`
- 圆点有 1.6s 极轻呼吸动画（scale 1 → 1.15），仅 success/error 启用

---

## 6. 页面布局规范

### 6.1 全局壳

```
┌──────────────────────────────────────────────────────┐
│  TopBar  56px      [Logo]  ····  [status·gear·acct]  │
├──────┬───────────────────────────────────────────────┤
│      │                                                │
│ Side │              Main Content                      │
│  bar │              (max-width 1440, padding 24)      │
│ 240  │                                                │
│      │                                                │
└──────┴───────────────────────────────────────────────┘
```

- TopBar 高 56px，背景 `rgba(15, 15, 22, 0.8)` + `backdrop-blur-sm`，底部 1px Hairline Border
- Sidebar 默认 240px，折叠 72px（点 logo 切换）。背景 Carbon Surface，右侧 1px Hairline
- Sidebar 导航项：48×48 图标块 + 文字，激活态左侧 3px Aurora 渐变指示条 + Slate Card 背景

### 6.2 创作页 Create

```
┌─────────────────────────┬──────────────────────────────┐
│  ParamsPanel  360px     │   ResultsArea (flex 1)        │
│                         │                                │
│  [Prompt 多行 + ✨]     │   ┌─────┬─────┐               │
│  [历史 chip 行]         │   │ img │ img │  网格切换      │
│  [风格预设 chip grid]   │   │     │     │  1 / 2x2       │
│  [尺寸 button grid]     │   ├─────┼─────┤               │
│  [模型 / 质量 / 数量]   │   │ img │ img │               │
│                         │   └─────┴─────┘               │
│  [生成图像 CTA fullW]   │   元信息条                     │
└─────────────────────────┴──────────────────────────────┘
```

- ParamsPanel 内部用 `space-y-20`，区段间用 1px Hairline Subtle 隔开
- CTA 按钮始终 sticky 在 ParamsPanel 底部
- ResultsArea 默认显示最近一批；上方 tabs 可切「最近 / 历史」

### 6.3 画廊页 Gallery

```
┌──────────────────────────────────────────────────────┐
│  H1 画廊       [tabs: 全部·收藏]      [grid·waterfall]│
├──────────────────────────────────────────────────────┤
│  Grid: minmax(220, 1fr) gap 16                        │
│  ┌─────┬─────┬─────┬─────┬─────┬─────┐                │
│  │     │     │     │     │     │     │                │
│  └─────┴─────┴─────┴─────┴─────┴─────┘                │
│  ...                                                  │
└──────────────────────────────────────────────────────┘
```

- 默认网格，可切瀑布流（CSS columns）
- 卡片 hover 出操作条，与 ResultCard 一致
- 超过 100 张时顶部插入 Caution Amber 提示横幅

### 6.4 设置页 Settings

```
┌──────────────────────────────────────────────────────┐
│  H1 设置                                              │
├──────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐  │
│  │  API Key                          [密码框 + 测试] │  │
│  │  说明 caption                                    │  │
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │  默认图像模型               [Select]            │  │
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │  默认对话模型               [Select]            │  │
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │  数据管理                                        │  │
│  │  [导出] [清空作品] [清除所有本地数据]            │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

- 单列卡片表单，最大宽 720px 居中
- 每张卡片左侧标题 + 右侧控件，移动端堆叠为单列
- 危险操作（清除所有数据）置最底部，红色文字

---

## 7. 响应式

- **桌面 ≥ 1024px**：完整双栏（Sidebar + Params + Results）
- **平板 768-1024px**：Sidebar 折叠为 72px；Params 收为顶部抽屉
- **移动 < 768px**：Sidebar 变底部 tab bar；Create 页 Params 改为顶部可展开面板
- 所有交互元素最小命中区 44×44
- 图片不溢出，所有长文本不横向滚动
- Section gap 自适应 `clamp(24px, 6vw, 48px)`

---

## 8. 动效原则

| 场景 | 时长 | 缓动 |
|---|---|---|
| 卡片入场（gallery / results） | 280ms | `cubic-bezier(0.22, 1, 0.36, 1)` |
| 卡片入场 stagger | 30ms / 项 | — |
| 按钮 hover scale | 160ms | `ease-out` |
| 按钮 active press | 90ms | `ease-in` |
| Dialog 弹出 | 190ms | `ease-out` |
| Dialog 消失 | 140ms | `ease-in` |
| 骨架扫光 | 2000ms | `linear`（仅这个允许 linear） |
| 状态点呼吸 | 1600ms | `ease-in-out infinite alternate` |
| 紫粉 CTA 渐变 hover 偏移 | 600ms | `ease-in-out` |
| Toast 入场 | 240ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` |

**全局原则**：
- 只动 `transform` 和 `opacity`，禁止动 `width/height/top/left`
- 大于 3 个元素同时入场必须 stagger
- Reduced motion 媒体查询下：所有 transform 动画退化为 opacity-only
- 禁用 cinematic 弹跳；除 toast 入场外，不使用 spring overshoot

---

## 9. Tailwind 主题片段（直接粘贴）

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0A0A0F',
        carbon: '#0F0F16',
        slate: {
          card: '#14141C',
          raised: '#1A1A24',
        },
        hairline: {
          DEFAULT: '#1F1F2A',
          subtle: 'rgba(255,255,255,0.06)',
        },
        ink: {
          DEFAULT: '#F4F4F7',
          mist: '#A1A1AA',
          faded: '#71717A',
          disabled: '#3F3F46',
        },
        aurora: {
          violet: '#8B5CF6',
          fuchsia: '#D946EF',
          soft: 'rgba(139,92,246,0.12)',
          ring: 'rgba(217,70,239,0.35)',
        },
        status: {
          ok: '#10B981',
          warn: '#F59E0B',
          err: '#EF4444',
          info: '#22D3EE',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'PingFang SC',
          'Source Han Sans CN',
          'Microsoft YaHei',
          'system-ui',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'SF Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        display: ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        h1: ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '600' }],
        h2: ['1.375rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        h3: ['1.125rem', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['1rem', { lineHeight: '1.55' }],
        body: ['0.875rem', { lineHeight: '1.55' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.5' }],
        caption: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em', fontWeight: '500' }],
        overline: ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.08em', fontWeight: '600' }],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 16px rgba(0,0,0,0.4)',
        pop: '0 8px 28px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
        focus: '0 0 0 3px rgba(217,70,239,0.18)',
      },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)',
        'skeleton-sheen':
          'linear-gradient(90deg, transparent, rgba(34,211,238,0.08), transparent)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        sheen: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 280ms cubic-bezier(0.22, 1, 0.36, 1) both',
        sheen: 'sheen 2s linear infinite',
        breathe: 'breathe 1.6s ease-in-out infinite alternate',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
} satisfies Config;
```

### globals.css 片段

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
  --aurora: linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%);
}

html, body, #root {
  background: #0A0A0F;
  color: #F4F4F7;
  font-family: 'Inter', 'PingFang SC', 'Source Han Sans CN', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

::selection {
  background: rgba(139, 92, 246, 0.35);
  color: #F4F4F7;
}

@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. 反模式（明确禁止）

- ❌ 紫色外发光、霓虹光晕、`box-shadow: 0 0 20px purple`
- ❌ 大面积紫粉渐变背景或大段文字 fill 渐变
- ❌ emoji 充当 UI 图标（仅文字提示中可有限使用）
- ❌ 马卡龙色、糖果色、Bootstrap default blue
- ❌ 纯黑 `#000000`
- ❌ "AI ✨ 智能 🚀 极致" 类营销 buzzword
- ❌ 3 个等宽卡片横排「特性区」
- ❌ Hero 居中大字 + 副标 + 双 CTA（创作工具不需要 hero）
- ❌ 在不需要的地方使用毛玻璃（仅顶栏可有微弱 backdrop-blur）
- ❌ 自定义 cursor / 大于 1s 的 hover 动画
- ❌ 编造的统计数据（"99.99% 满意度"等填充文案）
- ❌ 出现 "Lorem ipsum"、"Acme"、"John Doe" 等占位
- ❌ 重复使用相同的紫粉光晕作所有元素的 hover 反馈（视觉疲劳）
- ❌ 强行 dark/light 双主题切换（v1 仅深色）
