// Better Auth's routes, on 200squares.com.
//
// ⚠️ This is a server function, and it is the only one on the site that runs for
// an ordinary visitor. It is hit on sign-in and on the session check the client
// makes after hydration — never during the render of a page, which is what keeps
// all five routes static (tickets 02 and 08).

import { handler } from "@/lib/auth-server";

export const { GET, POST } = handler;
