import { BoardScreen } from "@/components/board-screen";
import { Site } from "@/components/site";

// ⚠️ No `searchParams`, and nothing may put one back. Reading one is why every
// route on this site built dynamic (ticket 08), which cost ticket 02 its
// cheapest defence. Which board a deployment shows is set with
// `npx convex run seed:full`, not with a query string.

export default function Home() {
  return (
    <Site>
      <BoardScreen />
    </Site>
  );
}
