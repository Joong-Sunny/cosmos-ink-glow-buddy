import { createFileRoute, redirect } from "@tanstack/react-router";
import { useUiStore } from "@/lib/ui-store";

/**
 * Legacy /register route — the registration UI now lives as a modal on the
 * home page (see RegisterModal + AddStarFab). Direct URL hits redirect home
 * and open the modal so old links still work, and so the universe state is
 * never lost when cancelling.
 */
export const Route = createFileRoute("/register")({
  beforeLoad: () => {
    // Open modal + jump home in one beat
    if (typeof window !== "undefined") {
      useUiStore.getState().setHomeMode("explore");
      useUiStore.getState().openRegister();
    }
    throw redirect({ to: "/" });
  },
  component: () => null,
});
