import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy /questions/ (no bookId) route — direct URL hits would crash because
// the page reads `bookId` from params that don't exist. Redirect to home so
// stray URL hits during the demo don't break anything. Real flow lives at
// /questions/$bookId.
export const Route = createFileRoute("/questions/")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
