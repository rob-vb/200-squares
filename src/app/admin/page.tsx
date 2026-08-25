import type { Metadata } from "next";
import { Site } from "@/components/site";
import { ContentPage } from "@/components/content/content-page";
import { AdminBoard } from "@/components/admin/admin-board";

// ⚠️ `noindex, nofollow`, and it is not the guard. The guard is
// `requireAdmin(ctx)` on every query and every mutation behind this page
// (ticket 08): one address in one environment variable, checked on the server.
// A visitor who finds this URL sees the page frame and nothing in it.

export const metadata: Metadata = {
  title: "Admin · 200 SQUARES",
  description: "Managing the board.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Site>
      <ContentPage title="ADMIN" intro="The board, and what has been taken off it.">
        <AdminBoard />
      </ContentPage>
    </Site>
  );
}
