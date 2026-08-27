// One way to mint an unguessable address, used by the two documents that have
// no sign-in in front of them.
//
// ⚠️ **Two tokens, never one.** The invoice token exists so an owner can hand
// the document to their own bookkeeper (ticket 17); the withdrawal token cancels
// a purchase (ticket 42). The same string doing both would mean forwarding a
// receipt is forwarding the right to unwind the sale. So this file mints the
// shape and each caller keeps its own.

/**
 * 16 random bytes as hex.
 *
 * ⚠️ This is the whole guard on whatever it addresses: permanent, unguessable,
 * and carrying exactly one grant. `/invoice/<token>` and `/withdraw/<token>`
 * both check the shape before they look anything up, so the hex length is part
 * of the contract and not a detail.
 */
export function mintToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
