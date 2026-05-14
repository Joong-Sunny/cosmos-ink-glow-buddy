import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

/**
 * useSmartBack — the ONLY way to wire an in-page "back" button in this app.
 *
 * Rules (read before touching):
 *   1. Every chevron-left / arrow-left "go back" button MUST use this hook.
 *      Do NOT use `<Link to="/some-parent">` for back buttons. Do NOT call
 *      `navigate({ to: "/some-parent" })` directly. Always `useSmartBack`.
 *   2. The hook returns a callback that either pops history (if there is
 *      any) or navigates to a sensible fallback URL.
 *   3. Pick a fallback that's a *plausible root* for the page, not a
 *      "semantic parent" — fallback only runs when there is literally no
 *      prior history (deep-link / fresh tab).
 *
 * Why this rule exists
 * --------------------
 * Mixing "back = push semantic parent" with "back = pop history" on
 * adjacent pages creates a closed loop:
 *
 *   /answer → (Link push) → /questions → (history.back) → /answer → (push) → ...
 *
 * That bug shipped twice before this rule was written down. If you find
 * yourself wanting to use Link for a back button, you're probably wrong —
 * use this hook and let the browser's history do its job.
 */
export function useSmartBack(fallback: string = "/") {
  const navigate = useNavigate();
  return useCallback(() => {
    // window.history.length includes the implicit initial entry, so >1 means
    // there's at least one prior page in this tab.
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
      return;
    }
    navigate({ to: fallback });
  }, [navigate, fallback]);
}
