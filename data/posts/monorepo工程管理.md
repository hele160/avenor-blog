---
title: 'monorepo 工程管理'
time: '2026-04-08'
tags: ["前端工程化","monorepo"]
summary: '关于学习 Monorepo 工程基础的记录'
---

# 1. monorepo 介绍
![](assets/monorepo工程管理/image (1).png)

这两个项目架构选择核心在于：**组件/模块之间的关联程度**。

## 1.1 Multirepo 模式

前端、后端、工具库分别占用独立的 Git 仓库，即一仓库对应一项目的模式，如果使用这种方式，一个业务库要引用一个编写的工具库，就需要将工具库通过 npm 发布然后再让业务库下载对应的依赖包来调用。这样会产生几个痛点：

+ **发布依赖感**：如果开发了一个解析器库，必须先 `npm publish` 到网上，业务项目才能 `npm install` 更新。
+ **调试低效**：修改一个底层 Bug，需要跨仓库操作，无法实时看到业务层的反馈。
+ **版本冲突**：业务 A 可能用的是 `v1.0` 的库，业务 B 用的是 `v2.0`。当多个业务需要统一升级时，需要手动去每个仓库修改，容易导致运行结果不一致。

## 1.2 Monorepo 模式

将关联性强的多个项目放在同一个 Git 仓库中管理。主要靠 **本地软链接**，通过 `pnpm workspace` 建立内部引用。主要用于组件库开发、复杂全栈业务、基建与 UI 分离的项目等。其好处在于：

+ **本地零延迟调试**：工具包（如 `ast-parser`）直接链接到业务包（如 `editor`）的依赖列表中。修改源码，业务层立刻生效，无需发布到 npm。
+ **依赖版本高度统一**：所有子项目共享根目录的配置（ESLint/TSConfig），强制使用相同版本的第三方依赖（如 React），消灭“版本不一致”导致的问题。
+ **全栈类型共享**：前端和后端虽然两者在运行时没有联系，但可以在 Monorepo 中共享一套 **TS Interface**，这样可以同步类型和对应报错。

# 2. 文件组织结构
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

# 3. 规范统一化管理
## 3.1 构建 monorepo
+ 创建项目`monorepo` 文件夹
+ 创建配置文件：` echo "" > pnpm-workspace.yaml`

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

+ 初始化 package.json 文件：`pnpm --workspace-root init`或者`pnpm -w init`。

> 1. --workspace-root 只是为了在工程根目录初始化，这意味可以在任何文件下执行命令最后都会在根目录建立 package.json 文件；
> 2. 子包一般配置别名：@hele160/markdown-editor，这能有效避免与公网上的同名包冲突；
>

## 3.2 环境版本锁定
在根目录的 package.json 配置文件添加：

```json
"engines": {
    "node": ">=18",
    "pnpm": ">=7"
  },
```

当使用低于 node 版本时会报错但还是**会下载相关依赖**，为了实现下载之前就报错，可以添加文件 `.npmrc`并且配置：

```json
shamefully-hoist=true
```

## 3.3 TS 配置
可以选用两种配置方式，一种是集中在根目录下配置，另外一种是通过在每一个子组件中分别进行配置。配置一般有 3 种模式：

1. 完全分散：每个子包一份独立 tsconfig。适合包之间技术栈差异很大，比如 React 应用、Node 服务、库构建混在一起。
2. 完全集中：根目录一份 tsconfig，子包几乎不写自己的。适合所有子包类型很一致、规模不大。但是这样一旦有差异需求，容易互相牵连。
3. 混合式（最常用）：根目录放 tsconfig.base.json，统一通用规则；每个子包 extends 它，再覆盖自己的差异项。适合大多数 monorepo。这样一规范 + 保留灵活性，维护成本最低。

> 该 markdown 源码采用的是第一种形式，这种方式一旦项目多起来就会产生依赖的版本差异，这样维护成本会很大，而且会出现版本兼容错误，后续自己做的时候考虑第三种方案：**根基线 + 子包继承**。（**面试可以说的点**）
>

这里采用混合式配置，根目录安装：`pnpm add  -D -w typescript @type/node`

`tsconfig.json`文件作为类型的公共配置：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "module": "esnext",
    "target": "esnext",
    # 专门配合Vite等构建工具使用，允许在TS中自由使用ESM的导入规则，如省略扩展名
    "moduleResolution": "bundler",
    "moduleDetection": "force",
    
    "types": [],
    "lib": ["esnext"],
    "skipLibCheck": true,
    
    "sourceMap": true,
    # 其他包引用时TS可以识别该项目的类型
    "declaration": true,
    "declarationMap": true,

    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    
    "verbatimModuleSyntax": false,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true
  },
  "exclude": ["node_modules"]
}
```

子包中如果是 node 代码，可以继承根目录的配置并且重写附加相应的配置：

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "types": ["node"],
    "lib": ["ESNext"]
  },
  "include": ["src"]
}
```

## 3.4 代码风格与类型检查配置
### 3.4.1 Prettier
```
pnpm add  -Dw prettier 
```

> 1. 注意需要安装对应的依赖包而不是安装插件，这是因为插件不能保障所有的电脑和系统都安装，通过配置 prettire 文件可以后续便于后续检测部署。VS Code 插件用来执行配置的规矩（当然如果没有安装对应的依赖或者配置文件，就会用插件默认的配置文件和包），当保存时插件会自动去 `node_modules` 里找装好的那个 `prettier` 包来干活。
> 2. 拓展：后续检测部署
>     - Husky：让代码在 `git commit` 的瞬间自动跑一遍 `prettier`。格式不对，根本不让提交。
>     - CI：当代码推送到服务器准备部署前，服务器会跑一遍格式检测。如果格式乱了，部署流程直接中断并报错
>

配置`.prettierrc`  文件，为了不检查打包后的目录文件或者不想检查的文件，需要配置`.prettierignore`  文件。

补充：关于自动化配置代码检查，可以安装对应的依赖：`pnpm add -Dw husky lint-staged`，初始化 `pnpm exec husky init`,在 package.json 配置：

```json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,ts,tsx,json,md}": [
      "prettier --write"
    ]
  }
}
```

> 一个项目执行流程：
>
> + **本地阶段 (Local)**：写代码 `git commit` husky 触发 lint-staged 代码被格式化并检查通过交成功。
> + **推送阶段 (Push)**：运行 `git push`。
> + **云端阶段 (CI/CD)**：**GitHub Actions** 接收到代码自动运行 `pnpm install`运行 `pnpm build`部署到服务器。

### 3.4.2 ESlint
```
pnpm add -Dw eslint@latest @eslint/js globals typescript-eslint eslint-plugin-react eslint-plugin-react-hooks eslint-config-prettier eslint-plugin-prettier
```

> 这里的 eslint-config-prettier 是为了 关闭所有与 Prettier 冲突的 ESLint 规则；而` eslint-plugin-prettier`（为了正常工作必须要配置.prettierrc 文件）是为了让 ESlint 运行 prettier 的规则（prettier 的错误会上报到 ESlint）；@eslint/js 识别 JS 语法；globals 识别全局变量；其实还要添加@types/node，但已经添加。
>

配置文件：`eslint.config.js`。

### 3.4.3 拼写检查
`pnpm -Dw add cspell @cspell/dict-lorem-ipsum`，配置 `cspell.json`文件。

### 3.4.4 Git 提交规范
`git init`初始化仓库；

`echo "" > .gitignore`创建文件；

+ `pnpm add -Dw @commitlint/cli @commitlint/config-conventional commitizen cz-git`，该库可以对提交信息进行规范。

```json
// package.json
"scripts": {
    "commit": "cz"
  },
"config": {
    "commitizen": {
      "path": "cz-git"
    }
  }
```

配置 commitlint.config.js 文件 (直接继承)：

```javascript
export default { extends: ['@commitlint/config-conventional'] };
```

> 要安装一下@commitlint/config-conventional 官方自带的提交规范。
>

![image (3)](assets/monorepo工程管理/image (3).png)

为了适配中文，可以在官方配置的基础上，配置`.czvinylrc` ：

```json
{
    "headerFormat": "{type}({scope}): {subject}",
    "commitTypes": [
        {
            "description": "一个新的功能",
            "value": "feat"
        },
        {
            "description": "一个 BUG 修复",
            "value": "fix"
        },
        {
            "description": "辅助工具更改或者无法分类的提交",
            "value": "chore"
        },
        {
            "description": "提高性能的代码更改",
            "value": "perf"
        },
        {
            "description": "不修复错误也不增加功能的重构代码",
            "value": "refactor"
        },
        {
            "description": "更新代码格式",
            "value": "style"
        },
        {
            "description": "添加测试用例",
            "value": "test"
        },
        {
            "description": "更新文档",
            "value": "docs"
        },
        {
            "description": "更新 CI 发版代码",
            "value": "ci"
        },
        {
            "description": "更新构建依赖等模块",
            "value": "build"
        }
    ],
    "skipScope": false,
    "skipTicketId": true,
    "subjectMaxLength": 70,
    "subjectMinLength": 3,
    "typeQuestion": "请选择一个提交类型：",
    "scopeQuestion": "请输入一个改动范围：",
    "subjectQuestion": "请输入一个提交信息：",
    "bodyQuestion": "请输入一个提交详细内容（可跳过）："
}
```

+ `pnpm -Dw add husky`: 实现在代码提交之前的检查，如果不符合规范则直接打回。
    - 初始化：`pnpx husky init`

可以在 husky/pre-commit 填入相关的命令，提交之前会执行相关的命令，`husky`一般配合 lint-staged 包来一起使用。

+ `pnpm -Dw add lint-staged`: **只过滤出 Git 暂存区的文件**并进行检查，避免全局文件的检查，提高了效率。

可以在 package.json 中配置：

```json

{
  "name": "your-project",
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{js,ts,tsx}": [
      "prettier --write",
      "eslint --fix"
    ],
    "*.md": "prettier --write"
  }
}
```

也可以写相应的配置文件：`lintstagedrc.js`。原理都是通过 Husky 在提交之前拦截并检查，lint-staged 保证了只检查在暂存区的文件，大大提高了效率，上面的命令是提交之前执行相关的检查命令。记得在 husky 里面配置 `pnpm exec lint-staged`将两者联系起来。

# 4. 代码统一化管理
## 4.1 统一打包
这里的打包一般针对的是公共库，公共库之间一般会存在着相互的引用，如果单独打包发布可能会产生版本冲突问题。建立 scripts/build.js，后面补一下 Rollup 的基本使用，除了打包文件，还可以开观察者模式。

## 4.2 建立包依赖
通过在相应子包中的 package.json 文件的 dependencies 中编写：

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

## 4.3 测试
对公共库进行测试，只要涉及的测试有集成测试、**单元测试**（Vitest、Mocha、Jest）以及 e2e 测试等。

## 4.4 发布

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
