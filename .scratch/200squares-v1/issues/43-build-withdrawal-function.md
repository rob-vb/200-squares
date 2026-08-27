# 43 — Build: the withdrawal function

Type: task
Status: open
Blocked by: 42
Parent: ../map.md
Assignee: rob-vb (claimed 2026-08-27)

## Question

Nothing to decide. [Ticket 42](42-the-withdrawal-function.md) decided all of it on
2026-08-26; this builds it. ⚠️ **It blocks [ticket 40](40-copy-true-again.md) and through it
the launch**, and it is the only thing on this map that is in force and missing: art. 6:230oa
BW / art. 11a CRD has applied since 19 June 2026.

⚠️ **Read art. 11a lid 2 first.** [Research 37](../research/37-when-a-bid-binds.md) §3.5 quotes
lid 1, 4 and 5 and art. 11a(1) and (3), and never had to quote lid 2 — the paragraph that says
what the confirmation step must collect. Everything below assumes the token names the order and
the consumer only confirms. If lid 2 asks for more, lid 2 wins.

### The schema

1. **`withdrawalToken` on `orders`.** 16 random bytes as hex, the same shape as
   `mintToken` in [`convex/invoices.ts`](../../../convex/invoices.ts). Minted when the order is
   written, and **only where `buyerType === "consumer"`**. Indexed. ⚠️ **Do not reuse the
   invoice token** — the schema says that string exists so an owner can hand it to their
   bookkeeper, and it must not also cancel the purchase.
2. **A `withdrawals` table.** `orderId`, `kind` (`squares` | `banner`), `declaredAt`, the exact
   words the consumer was shown as **text** — the same rule ticket 06 set for the tick boxes,
   so it stays readable in 2036 — their own optional line, and `refundedAt`. Not fields on
   `orders`; not a `removals` row.

### The route

3. **`/withdraw/<token>`.** Three states.
   - **Live** — inside the period. Names what is being withdrawn, carries one optional line of
     text, and a button labelled **`confirm withdrawal`**. ⚠️ Only those words, or an
     unambiguous equivalent: art. 11a lid 3.
   - **Expired** — the 14 days have run, or a banner day has passed 00:00 UTC. A sentence
     saying so, with `hello@200squares.com`. Not a 404: an expired page that explains is honest
     where a 404 is not.
   - **Unknown token** — 404. A business order has no token and so has no page.

   The period: **14 days from the order** for a square; **until 00:00 UTC of the day after the
   close** for a banner (art. 6:230p sub d, and ticket 42 §1).

4. **The entry points, on the interface.** Art. 6:230oa lid 1 asks for a function *displayed on
   the online interface*, and a link in a mail is not one. A plain text link labelled
   **`withdraw from contract here`**, under the order row, in **two** places:
   - **`/thanks?session_id=`** — ticket 06's grant, and the only surface a buyer with no
     account has. ⚠️ The session id is read **on the client** (`src/components/thanks.tsx`);
     nothing may put a `searchParams` read back on that page (ticket 08).
   - **My squares** (`src/components/panel/my-squares.tsx`). ⚠️ **The panel is in the DOM
     twice** — side panel and bottom sheet, one hidden by CSS. A script that reaches for the
     last match reaches into the copy nobody can see.

   Consumer orders only. The link is also in the order-confirmed mail and the banner-won mail,
   as art. 6:230m lid 1 sub h information — but the mail is the *information*, never the
   function.

### What pressing it does

5. **Writes the `withdrawals` row.**
6. **A banner comes down at that instant.** Call ticket 32's `withdrawBanner` effect
   (`convex/admin.ts`) — patch the day, release the artwork, **no strike**, no removal mail.
   ⚠️ It is admin-only today; the token is the grant here, so the shared work moves to an
   internal mutation and the admin path keeps its own `requireAdmin`.
7. **A square does not move.** The dev judges the refund and pays it by hand (ADR 0003).
8. **A new admin mutation deletes the block** once the refund is paid, so the rectangle goes
   back on the market and ticket 27's sold-out count reads true. Beside `withdrawBanner`,
   admin-only. Stamps `refundedAt` on the `withdrawals` row.
9. **The lid 4 mail to the consumer**, without delay: it states the content of the declaration
   — including their own line — and the **date and time** it was made. ⚠️ **A seventh mail**
   on [ticket 13](13-email.md)'s list of six, obligatory rather than chosen.
   [Ticket 41](41-build-declined-bidder.md) adds the other seventh; they are different mails.
10. **A mail to the dev, and a section on `/admin`**: declarations not yet refunded, oldest
    first, with the days left on the art. 6:230r lid 1 **14-day refund clock**. Same shape as
    ticket 36's un-purged alarm — the screen has to be readable at midnight.

### The copy

11. Ticket 42 §5 lists what every surface must now assert. **`src/lib/checkout/consent.ts` is
    this ticket's**, because those constants are frozen onto orders at the moment of sale and
    the build cannot ship without them being true. **`/terms` and the rest are
    [ticket 40](40-copy-true-again.md)'s**, which writes them once.

### Proving it

⚠️ There is no inbox problem here: `robvb.com` takes plus addressing and Resend's log
(`GET https://api.resend.com/emails`) gives the body back.

- A square: `node scripts/flow.mjs` buys one as a **consumer**, then open the token page from
  `/thanks`, confirm, and read the mail. Then the admin delete, and the rectangle is back on the
  board.
- A banner: `node scripts/bid.mjs`, `npx convex run seed:ageAuction`, `npx convex run
  auction:closeDue`, then the winner's token page. The banner must be gone and the house ad up
  **before** the page finishes reloading.
- The expired state on both, and a 404 on a business order.
- ⚠️ Use `node scripts/shot.mjs` and leave time between runs. **Never poll staging with
  `curl`** — it trips the bot challenge and blocks Playwright too.
