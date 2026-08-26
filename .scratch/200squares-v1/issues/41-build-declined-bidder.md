# 41 — Build: the declined bidder hears it

Type: task
Status: open
Blocked by: 38
Parent: ../map.md

## Question

Nothing to decide. [Ticket 38](38-declined-bidder-hears-nothing.md) decided it; this builds
it. Four changes, all on the close path, and two of them are repairs to
[ticket 19](19-build-auction.md)'s build rather than new work.

1. **Release the failed hold.** `closeOne` cancels only the holds below the winner
   ([`convex/auction.ts:955`](../../../convex/auction.ts)). Cancel a `failed` bid's
   PaymentIntent too, after the winning capture, in the same pass. A cancel that throws is
   let go — an authorization dies by itself and the close may not wait for it.
2. **The seventh mail**, `declinedMail` in `convex/lib/mail.ts`. It says the charge was
   refused and never why; it is not the outbid mail; its last line says the next day's
   auction is running. Sent to every bidder whose capture failed, in ladder order, after
   the winning capture, inside the same `try`/`catch` `wonMail` has.
3. **A `reason` for the refused capture**, beside the `late` one the schema already
   carries, so [`src/components/bid-placed.tsx:110`](../../../src/components/bid-placed.tsx)
   stops telling this bidder the day was decided while he was paying and that nothing was
   held. New words: *Your card was declined at the close*, then the same facts the mail
   carries.
4. **One row for yesterday in My squares.** [`convex/owners.ts:165`](../../../convex/owners.ts)
   returns only tomorrow's `held` bids. Add yesterday's `failed` and `released` bids for
   this owner: date, amount, and one word — **Declined** or **Not won**. In the bid
   section, not under *Banner days you won*. One row, nothing more.
5. **The promoted runner-up's extra sentence** in `wonMail`, only when the winner was not
   the top bid: the bid above his could not be collected, so the banner is his for his own
   amount.

⚠️ **Proving it needs a forced decline.** The close cannot be waited for. Age the day with
`npx convex run seed:ageAuction`, cancel the top PaymentIntent at Stripe by hand, then
`npx convex run auction:closeDue` — the recipe [ticket 19](19-build-auction.md) left. Build
the ladder with `node scripts/bid.mjs` and ⚠️ **a different address per run**, or there is
no runner-up to promote. `hi+bid1@robvb.com` and `hi+bid2@` both deliver, and Resend's log
(`GET https://api.resend.com/emails`) is the fastest way to read what left.

Check all four mails of one close: the declined bidder's, the promoted winner's, the
invoice, and the releases below. The one that matters is the first, because it is the one
nobody has ever seen.
