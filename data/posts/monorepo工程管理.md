---
title: "monorepo & 工程化项目构建流程"
time: "2026-04-08"
tags: ["前端工程化", "monorepo"]
summary: "关于学习 Monorepo 工程基础以及工程项目构建流程的记录"
---

# 1. monorepo 介绍

![](assets/monorepo工程管理/image (1).png)

这两个项目架构选择核心在于：**组件/模块之间的关联程度**。

## 1.1 Multirepo 模式

前端、后端、工具库分别占用独立的 Git 仓库，即一仓库对应一项目的模式，如果使用这种方式，一个业务库要引用一个编写的工具库，就需要将工具库通过 npm 发布然后再让业务库下载对应的依赖包来调用。这样会产生几个痛点：

- **发布依赖感**：如果开发了一个解析器库，必须先 `npm publish` 到网上，业务项目才能 `npm install` 更新。
- **调试低效**：修改一个底层 Bug，需要跨仓库操作，无法实时看到业务层的反馈。
- **版本冲突**：业务 A 可能用的是 `v1.0` 的库，业务 B 用的是 `v2.0`。当多个业务需要统一升级时，需要手动去每个仓库修改，容易导致运行结果不一致。

## 1.2 Monorepo 模式

将关联性强的多个项目放在同一个 Git 仓库中管理。主要靠 **本地软链接**，通过 `pnpm workspace` 建立内部引用。主要用于组件库开发、复杂全栈业务、基建与 UI 分离的项目等。其好处在于：

- **本地零延迟调试**：工具包（如 `ast-parser`）直接链接到业务包（如 `editor`）的依赖列表中。修改源码，业务层立刻生效，无需发布到 npm。
- **依赖版本高度统一**：所有子项目共享根目录的配置（ESLint/TSConfig），强制使用相同版本的第三方依赖（如 React），消灭“版本不一致”导致的问题。
- **全栈类型共享**：前端和后端虽然两者在运行时没有联系，但可以在 Monorepo 中共享一套 **TS Interface**，这样可以同步类型和对应报错。

# 2. 项目开发流程

文件结构：

```bash
Project/
├── apps/           # 可运行的应用：能独立启动、有入口文件
│   ├── frontend/   # 用户访问的后台管理系统
│   ├── backend/    # 提供 API 的 Node 服务
│   └── play/       # 调试沙盒：专门用来预览 packages 组件效果
│
├── packages/       # 被引用的模块：不能独立运行，供 apps 调用
│   ├── utils/      # 纯函数库
│   ├── components/ # UI 组件库
│   └── editor/     # 业务组件（如 Markdown 编辑器，可被多个 app 复用）
│
├── package.json    # 根配置
└── pnpm-workspace.yaml  # 声明哪些目录属于工作区Project
```

考虑将业务相关的包放在 apps 文件夹中，将非业务组件型的包放在 packages 文件夹中，可以设定权限规定只能 apps 中的可以引用 packags 中的包，反之则不行。

**面试可说**：在架构选型上，采用了基于 **pnpm workspace** 的 Monorepo 方案。我将目录严格划分为 `apps/`（业务应用层）和 `packages/`（底层基础设施层）。这里的核心原则是 **‘单向依赖约束’**：即只允许 `apps` 引用 `packages`，严禁反向引用或 `packages` 之间产生复杂的循环依赖。为了保证这种约束，我会结合 **ESLint (eslint-plugin-import)** 或 **Dependency Cruiser** 这种工具进行自动化检查。比如在开发 markdown 编辑器时，很纠结 eidtor 是否作为业务还是工具，如果放在 `apps`，它就无法被后续的博客系统复用；如果直接放 `packages`，在开发初期又缺乏运行环境。最终我决定将其抽离为 `packages/editor`，并在 `apps/` 下专门建立了一个 **play**项目。这样既能保证编辑器作为独立模块的纯粹性，又提供了一个隔离的开发环境。

## 2.1 基础工程构建

**第一步**：搭建项目骨架

```bash
# 1. 创建并进入根目录
mkdir markdown-editor && cd markdown-editor

# 2. 根目录初始化
pnpm init -w # -w是--workspace-root的缩写

# 3. 快速创建推荐的物理目录（monorepo特有结构层次）
mkdir -p apps packages shared
```

> 1. `-w`(`--workspace-root` ) 只是为了在工程根目录初始化，这意味可以在任何文件下执行命令最后都会在根目录建立 package.json 文件；
> 2. `-p`是为了在目录下创建多个子包时，当子包不存在是自动创建，存在也不会报错；
> 3. 子包一般配置别名：@hele160/markdown-editor，这能有效避免与公网上的同名包冲突；

**第二步**：monorepo 核心配置

- 配置 `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/**" # 增加双星号，支持更深的层级
  - "packages/**"
  - "shared/**"
```

- 配置`.npmrc`

```toml
# 强制要求使用 pnpm，防止团队成员误用 npm/yarn 导致 lock 文件混乱
engine-strict=true
```

> **注意**：不要配置`shamefully-hoist=true `这一个命令，传统的 npm/yarn 都是扁平化的，一个依赖 A 可能会应用依赖 B，如果在项目中引入 B 依赖，然而 B 依赖并没有才 Package.json 文件中，这就是所谓的幽灵依赖，pnpm 成功解决了这个问题，它将所有的非 Package.json 中的依赖全部放在.pnpm 中进行统一管理，项目无法引入里面的包，如果配置这个参数，将这里的包提升至 node_modules 目录可以被引用，避免程序崩溃，但是这种操作有些得不偿失了。

- 配置`turbo.json`

> 需要先安装： `pnpm add -Dw turbo`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "out/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

第三步：全局文件配置

- 配置`package.json`，将子包命令全由 Turbo 主导

```json
"scripts": {
  "dev": "turbo dev",
  "build": "turbo build",
  "lint": "turbo lint",
  "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
  "clean": "turbo clean && rm -rf node_modules"
}
```

- 配置`.editorconfig`

```json
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
```

- 环境版本锁定

配置根目录`package.json`

```json
"engines": {
    "node": ">=18",
    "pnpm": ">=7"
  },
```

## 2.2 静态防线配置

### 2.2.1 TS 配置

在 monorepo 工程架构中，TS 配置一般有 3 种模式：

1. 完全分散：每个子包一份独立 `tsconfig`。适合包之间技术栈差异很大。
2. 完全集中：根目录一份 tsconfig，子包几乎不写自己的。适合所有子包类型很一致、规模不大
3. 混合式（最常用）：根目录放 tsconfig.base.json，统一通用规则；每个子包 extends 它，再覆盖自己的差异项。这样一规范 + 保留灵活性，维护成本最低。

> 该 markdown 源码采用的是第一种形式，这种方式一旦项目多起来就会产生依赖的版本差异，这样维护成本会很大，而且会出现版本兼容错误，后续自己做的时候考虑第三种方案：**根基线 + 子包继承**。（**面试可说的点**）

这里采用混合式配置：

```bash
# 根目录安装，子包不需要再安装了
pnpm add  -D -w typescript @types/node
```

第一步：配置根目录`tsconfig.base.json`（`base`表示其明确是用来被继承的）

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "module": "esnext",
    "target": "esnext",
    // 专门配合 Vite 等构建工具使用，允许在 TS 中自由使用 ESM 的导入规则，如省略扩展名
    "moduleResolution": "bundler",
    "moduleDetection": "force",

    "types": [],
    "lib": ["esnext"],
    "skipLibCheck": true, // 跳过第三方库的检查，提速

    "sourceMap": true,

    "composite": true, // 允许项目被引用，并增量编译
    "declaration": true, // 类型文件与源码的映射，方便点进源码
    "declarationMap": true, // 类型文件与源码的映射，方便点进源码

    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    "verbatimModuleSyntax": false,
    "isolatedModules": true, //确保每个文件都能被独立安全地转译
    "noUncheckedSideEffectImports": true
  },
  "exclude": ["node_modules"]
}
```

第二步：子包继承并独立配置

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    // 指定编译后的产物
    "outDir": "./dist",
    "rootDir": "./src",

    "types": ["node"],
    "lib": ["ESNext"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"],

  // 建立包之间的联系
  "references": [
    { "path": "../../packages/utils" },
    { "path": "../../packages/core" }
  ]
}
```

别名配置，一般在根目录配置，子包只需要继承即可：

```json
// 设置 baseUrl 表示 path 中的路径都是基于该位置计算的
"baseUrl": ".",
"paths": {
    "@hele160/*": ["packages/*/src", "shared/*/src"],
    "@utils/*": ["shared/utils/src/*"]
}
```

monorepo 配置别名也可以在子包`package.json`中配置：

```json
"dependencies": {
  "@hele160/core": "workspace:*"
}
```

之后`pnpm install`下载 (在本项目中下载要引用包的软链接)，当`import { ... } from "@hele160/core"` 时，TS 会自动在 `node_modules` 里找到这个快捷方式，然后顺着它直接跳进 `packages/core`来进行引用。

> 如果是脚手架构建的单体项目，总体和根目录的文件配置差不多，只是文件为`tsconfig.json`,且配置文件中的`composite: true`删掉。
>
> 单体项目配置别名：
>
> ```json
> // tsconfig.json
> {
>   "compilerOptions": {
>     "baseUrl": ".",
>     "paths": {
>       "@/*": ["src/*"]
>     }
>   }
> }
> ```

### 2.2.2 代码质量与风格

#### ESlint

```
pnpm add -Dw eslint@latest @eslint/js globals typescript-eslint eslint-plugin-react eslint-plugin-react-hooks eslint-config-prettier eslint-plugin-prettier eslint-plugin-react-refresh
```

> 这里的 `eslint-config-prettier` 是为了 关闭所有与 Prettier 冲突的 ESLint 规则；而` eslint-plugin-prettier`（为了正常工作必须要配置.prettierrc 文件）是为了让 ESlint 运行 prettier 的规则（prettier 的错误会上报到 ESlint）；@eslint/js 识别 JS 语法；globals 识别全局变量；其实还要添加@types/node，但配置 TS 已经下载。

根目录配置文件：`eslint.config.js`

```js
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default tseslint.config(
  // 1. 全局忽略
  { ignores: ["dist", "node_modules", "coverage"] },

  // 2. 基础配置 (JS + TS)
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    // 3. 针对所有 TS/TSX 文件
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node, // 兼容 Node 环境，不再需要担心 process 报错
        ...globals.es2020,
      },
      // 告诉 ESLint 如何处理 TS
      parserOptions: {
        project: [
          "./tsconfig.base.json",
          "./packages/*/tsconfig.json",
          "./apps/*/tsconfig.json",
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    // 4. 插件声明
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      prettier: prettierPlugin,
    },
    // 5. 自定义规则
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "prettier/prettier": "error", // 开启这个，Prettier 错误就会报成 ESLint 错误
      "no-unused-vars": "off", // 关闭原生的，用 TS 的
      "@typescript-eslint/no-unused-vars": ["warn"],
      "@typescript-eslint/no-explicit-any": "warn", // 建议设为 warn 而非 off，提醒自己少用 any
    },
  },

  // 6. 最后：关闭所有冲突规则 (必须放在数组最后)
  prettierConfig,
);
```

> 子包不需要配置，会自动往上找。但是如果子包是 node 环境，此时可以

#### Prettier

```
pnpm add  -Dw prettier
```

> 1. 注意需要安装对应的依赖包而不是安装插件，这是因为插件不能保障所有的电脑和系统都安装，通过配置 prettire 文件可以后续便于后续检测部署。VS Code 插件用来执行配置的规矩（当然如果没有安装对应的依赖或者配置文件，就会用插件默认的配置文件和包），当保存时插件会自动去 `node_modules` 里找装好的那个 `prettier` 包来干活。
> 2. 拓展：后续检测部署
>    - Husky：让代码在 `git commit` 的瞬间自动跑一遍 `prettier`。格式不对，根本不让提交。
>    - CI：当代码推送到服务器准备部署前，服务器会跑一遍格式检测。如果格式乱了，部署流程直接中断并报错

配置`.prettierrc` 文件，

```json
{
  "semi": false, // 结尾不加分号 (React 社区流行)
  "singleQuote": true, // 使用单引号
  "trailingComma": "all", // 尽可能打印尾随逗号
  "printWidth": 80, // 每行最大字符数
  "tabWidth": 2, // 缩进空格数
  "proseWrap": "preserve", // Markdown 换行策略：保持原样
  "overrides": [
    {
      "files": "*.md",
      "options": {
        "parser": "markdown" // 显式指定 Markdown 解析
      }
    }
  ]
}
```

为了不检查打包后的目录文件或者不想检查的文件，需要配置`.prettierignore` 文件：

```json
# 依赖和构建
node_modules
dist
build
out
.next

# 缓存
.pnpm-store
.eslintcache

# 自动生成的文件
package-lock.json
pnpm-lock.yaml

# 你的 Markdown 项目可能会产生的临时预览文件
*.tmp
```

#### 拼写检查

```bash
pnpm add -Dw cspell @cspell/dict-lorem-ipsum @cspell/dict-software-terms @cspell/dict-typescript
```

配置 `cspell.json`:

```json
{
  "version": "0.2",
  "language": "en",
  // 1. 核心：集成你安装的外部词库，让它们真正生效
  "import": [
    "@cspell/dict-lorem-ipsum/cspell-ext.json",
    "@cspell/dict-software-terms/cspell-ext.json",
    "@cspell/dict-typescript/cspell-ext.json",
    "@cspell/dict-node/cspell-ext.json"
  ],
  // 2. 项目特有词汇：这些是库里没有的，或者你自定义的
  "words": [
    "pnpm",
    "codemirror",
    "vite",
    "lucide",
    "unocss",
    "zustand",
    "ant-design",
    "vercel",
    "staged"
  ],
  // 3. 忽略路径：防止检查第三方库和打包文件
  "ignorePaths": [
    "node_modules/**",
    "dist/**",
    "build/**",
    ".vscode/**",
    "pnpm-lock.yaml",
    "package-lock.json",
    "**/*.svg",
    "**/*.webp",
    "**/*.png"
  ],
  // 4. 针对 Markdown 的增强：忽略链接，防止长 URL 报错
  "overrides": [
    {
      "filename": "**/*.md",
      "languageId": "markdown",
      "ignoreRegExpList": ["/\\[.*?\\]\\(.*?\\)/g"]
    }
  ]
}
```

集成 husky：

```json
"lint-staged": {
  "*.{js,ts,tsx,json,md}": [
    "cspell lint --no-summary --no-progress", // 检查拼写
    "prettier --write"                        // 格式化
  ]
}
```

## 2.3 动态准入配置

在代码进入仓库之前，对代码进行检查，如果检查不合格直接打回。

### 2.3.1 Git 初始化配置

初始化`git`仓库：

```bash
git init
```

配置` .gitignore`：

```bash
# 依赖与产物
node_modules
dist
build
.next
.turbo

# 日志与环境
*.log
.env*
.DS_Store

# 缓存
.cache
.eslintcache
```

### 2.3.2 husky & lint-staged

`husky`的作用是实现在代码提交之前的检查，如果不符合规范则直接打回。`lint-staged`则是**只会过滤出 Git 暂存区的文件 ** 并进行检查，避免全局文件的检查，提高了效率。

```bash
pnpm -Dw add husky lint-staged
# 初始化
pnpm husky init
```

配置 `husky/pre-commit` ：

```bash
pnpm exec lint-staged
```

配置`lint-staged`规则：

```json
// package.json
{
   "scripts": {
      // fang'bian
      "prepare": "husky"
    }
  "lint-staged": {
    "*.{js,ts,tsx,vue}": [
      "prettier --write",
      "eslint --fix"
    ],
    "*.{scss,less,css,html,md}": [
      "prettier --write"
    ]
  }
}
```

> 要先配置`prettier`和`eslint`。

执行流程：当`git commit`时，被`husky`拦截，之后开始执行`.husky文件`下的钩子中的命令，执行`pre-commit`中的 lint-staged，对已经改的文件进行校验修正 (根据`prettier`和`eslint`)，如果实在修复不了就打回。

### 2.3.3 信息提交规范

使用`Commitlint & cz-git`强制规范提交信息，前提要安装并且配置 Husky。

```bash
pnpm add -Dw @commitlint/cli @commitlint/config-conventional commitizen cz-git
```

> `@commitlint/cli`是`Commitlint` 的核心引擎，负责阅读提交的 message，根据规则判定通不通过；
>
> `@commitlint/config-conventional`是检查的官方检查标准手册，一般要继承并根据实时情况拓展；
>
> `commitizen`是运行 cz 命令时的提问框架；
>
> `cz-git`是`commitizen`的适配器（一个插件），提供更好的交互体验更强大的拓展空间；

配置`package.json`

```json
// package.json
"scripts": {
    "commit": "cz"
  },
"config": {
    "commitizen": {
      "path": "node_modules/cz-git"
    }
  }
```

配置 `commitlint.config.js` ：

```javascript
export default {
  extends: ["@commitlint/config-conventional"],
  prompt: {
    messages: {
      type: "选择提交类型：",
      subject: "填写简短描述：",
      confirmCommit: "确认提交该信息？",
    },
    types: [
      { value: "feat", name: "feat:     新增功能" },
      { value: "fix", name: "fix:      修复缺陷" },
      { value: "docs", name: "docs:     文档更新" },
      { value: "style", name: "style:    格式调整" },
      { value: "refactor", name: "refactor: 代码重构" },
      { value: "perf", name: "perf:     性能优化" },
      { value: "test", name: "test:     测试相关" },
      { value: "chore", name: "chore:    其他修改" },
    ],
    skipQuestions: ["scope", "body", "breaking", "footer", "footerPrefix"],

    useEmoji: false,
    subjectMaxLength: 100,
  },
};
```

在 husky 文件中创建`commit-msg`：

```bash
npx --no --commitlint --edit "$1"
```

> 交互流程：
>
> - 当执行`pnpm commit`时，触发`commitizen`，`commitizen`加载`cz-git`插件，开始填表，完成之后生成对应的标准提交字符串，`commitizen` 会在后台**自动执行** `git commit -m "生成的字符串"`，`Git`准备写入记录，触发`commit-msg`钩子，`@commitlint/cli`按照`commitlint.config.js`的配置文件检查信息，确认没有问题则放行入库，不符合则报错。
> - 也可以直接进行`git commit`，不需要填表，husky 会拦截判断字符串，符合就可以通过（不需要`commitizen`、` cz-git`触发填表）。

## 2.4 环境与工程配置

### 2.4.1 子包协作

在相应子包中的 `package.json` 文件的 `dependencies` 中编写：

```json
"dependencies": {
  "@monorepo/play" : "workspace: *"
}
```

随后执行 `pnpm i`下载相关的依赖（实际上是加载相应的软链接，软链接的两个包会同步变化）从而实现引用相关依赖的目的。

但是当引用依赖时会遇到问题，该依赖依然是一个独立的模块，而且一般引用的包是打包后的，需要对要引用包进行配置：

```json
// package.json
// module 是为了确保其他包引用时自动找到的入口文件，type 时类型定义。
"module": "./dist/index.esm.js",
"types": "./dist/index.d.ts",
```

### 2.4.2 版本分发

目前最主流的方案是 Changesets，它解决了“哪些包需要发版”和“版本号怎么定”的问题。

- 第一阶段：开发者记录变动

开发者完成代码后，不直接改 `package.json`，而是运行：

```bash
pnpm changeset
```

**交互式询问**：哪个包改了？是重大更新、功能新增还是修复？

**生成文件**：在 `.changeset/` 目录下生成一个随机命名的 `.md` 文件，记录了变动信息。这文件要随代码一起提交到 Git。

- 第二阶段：消耗变动并更新版本

在准备发布时，运行：

```bash
pnpm changeset version
```

**自动化魔术**：它会读取所有 `.md` 文件，自动计算每个包的新版本号。

**依赖联动**：如果 `utils` 升级了，引用它的 `components` 包的版本号也会被自动抬升。

**生成 Changelog**：自动把 `.md` 里的描述提取出来，写入每个包的 `CHANGELOG.md` 中。

- 第三阶段：正式发布

```bash
pnpm changeset publish
```

- 执行 `pnpm publish` 动作。

> **注意**：它会自动处理 `workspace:*`。在发布到 NPM 时，它会将这个协议替换成**真实的当前版本号**，确保用户安装后依赖关系正确。
