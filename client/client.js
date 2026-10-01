window.__ModuleLoader__.load({
	id: "dsh-enter-approve",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		/**
		 * Codex-style global Enter for DSH authorization requests.
		 *
		 * The shipped approval panel handles Enter itself, but its guard is
		 *   !event.currentTarget.contains(document.activeElement)
		 * so the key only works once focus is already inside the panel. The
		 * panel takes over the composer, which normally leaves focus on the
		 * document body, so Enter appears dead. Here the same decision is
		 * taken from the outside: when a visible approval panel exists and the
		 * panel would not handle the event itself, the primary "allow once"
		 * button is clicked.
		 */

		// The panel renders its two actions in this order and only carries a
		// custom class on the reject control, so identify allow by exclusion.
		const REJECT_LABEL = /^(拒绝|Reject)$/;

		/** Text entry owns Enter; never steal it. */
		function isTextEntry(element) {
			if (!element || element.nodeType !== 1) return false;
			if (element.isContentEditable) return true;
			return element.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]') !== null;
		}

		function isVisible(element) {
			if (element.getClientRects().length === 0) return false;
			return window.getComputedStyle(element).visibility !== "hidden";
		}

		/** The newest visible approval takeover, if any. */
		function pendingPanel() {
			const panels = Array.from(document.querySelectorAll("[data-approval-key]")).filter(isVisible);
			return panels.length === 0 ? null : panels[panels.length - 1];
		}

		/**
		 * The control that approves, never the one that rejects.
		 *
		 * The action row renders reject first and the primary approval last, so
		 * the last enabled control is the safe default. A missing recognized
		 * reject label must fall back to that last control and never to the
		 * first one, which would invert the decision for an unknown locale.
		 */
		function allowButton(panel) {
			const buttons = Array.from(panel.querySelectorAll("button")).filter((button) => !button.disabled);
			if (buttons.length === 0) return null;
			const reject = buttons.find((button) => REJECT_LABEL.test((button.textContent || "").trim()));
			const candidates = reject === void 0 ? buttons : buttons.filter((button) => button !== reject);
			return candidates.length === 0 ? null : candidates[candidates.length - 1];
		}

		function onKeyDown(event) {
			if (event.defaultPrevented || event.repeat) return;
			if (event.key !== "Enter") return;
			if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
			// IME confirmation must reach the editor instead of approving.
			if (event.isComposing || event.keyCode === 229) return;
			if (isTextEntry(event.target)) return;
			const panel = pendingPanel();
			if (panel === null) return;
			if (panel.getAttribute("aria-busy") === "true") return;
			// When the panel already owns focus its own handler must win.
			if (panel.contains(document.activeElement)) return;
			const button = allowButton(panel);
			if (button === null) return;
			event.preventDefault();
			event.stopPropagation();
			button.click();
		}

		/** Install the capture-phase listener and return its disposer. */
		function install() {
			document.addEventListener("keydown", onKeyDown, true);
			return () => {
				document.removeEventListener("keydown", onKeyDown, true);
			};
		}

		/** Client plugin body. */
		function apply(ctx) {
			if (ctx !== void 0 && typeof ctx.effect === "function") ctx.effect(install, "enter-approve: global Enter listener");
			else install();
		}

		exports.apply = apply;
		return module.exports;
	}
});
