// The components this backend runs, and there is one.
//
// Better Auth keeps its own tables — user, session, account, verification,
// jwks — inside a component, which is why `owners` and a Better Auth user are
// two rows and not one (ticket 05). The component's tables are not in
// `schema.ts` and nothing in this repo writes to them directly.

import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";

const app = defineApp();
app.use(betterAuth);

export default app;
