# dsh-enter-approve

English | [中文](README.zh.md)

Approval prompts in DeepSeek Harness already answer <kbd>Enter</kbd> — but only
once the focus is already inside the prompt. This plugin closes that last gap so
<kbd>Enter</kbd> approves from anywhere, the way Codex behaves.

## The gap

`@deepseek-ai/dsh-client-ui-approval` renders the pending request as a composer
takeover and handles the key itself:

```js
if (event.defaultPrevented || !event.currentTarget.contains(document.activeElement) || …) return;
```

React dispatches synthetic key events along the React tree, so that guard only
lets the handler run when the key event originated inside the panel. The panel
takes over the composer, focus normally falls back to `document.body`, and
<kbd>Enter</kbd> does nothing until you click the card or <kbd>Tab</kbd> into it.

## What this does

A capture-phase `keydown` listener on `document`, which runs before the shell's
own root handler, and then:

1. **Decides whether to act** — a bare <kbd>Enter</kbd>: no `Ctrl`/`Alt`/`Shift`/`Meta`,
   not inside `input`/`textarea`/`select`/`contenteditable`, not an IME composition,
   not an auto-repeat.
2. **Yields whenever native would work** — if the visible panel already contains
   `document.activeElement`, the plugin returns immediately and the shipped
   handler does its job. Behaviour only changes in the case that was broken.
3. **Clicks the approval control** — the last enabled control in the action row,
   excluding a control labelled with a recognized reject label, so a future
   reordering or an unknown locale can never turn "approve" into "reject".

Nothing in DSH is patched: the plugin uses the documented `window.__ModuleLoader__`
client contract and a `dsh.bundle.patch` row like any other community plugin.

## Behaviour

| Situation | Result |
| --- | --- |
| Pending prompt, focus anywhere outside it | <kbd>Enter</kbd> approves |
| Pending prompt, focus already inside it | Shipped handler wins; unchanged |
| Typing in a text field | Untouched |
| IME composition in progress | Untouched |
| <kbd>Enter</kbd> with any modifier | Untouched |
| Prompt already answering (`aria-busy`) | Ignored |
| Hidden prompt from another session | Ignored |
| <kbd>Esc</kbd> | Never intercepted |

## Install

```sh
dsh plugin --profile web add dsh-enter-approve
```

Restart the host, then confirm the row appears in Settings → Plugins.

## Scope and safety

- It can only click the approval control of a prompt you were going to answer
  anyway. It cannot run commands, read files, or act without a pending prompt.
- It never intercepts anything except a bare <kbd>Enter</kbd> aimed at a visible
  pending prompt.
- Disabling the plugin restores the stock behaviour exactly; no DSH files are
  modified.
- The bundle is hand-written and dependency-free — `client/client.js` is the
  whole implementation, about 90 lines.

## Uninstall

```sh
dsh plugin --profile web remove dsh-enter-approve
```

## License

MIT
