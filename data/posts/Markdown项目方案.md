---
title: 'Markdown 编辑器项目方案'
time: '2026-04-24'
tags: ["项目"]
summary: 'Markdown 编辑器项目的技术方案与大纲'
---

## 项目需求分析

### 1. 单体业务闭环

**核心目标**：快速跑通 Markdown 编辑器的核心链路，建立标准的产品化交互体验。

- **编辑渲染链路**：基于 **CodeMirror 6** 与 **Zustand** 构建响应式状态流，通过 **marked** 实现高性能的实时预览，确保“所见即所得”。
- **交互体验增强**：
  - 实现工具栏指令驱动（加粗、代码块等），降低用户编辑门槛。
  - 攻克**同步滚动**算法，解决长文档编辑时的视觉偏移问题。
  - 支持多媒体（图片）的即时处理与展示。
- **工程健壮性**：引入 **XSS 过滤机制** 与 **Sass 变量体系**，确保存储安全与多主题（深/浅色）适配。

---

### 2.工程原理升级

**核心目标**：从“写业务”转向“做工程”，通过重构展示对底层原理的理解和大型项目的架构能力。

- **架构演进 (Monorepo)**：
  - 使用 `pnpm workspaces` 将应用拆分为业务侧（Web）与逻辑侧（Parser/Shared），提升代码复用率与模块边界感。
  - 建立规范化流水线（Husky/Lint-staged），将代码质量保障固化在 Git 工作流中。
- **底层自研 (AST Parser)**：
  - **深度解构**：手写词法分析（Lexer）与语法转换（Transformer），将字符串转换为抽象语法树（AST），展示算法功底。
  - **双引擎对标**：支持自研引擎与工业级引擎的动态切换，作为性能与准确性的对比基准。
- **质量保障体系**：
  - 引入 **Vitest** 对解析算法进行全量单元测试，确保复杂嵌套语法下的解析稳定性。
  - 引入 **Turborepo** 优化多包构建链路，提升工程开发效率。

---

## 二、数据流向说明

- **输入流**：用户在 `Editor` 键入 $\rightarrow$ 触发 CodeMirror `onChange` $\rightarrow$ 调用 Store 的 `setContent`。
- **解析流**：Store 内容变化 $\rightarrow$ `Preview` 监听 `content` $\rightarrow$ 调用 `Parser` (Marked/自研) 转换为 HTML。
- **反馈流**：Store 更新 $\rightarrow$ 触发 `localStorage` 缓存持久化。
- **指令流**：点击 `Toolbar` 按钮 $\rightarrow$ 调用编辑器实例 `dispatch` $\rightarrow$ 在光标处插入语法 $\rightarrow$ 驱动输入流。

---

## 三、核心技术选型

| 模块     | 选型                              | 理由                                       |
| :------- | :-------------------------------- | :----------------------------------------- |
| **框架** | **React 19**                      | 主流选择，适合组件化开发。                 |
| **内核** | **CodeMirror 6**                  | 函数式配置，扩展性极强，现代编辑器的标配。 |
| **状态** | **Zustand**                       | 轻量级，零样板代码，性能优异。             |
| **样式** | **Sass + Modules**                | 大厂通用方案，解决样式污染，支持变量管理。 |
| **解析** | **Marked $\rightarrow$ 自研 AST** | 先借力快速产出，后自研展示深度。           |
| **构建** | **Vite**                          | 极速启动与热更新体验。                     |

## 四、数据流向模型

为了支撑上述两个阶段，应用始终遵循清晰的单向数据流：

- 输入流：Editor 键入 $\rightarrow$ Store.setContent。
- 解析流：Store.content 变化 $\rightarrow$ useMarkdown 调用渲染引擎 (Marked/自研) $\rightarrow$ Preview 渲染。
- 反馈流：Store 更新 $\rightarrow$ 自动持久化至 localStorage。
- 指令流：Toolbar 点击 $\rightarrow$ 调用 view.dispatch $\rightarrow$ 编辑器光标处插入内容 $\rightarrow$ 触发输入流。

---

### 1. 阶段一 (单体架构与核心业务)

#### 1.1 项目结构

```text
src/
├── components/          # 功能组件
│   ├── Toolbar/         # 工具栏 (Toolbar.tsx, Toolbar.module.scss)
│   ├── Editor/          # 编辑区 (CodeMirror 封装，核心编辑模块)
│   └── Preview/         # 预览区 (HTML 渲染)
├── store/               # 状态管理
│   └── useEditorStore.ts # 存放 content, layout, theme 等 (持久化模块)
├── hooks/               # 逻辑封装
│   ├── useMarkdown.ts   # 封装解析逻辑 (预览渲染模块)
│   └── useScrollSync.ts # 封装同步滚动 (交互控制模块)
├── styles/              # 全局样式与变量
│   └── variables.scss
└── App.tsx              # 主页面布局
```

#### 1.2 实现模块

核心编辑模块 (Editor Module)

- 基础集成：封装 CodeMirror 6，配置 Markdown 语法高亮、行号、自动换行。

- 状态接管：建立 Zustand Store，实现编辑器内容与全局状态的实时同步。

- 指令处理器：实现一个 dispatchCommand 函数，支持通过代码控制编辑器（如：加粗、插入链接、撤销/重做）。

预览渲染模块 (Preview Module)

- 解析引擎：集成 marked 或 micromark 进行初版渲染。

- 样式容器：引入 github-markdown-css，处理渲染后的 HTML 样式隔离（CSS Modules）。

- 安全过滤：引入 DOMPurify 解决潜在的 XSS 攻击风险（这是面试常见考点）。

交互控制模块 (Interaction Module)

- 快捷工具栏：实现加粗、斜体、标题、代码块等点击插入功能。

- 同步滚动：实现 Editor 与 Preview 区域的 scrollTop 比例映射同步。

- 图片集成：拦截 paste 和 drop 事件，实现图片转 Base64 实时预览。

持久化与环境模块 (Infrastructure)

- 草稿箱：利用 localStorage 实现内容的自动保存与恢复。

- 主题系统：基于 Sass 变量实现浅色/深色模式切换。

#### 1.3 核心库

核心基础库：

- react/react-dom：框架
- codemirror：编辑器内核
- zustand：状态管理
- marked：解析引擎 (后续自研，但是要保留该库，考虑设置切换渲染引擎，这样可以实时切换对比)
- sass：演示方案，配合 CSS Modules

交互增强库：

- dompurify:交互安全
- highlight.js：代码高亮
- github-markdown-css：样式基准
- lucide-react: 图标库

### 2. 阶段二 (集成 monorepo 以及手写基础渲染库)

#### 2.1 项目结构

```text
.
├── apps/
│   └── web/                # 原来的 React 主应用 (单体版的 src 迁移而来)
│       ├── src/
│       ├── package.json
│       └── vite.config.ts
├── packages/
│   ├── parser/             # 自研 Markdown 解析引擎 (核心竞争力)
│   │   ├── src/
│   │   │   ├── lexer.ts    # 词法分析 (将字符串转为 Tokens)
│   │   │   ├── ast.ts      # AST 结构定义与转换逻辑
│   │   │   └── index.ts    # 导出解析函数
│   │   ├── tests/          # Vitest 测试用例
│   │   └── package.json
│   ├── ui/                 # (可选) 沉淀的通用 UI 组件库
│   │   └── ...
│   └── shared/             # 共享的常量、类型定义 (TypeScript Interfaces)
├── package.json            # 根目录配置
├── pnpm-workspace.yaml     # pnpm 工作区定义
└── turbo.json              # (可选) 任务编排工具，提升构建速度
```

#### 2.2 模块实现

Monorepo 基建重构

- 架构迁移：使用 pnpm workspaces 将项目拆分为以下包：
  - apps/web: 存放 React 业务代码。

  - packages/parser: 存放自研的 Markdown 解析逻辑。

  - packages/ui: （可选）存放通用的 UI 组件，如 Button、Modal。

- 共享配置：统一根目录的 ESLint、Prettier、tsconfig 配置，实现全量类型安全。

自研解析引擎

- 词法分析 (Lexer)：编写正则扫描器，将原始字符串切分为 Token 流。

- 语法转换 (Transformer)：将 Token 转换为 AST (抽象语法树)。

- 生成器 (Generator)：将 AST 转换为 HTML 字符串。

- 支持嵌套：解决“列表内包含代码块”等递归嵌套解析逻辑。

自动化与质量保障

- 单元测试：使用 Vitest 为 packages/parser 编写测试用例，覆盖各种边缘语法。

- CI/CD 初探：配置 GitHub Actions，在 Push 代码时自动运行测试和构建。

- 文档沉淀：在 README 中绘制架构演进图，详细记录为什么要从单体迁移到 Monorepo。

#### 2.3 核心库

- monorepo：项目架构升级
- vitest：单元测试
- husky + lint-staged: Git 规范
- turborepo：加速 monorepo 的构建和缓存，一般配套使用
