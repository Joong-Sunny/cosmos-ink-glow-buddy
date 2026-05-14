import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

/**
 * "Smart back" — if the user has a real history entry in this tab, pop it;
 * otherwise navigate to the fallback URL. Avoids the "back button always
 * goes home" UX bug when entering a deep route via in-app link.
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
