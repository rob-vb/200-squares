// What the server will accept as artwork, and nothing else.
//
// ⚠️ The browser does the work (ticket 09): it crops, resizes and encodes two
// WebP files before anything leaves the machine, so the server never decodes an
// image and never spends action compute on one. What is left here is the check
// that a browser is not a friend — the content type and the byte size, taken
// from the storage metadata Convex wrote when the file arrived.
//
// A determined uploader can still store a WebP of the wrong dimensions. The only
// thing they break is the drawing of their own block, which is why no decode is
// worth its cost.

/** The `1x` set, drawn below a 2x zoom. */
export const SMALL_MAX_BYTES = 40 * 1024;
/** The `4x` set, drawn above it. Ticket 09 fixed both numbers. */
export const LARGE_MAX_BYTES = 400 * 1024;

/** The one type that is stored. PNG, JPEG and GIF are things a buyer may pick. */
export const STORED_TYPE = "image/webp";
