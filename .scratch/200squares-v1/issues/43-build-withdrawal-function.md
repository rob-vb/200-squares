# 43 — Build: the withdrawal function

Type: task
Status: resolved
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

## Answer

Built and proved on staging on 2026-08-27. Commits `e53acba`, `65c93e9`, `ea77226`.

### ⚠️ Art. 11a lid 2, read first, as this ticket demanded

EUR-Lex would not render, so it was taken from the directive that inserts the article —
**Directive (EU) 2023/2673 art. 1(3)**, via the Publications Office cellar document, read
2026-08-27:

> 2. The withdrawal function shall enable the consumer to send an online withdrawal
> statement informing the trader of his or her decision to withdraw from the contract. That
> online withdrawal statement shall enable the consumer to easily **provide or confirm** the
> following information:
> (a) his or her name;
> (b) details identifying the contract from which he or she wishes to withdraw;
> (c) details of the electronic means by which the confirmation of the withdrawal will be
> sent to the consumer.

**Lid 2 does not overturn the design; it adds two fields.** The words *or confirm* are what
save the token: the token names the order, so all three are shown filled in and the consumer
confirms them. But *provide or confirm* is not *read*, so **the name and the address are
editable** — sub c is explicitly about the address the confirmation goes to, which need not
be the address that paid. Sub b is the contract line, `Square 193, bought on 2026-08-27 for
$250.00`, which is what a person needs to be sure it is the right purchase.

Two consequences that were not in this ticket:

- The `withdrawals` row keeps `name`, `what` and `email` beside the words, because those
  three **are** the declaration under lid 2 and lid 4 asks the confirmation to state its
  content.
- Where the confirmed address differs from the one that paid, **the dev's copy says so**.
  Nothing else on the site could notice that the refund goes to a card and the confirmation
  went somewhere else.

### What was built

| | |
| --- | --- |
| `convex/lib/token.ts` | `mintToken`, now shared. ⚠️ The invoice token still mints separately — one string may not do both jobs. |
| `convex/lib/withdrawal.ts` | The leaf: the address, the periods, the contract line, the words, and `liveWithdrawUrl`. It exists so `owners → withdrawal → admin → owners` is never a circle. |
| `convex/withdrawal.ts` | `byToken`, `declare`, `forMail`, and the admin's `owed` and `settle`. |
| `convex/schema.ts` | `orders.withdrawalToken` + `by_withdrawal_token`; the `withdrawals` table. |
| `src/app/withdraw/[token]/page.tsx` | The route. ⚠️ A **server** read, and only because of the 404 — a client component cannot answer with a status. |
| `src/components/withdraw.tsx` | The three states, and the button that may only say *confirm withdrawal*. |
| `src/lib/checkout/consent.ts` | Ticket 42 §5, shipped here rather than with ticket 40. |
| `scripts/declare.mjs`, `scripts/settle.mjs` | The two presses. Neither button can be reached any other way from the VPS. |
| `seed:ageOrder` | Back-dates one order so the **expired** page can be looked at without waiting fourteen days. |

### Four decisions this build had to make

1. **A fourth state: `done`.** The ticket named three. A second visit to a token that has
   already been used must not show the button again — art. 11a has no third step, and
   inviting a consumer to declare twice leaves them wondering which one counted. It shows
   the acknowledgement on screen; the **durable medium** is still the mail.
2. **The My squares row no longer waits for an invoice.** The entry point hangs under the
   order row, and the order row was only rendered once its invoice **file** existed. A
   deployment that cannot render invoices would have had no withdrawal button at all — a
   statutory function hanging off a bookkeeping document. The row now appears when there is
   either a document to link to or a function to offer, and says *Invoice on its way*
   otherwise.
3. **The entry point disappears; the page does not.** `liveWithdrawUrl` returns empty for a
   business order, a refunded one, a period that has run and one already withdrawn from. Lid
   5 asks for the function *during* the period and no longer, and a link that leads to *this
   has run out* is worse than no link. The address itself keeps answering, because the
   person was told to keep it.
4. **`BID_TRUTHS`'s fourth line split by buyer type**, which ticket 42 §5 asked for and
   §11 of this ticket put here. *A bid cannot be withdrawn* is true of a business and false
   of a consumer, who may take an offer back before the close under art. 6:230q lid 1 — by
   email, because ticket 42 refused the second button on purpose.

### Proved on staging

- **A square.** `node scripts/flow.mjs` as a consumer → *withdraw from contract here* under
  the order on `/thanks` (`t43-sq-*`). `declare.mjs` → the row, and both mails delivered:
  the lid 4 confirmation naming the words, the consumer's own line and
  `2026-08-27 07:54 UTC`, and the dev's copy with the 14-day clock. The link then vanished
  from `/thanks`. `settle.mjs` → `refundedAt` stamped, the block **deleted**, square 193
  back on the market.
- **A banner.** `bid.mjs` as a consumer → `seed:ageAuction` → `auction:closeDue`. The won
  mail carried the sub h information with the token. `declare.mjs` → `bannerDays.removedAt`
  set at the instant of the declaration, a `removals` row with **no rule** and
  `froze: false`, and `owners.strikeAt` still `[]`. ⚠️ The winner had attached no artwork,
  so the house ad was already standing: the take-down is proved by the row and not by a
  picture disappearing.
- **My squares** carries the second entry point under its order row (`t43-mine.png`).
- **`/admin`** listed the declaration oldest-first with *14 days left*, the words, and the
  address, and its press did the settle above.
- **Expired**: `seed:ageOrder` → *This has run out*, naming the day and `hello@`. ⚠️ The
  page's intro line had to become state-aware — *You can withdraw from this purchase* over
  *This has run out* was the site contradicting itself in two sentences.
- **404**: an unknown token is a real 404 (`t43-404.png`), and a business order carries **no
  `withdrawalToken` column at all** — proved by buying one with `BUYER=business`, which also
  showed the panel gives a business no withdrawal tick box.

### What this does not do

- ⚠️ **`/terms`, `/how-it-works`, `/privacy` and the FAQ are untouched.** They are
  [ticket 40](40-copy-true-again.md)'s, which is now unblocked and writes them once — and
  `/terms` still says *"as soon as we have read your message"* and *"There is no refund and
  no exit"* until it does. `consent.ts` was done here only because those words are frozen
  onto an order at the moment of sale.
- **No refund is ever taken by the site.** ADR 0003 stands: the dev judges the amount and
  pays it at Stripe. `settle` records that they did.
- ⚠️ **Not legal cover.** Ticket 42's own warning is unchanged: research 37 §6 item 1 calls
  the scope of this obligation the one item worth paying for on its own, and
  [ticket 25](25-launch.md) carries having it confirmed before launch.
