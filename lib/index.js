//#region lib/types/index.js
/**
 * Browser-only client plugin: a global Enter that approves a pending
 * authorization request, matching the Codex interaction.
 *
 * The shipped approval panel already answers Enter, but only while the focus
 * is inside the panel itself; the panel takes over the composer, so focus
 * normally falls back to the document body and Enter does nothing. This
 * plugin closes that gap from the outside without patching DSH.
 */
/** Node plugin body. */
function apply() {}
//#endregion
export { apply };
