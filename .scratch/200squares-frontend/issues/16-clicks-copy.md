# 16 — The copy for click counters

Type: grilling
Status: resolved
Assignee: rob-vb (claimed by agent session)
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


## Answer (2026-08-24)

The copy is true. It is on the branch `copy-16`, on top of `build-15-clicks`.
Preview:
`https://200-squares-git-copy-16-robs-projects-52973834.vercel.app`
(`?data=early` for the day-one board). `tsc --noEmit`, `eslint` and `next build`
are clean.

Three lines were false the moment 15 shipped. Reading the rest found five more,
which is the third time in a row that has happened — 13 found four, twice.

### The FAQ does not grow

The dev's rule, given mid-ticket: **the FAQ answers only the questions a buyer
really asks.** So `Do I get traffic numbers?` turns from no to yes without a
second question beside it, and the answer stays four sentences:

> Yes. Every click on your block is counted, and the number sits on your row in
> My squares. It counts clicks, not people, so read it as rough. Your own
> tracking parameters tell you what happens after the click.

That carries the four things a buyer needs: yes, where it is, how rough it is,
and what to do about the rest. Two facts from ticket 14 no longer fit — **only
the owner sees it**, and **there is no history and no graph**. Both moved to
`/privacy`, and that turned out to be their real home: they are not product
detail there, they are promises to the visitor. Nobody else sees your count, and
there is no graph *because no time is written down*. The absence of dates stops
being a modelling shortcut and becomes the privacy fact it always was.

### The counter is something you get

`What you get` names it — `a click on your block opens your website in a new
tab, and every one of those clicks is counted for you`. The page that sells
should say what $100 now buys. `/about` was left alone: it is about the idea,
not the feature list, and it carried no false line.

### The tracking-parameters advice survives, reworded

`they are how you measure this yourself` became `they are how you measure what
happens after the click`. The advice is whole, as ticket 14 required, and the
line stops implying the site measures nothing. The division is now stated rather
than assumed: the site owns the click, the owner owns everything after it.

### The count is the third thing that does not travel

Named in all three places a sale is described — the sell FAQ, the buy FAQ, and
`/terms`' *Selling your square on*. The buy answer says it from the buyer's
side: `it arrives empty and at zero clicks`, so nobody reads a seller's number
into a purchase.

**Found while writing, and added:** `/terms`' part-sale paragraph was silent on
the count, and ticket 15 built a rule for it. A seller who cuts their block sees
their whole count land on one of the pieces, and nothing said so. `/terms` now
does: *"Your count is not divided: it stays whole on the largest piece you
keep."* This is the page whose job is stating what the site does, and this is a
thing the site does.

### `/terms` keeps the promise and drops the report

`There are no visitor statistics here, and no traffic is promised, implied or
reported` became:

> The site counts clicks and shows you your own count. That is a record of what
> happened, not a promise of what will. No amount of traffic is promised or
> implied.

The reporting half is dead. The promise half now matters more than it did, since
a live number is the thing on this site that most looks like a guarantee, and
this is where that is refused.

### `/privacy` says what it counts

The dying line took a sentence with it: *"this site cannot count clicks for you,
because it does not count them for itself"* leaned on it entirely. Both are gone.

What replaces them is a section of its own, **What it counts**, placed *before*
**What it does not do** — because counting is now something the site does to a
visitor, and admitting it under a "does not" heading is exactly the softening
this ticket forbids. It states the unit, that nothing about the visitor is kept
(`no name, no identifier, no address, no time`), that one person clicking twice
counts twice, who sees what, and why there is no graph.

The three real promises are untouched: no analytics package, no third-party
script, no profile across sites. The page's own description was false too —
`what it does not measure` — and is now `what it counts, and what it keeps about
you`.

### Left alone on purpose

- **The public total's line** stays bare: `43,724 clicks to owners' websites`.
  The word `clicks` is its own caveat, and more words under the pitch would make
  the line heavier than its place allows.
- **The owner's number in My squares** stays bare for the same reason: `Live ·
  1,840 clicks`. The FAQ and `/privacy` carry the roughness.
- **`/about`**, which never claimed anything about statistics.

### Full list of lines changed

| Where | Was | Now |
| --- | --- | --- |
| FAQ `Do I get traffic numbers?` | "Not yet. There are no visitor statistics here…" | yes, rough, in My squares |
| FAQ `Can I sell…` | "image and link do not go with it" | "image, link and click count" |
| FAQ `Can I buy…` | "arrives empty" | "arrives empty and at zero clicks" |
| `/how-it-works` What you get | click opens your site | …"and every one of those clicks is counted for you" |
| `/how-it-works` tracking params | "measure this yourself" | "measure what happens after the click" |
| `/terms` What is not promised | "…promised, implied or reported" | a record, not a promise |
| `/terms` Selling your square on | "image and link stay with you" | count too; count starts again at zero |
| `/terms` part sale | silent | "not divided: it stays whole on the largest piece you keep" |
| `/privacy` metadata | "what it does not measure" | "what it counts, and what it keeps about you" |
| `/privacy` What it does not do | "no visitor statistics here at all" + the sentence leaning on it | deleted |
| `/privacy` | — | new **What it counts** section |
