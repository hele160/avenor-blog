---
title: 'Markdown 项目问题记录'
time: '2026-04-24'
tags: ["项目"]
summary: '做 Markdown 项目时遇到的问题记录'
---


1. 初始化 monorepo 架构后无法对子包进行初始化，显示报错：

```json
 ERROR  null byte is not allowed in input (1:4)

 1 | ��p
--------^
 2 | a
 3 | c
```

后续发现 `pnpm-workspace.yaml` 文件内容出现了乱码，这说明它是用错误的编码方式-UTF-16LE 保存的，而 pnpm 只支持 UTF-8 编码的 YAML 文件，将编码换成 UTF-8 成功解决。

2. 关于 parser 编译器出现的疑惑，整个打包流程是什么？首先执行打包命令：`pnpm build`先调用 TS 对文件进行类型检查（自动化调用 TS 通过依赖`@rollup/plugin-typescript`实现），如果类型检查通过则调用 TS 对 ts 文件进行编译最终形成 js 代码，最后 Rollup 再对代码进行打包输出至 dist 文件中。

3. TypeScript 与 @rollup/plugin-typescript 配合时的出现 bug，后查询原因：路径兼容性问题（Windows 特有 Bug），这是官方插件 `@rollup/plugin-typescript` 在 Windows 系统下的一个已知缺陷。由于 Windows 路径既有用反斜杠 `\` 的，也有用正斜杠 `/` 的，TS 编译器在对比路径字符串时，因为斜杠不一致（或大小写没对上）就认为这不是同一个文件，导致报错。通过将官方插件换成了社区里更兼容 Windows 的 **`rollup-plugin-typescript2`**。这个插件在处理 Windows 路径时更聪明，不会因为斜杠问题罢工。除此之外，还需要配置路径纠偏来显示配置，在 `rollup.config.ts` 里加入了几行代码：

```typescript
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ...
typescript({
  tsconfig: path.resolve(__dirname, 'tsconfig.json')
})
```
​	这段代码可以动态计算当前配置文件的绝对路径。这样无论在哪个目录下运行 `pnpm build`，Rollup 都	      能顺着这个绝对路径准确找到 `tsconfig.json`，彻底消灭路径歧义。
