# dsh-enter-approve

[English](README.md) | 中文

DeepSeek Harness 的授权提示其实**已经**支持按 <kbd>Enter</kbd> 同意 —— 但只有在焦点已经落在提示卡片内部时才生效。这个插件补上最后这一段：在**任意位置**按 <kbd>Enter</kbd> 就能同意，和 Codex 的体验一致。

## 缺口在哪

`@deepseek-ai/dsh-client-ui-approval` 把待审批请求渲染成一块接管输入框区域的卡片，并在卡片根节点上自己处理按键：

```js
if (event.defaultPrevented || !event.currentTarget.contains(document.activeElement) || …) return;
```

React 的合成事件沿 **React 树**分发，所以这个守卫的含义是：**只有按键事件源自卡片内部时，处理器才会执行**。而卡片接管了输入框，焦点通常掉回 `document.body`，于是按 <kbd>Enter</kbd> 毫无反应 —— 必须先点一下卡片，或者用 <kbd>Tab</kbd> 把焦点移进去。

## 这个插件做什么

在 `document` 上以**捕获阶段**监听 `keydown`（比 shell 挂在根容器上的处理器更早看到事件），然后：

1. **判断该不该处理** —— 必须是裸 <kbd>Enter</kbd>：没有 `Ctrl`/`Alt`/`Shift`/`Meta`，不在 `input`/`textarea`/`select`/`contenteditable` 内，不在输入法组合中，不是长按重复。
2. **原生能用就让开** —— 如果可见卡片已经包含 `document.activeElement`，插件立即返回，交给 DSH 自带的处理器。**只有原本失效的那一种情况，行为才会改变。**
3. **点击同意控件** —— 动作区里最后一个可用按钮，并排除掉文案能识别为"拒绝"的那个。因此将来按钮顺序被调整、或者遇到未知语言，都不可能把"同意"变成"拒绝"。

没有改动 DSH 的任何代码：走的是官方 `window.__ModuleLoader__` 客户端契约和 `dsh.bundle.patch` 挂载行，和任何社区插件完全一样。

## 行为对照

| 情况 | 结果 |
| --- | --- |
| 有待审批提示，焦点在卡片外 | <kbd>Enter</kbd> 同意 |
| 焦点已经在卡片内 | 自带处理器接管，行为不变 |
| 正在文本框里输入 | 不干预 |
| 输入法组合进行中 | 不干预 |
| <kbd>Enter</kbd> 带任意修饰键 | 不干预 |
| 卡片已在提交中（`aria-busy`） | 忽略 |
| 其他会话的隐藏卡片 | 忽略 |
| <kbd>Esc</kbd> | 永不拦截 |

## 安装

```sh
dsh plugin --profile web add dsh-enter-approve
```

重启宿主，然后在 **设置 → 插件** 里确认出现该条目。

## 范围与安全

- 它只能点击一个你本来就要回答的提示上的"同意"控件。不能执行命令、读文件，也不能在没有待审批提示时做任何事。
- 除了"针对可见待审批提示的裸 <kbd>Enter</kbd>"，它不拦截任何按键。
- 停用插件即完全恢复原生行为；没有修改任何 DSH 文件。
- bundle 为手写、零依赖 —— `client/client.js` 就是全部实现，约 90 行。

## 卸载

```sh
dsh plugin --profile web remove dsh-enter-approve
```

## 许可证

MIT
