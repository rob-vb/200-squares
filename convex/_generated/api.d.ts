/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auction from "../auction.js";
import type * as auth from "../auth.js";
import type * as board from "../board.js";
import type * as checkout from "../checkout.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as lib_board from "../lib/board.js";
import type * as lib_mail from "../lib/mail.js";
import type * as lib_time from "../lib/time.js";
import type * as lib_vat from "../lib/vat.js";
import type * as owners from "../owners.js";
import type * as reservations from "../reservations.js";
import type * as seed from "../seed.js";
import type * as seedData from "../seedData.js";
import type * as snapshots from "../snapshots.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auction: typeof auction;
  auth: typeof auth;
  board: typeof board;
  checkout: typeof checkout;
  crons: typeof crons;
  http: typeof http;
  "lib/board": typeof lib_board;
  "lib/mail": typeof lib_mail;
  "lib/time": typeof lib_time;
  "lib/vat": typeof lib_vat;
  owners: typeof owners;
  reservations: typeof reservations;
  seed: typeof seed;
  seedData: typeof seedData;
  snapshots: typeof snapshots;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
