// How Convex verifies the token a signed-in browser sends.
//
// The provider is a custom JWT whose keys are served by Better Auth itself, at
// `${CONVEX_SITE_URL}/api/auth/convex/jwks`. Both halves live on the same
// deployment, so the issuer is the deployment's own site URL and there is no
// third party in the loop.

import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import type { AuthConfig } from "convex/server";

export default {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig;
