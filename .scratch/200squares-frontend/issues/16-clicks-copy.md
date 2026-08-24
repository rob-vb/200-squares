# 16 — The copy for click counters

Type: grilling
Status: open
Blocked by: 15
Parent: ../map.md

## Question

Make the site's copy true now that the site counts clicks. Blocked by 15 on
purpose: building corrects the plan every time, and the words get the last say.
Same shape as 07 → 10 and 11 → 12 → 13.

**The dev's instruction, and the spine of this ticket: the copy about analytics
must be true.** Not softened, not hedged — true.

[Ticket 14's Answer](14-traffic-numbers.md) fixes the facts. Three places are
false the moment 15 ships:

- **`/how-it-works` FAQ, `Do I get traffic numbers?`** — currently *"Not yet.
  There are no visitor statistics here, and invented numbers are worse than
  none."* Now yes, and the answer must carry what the number is **not**: it
  counts clicks, not people, so the same visitor can raise it more than once.
  It is a rough count and the copy says so.
- **`/terms`, "What is not promised"** — *"There are no visitor statistics here,
  and no traffic is promised, implied or reported."* The reporting half is now
  false. The promise half stands and matters more than ever: a count is not a
  promise of traffic.
- **`/privacy`, "What it does not do"** — *"There are no visitor statistics here
  at all."* This is the line that dies. The three real promises — no analytics
  package, no third-party script, no profile across sites — all survive, and the
  page should now say plainly what the site **does** count and what it keeps
  about the visitor, which is nothing.

Settled already, and not to be reopened without a reason:

- **The tracking-parameters advice survives whole.** An owner's own analytics
  tell them who, from where, and what happened after arriving. This counter
  tells them one thing.
- **A buyer never sees a for-sale block's count.** Ticket 14 ruled it out; the
  copy must not imply one exists.
- **The count resets on a sale.** The resale FAQ answer and `/terms`'
  *Selling your square on* both say the image and the link do not travel. The
  count is the third thing that does not.

Then read the rest against what 15 actually built. Ticket 13 did this twice and
found four untrue lines the ticket had not listed. Start with `/about`, `What
you get`, and the public total's own line under the counter.
