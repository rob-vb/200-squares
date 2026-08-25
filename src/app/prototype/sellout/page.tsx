// ⚠️ PROTOTYPE — ticket 27. Throwaway route, on a throwaway branch.
//
// Three variants of the resale label and of what the board says the day it sells
// out, on the real board screen: `/prototype/sellout?variant=A&sold=1`.
//
// ⚠️ This route reads a search parameter and is therefore **dynamic**. That is
// exactly what ticket 08 banned on `/`, and it is why the variants are here and
// not there: the board route stays static and keeps ticket 02's cheapest
// defence. Nothing from this directory may move to `/` carrying a search param.
//
// The `sold` flag only forces the *copy* into its sold-out state. To see a real
// sold-out board underneath it: `npx convex run seed:full` then
// `npx convex run seed:soldout`.

import { Suspense } from "react";
import { SelloutPrototype } from "@/components/prototype/sellout-screen";

export default function Page() {
  return (
    <Suspense>
      <SelloutPrototype />
    </Suspense>
  );
}
