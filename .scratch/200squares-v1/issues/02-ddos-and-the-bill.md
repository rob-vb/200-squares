# 02 — DDoS, cost and hard limits

Type: research
Status: resolved
Parent: ../map.md

## Question

The dev's rule, and the reason this ticket exists: **an attack may take the site
offline. It may never produce a bill.** Offline is an acceptable failure. An
unexpected invoice is not.

The dev's own direction is Cloudflare in front of Vercel, plus Vercel's attack mode.
Check whether that is enough, and find where it leaks.

1. **Vercel.** What does Vercel Firewall give on the plan this project is on
   (`rob-vb/200-squares`, scope `robs-projects-52973834`)? Attack Challenge Mode,
   custom rules, rate limiting, bot filtering. What does **Spend Management** really
   do — does it hard-pause a project at a limit, or only warn? What is still billed
   while a request is being blocked?
2. **Cloudflare in front of Vercel.** Does it work, and what breaks? DNS proxying,
   SSL mode, double caching, `x-forwarded-for`, Vercel's own edge network sitting
   behind another one. Is this a supported arrangement or a folk remedy?
3. **The hole this stack has.** With Convex, the browser talks **straight to Convex**
   over a websocket, not through Vercel and not through Cloudflare. So neither
   protects the expensive part. What does Convex offer — rate limits per function,
   spend caps, a way to cut off an attacker? What is billed: function calls,
   bandwidth, storage? Can a Convex deployment be made to stop instead of bill?
4. **The unauthenticated writes.** Two things on this site let a stranger write
   without an account: **placing a click** (ticket 10) and **starting a checkout**
   (ticket 06, which reserves squares for 15 minutes). Both are attack surfaces —
   one runs up cost, the other can freeze the whole board with fake reservations.
   What tools exist to bound them?
5. **The cheapest defence of all.** The board page is nearly static: 199 squares and
   some images. How much of it can be served without touching a function at all, and
   what does that do to the worst case?

End with a concrete recommendation: a named configuration, with the limit values to
set, and an honest statement of what is still unprotected. The dev has not yet named
a monthly ceiling — ask for one if the answer needs it.

Primary sources: Vercel, Cloudflare and Convex documentation and pricing pages.
Capture the findings as a markdown file in the repo and link it from this ticket.

## Vercel Pro deferred — 2026-08-25

⚠️ **The site stays on Vercel Hobby until it can take real money.** The dev asked whether
Pro could wait, and it can. Everything below still stands **for launch**; what changes is
*when* the $20 starts.

**Hobby enforces the dev's own rule more strictly than Pro does.** This ticket's rule is
that an attack may take the site offline but may never make a bill. On Hobby, *"if you
exceed your usage limits you will have to wait until 30 days have passed before you can use
the feature again"* — it **pauses and does not bill**, the same shape as Convex Free. Pro
plus Spend Management is a **brake, not a wall**: Vercel checks every few minutes and this
ticket already accepted that gap. So during the build, Hobby is the safer of the two.

⚠️ **This ticket understated the Hobby firewall.** The comparison table says Hobby carries
**WAF Custom Rules up to 3** and **IP Blocking up to 3** (Pro: 40 and 100), and **DDoS
Mitigation is on by default on both plans**, with **Attack Mode** available on both. The
finding that Pro's firewall beats Cloudflare Free is unchanged; the claim that Hobby has
nothing was too strong. Three rules is short of the five this ticket wanted — but one of
those five was the **Stripe-webhook bypass**, and [ticket 14](14-environments-and-keys.md)
moved that webhook to Convex, so it is no longer needed. Four wanted, three available.

**Deployment Protection**: Hobby has Vercel Authentication, so `staging.200squares.com`
stays private to the dev either way.

### The trigger

**Commercial use is forbidden on Hobby** — the fair-use guidelines restrict it to
non-commercial personal use. Today the site sells nothing: no live Stripe key, no
customers, no orders. That is not yet commercial.

The line is crossed at one exact moment: **a live Stripe key entering the Production
environment.** That is step 10 of the setup checklist. Upgrade to Pro **before** it, not
after, and set Spend Management in the same sitting.

Until then the hosting bill is **$0**, not $20.

## Answer

Findings: [`research/02-ddos-and-the-bill.md`](../research/02-ddos-and-the-bill.md),
1866 lines, every claim carrying its URL and the date it was read (2026-08-24).

**The named configuration is "Static front, capped back", and the dev's own direction
was aimed at the wrong half of the stack.** Cloudflare in front of Vercel is a folk
remedy that Vercel argues against by name in four of its own documents. Vercel's
firewall on Pro beats Cloudflare Free on every axis, and proxying **subtracts** from
it: Bot Protection stops working, the app loses the visitor's IP, and certificates
need hand-holding. **The zone stays DNS-only.** Buying the domain at Cloudflare
costs nothing here — it just does not buy what it looked like it would.

**The strongest single fact in the whole note, and it is free on every plan:** blocked
traffic does not bill. *"WAF deny, challenge, or rate-limit mitigated traffic does not
incur CDN Requests or Fast Data Transfer"*, and Attack Mode has *"zero costs
associated with traffic blocked"*. The dev's rule is satisfiable, and mostly for free.

**Vercel:** Pro is compulsory — *"All commercial usage of the platform requires either
a Pro or Enterprise plan"*, and a Stripe checkout is commercial. Spend Management set
to **$5** with *Pause production deployment* on, because *"setting a spend amount does
not automatically stop usage"* and the default for new customers is $200 with
notifications only. Bot Protection on Challenge, AI Bots on Deny, OWASP off because it
is metered. Five WAF rules in order: a Stripe-webhook bypass **first** (or webhooks
die), a checkout rate limit (60 s / 5 / IP+JA4 / deny 15 min), a click-redirect rate
limit (10 s / 20 / IP / deny 1 min), a method allowlist, and a junk-path deny. Attack
Mode stays off as the manual button. `images.qualities: [75]`, trimmed `deviceSizes`
and explicit `search` in the image patterns, because Image Optimization cache writes
are **$4.00 per 1M** and a varying query string is how an attacker forces them.

**Convex:** stay on **Free**, which has hard caps and no overage rate at all — an
attack breaks the site instead of billing it, which is exactly the failure the dev
called acceptable. Add daily `--type disable` usage limits (functionCalls 50,000,
databaseIO and dataEgress 40 MB), unkeyed global rate limits on both unauthenticated
writes, and a free **Turnstile** token in front of the click and the checkout —
Turnstile is the one control that reaches the websocket, works *"without sending
traffic through Cloudflare"*, and allows unlimited challenges.

**The cheapest defence is still the best one:** a cached, cookie-free board page with
pre-sized artwork and **no websocket for anonymous visitors** removes Function
Invocations, Active CPU, Provisioned Memory, Fast Origin Transfer and every Convex
subscription rerun from the worst case, leaving only Edge Requests and transfer — 10 M
and 1 TB of which are included in Pro.

### Where it leaks, honestly

- ⚠️ **$25 does not buy websocket protection, and $20 of it is gone before a visitor
  arrives.** The browser talks straight to `*.convex.cloud`, which Vercel cannot proxy
  (*"Vercel rewrites proxy HTTP requests, not WebSocket connections"*) and which is not
  in the Cloudflare zone. The only way to put a firewall in front of it is a Convex
  custom domain, and *"custom domains require a Convex Pro plan"* at $25/developer.
  $20 + $25 = **$45**. See the ceiling question this raises, below.
- ⚠️ **Even at $50 the win is partial.** Cloudflare's WAF inspects the HTTP 101
  upgrade and then stops: *"once a connection has been established, the WAF does not
  perform any further inspections"*. It caps how many sockets open, not what they
  carry. One socket sending a million mutations is invisible to every edge control
  priced here.
- ⚠️ **The expensive attack is the fan-out, not the write.** *"Subscription updates …
  count as function calls."* One click-write reruns every subscriber's board query, so
  the cost is N clients × M writes. This is why the cached, socket-free board page is
  architecture and not an optimisation.
- The default `*.convex.cloud` URL stays live and sits in the client bundle; the docs
  do not say how to stop serving it.
- Spend Management is minutes late by Vercel's own admission — the check runs *"every
  few minutes"* and *"projects can keep serving traffic and accruing usage for several
  minutes"*. That overshoot is the only way this configuration can surprise-bill.
- Rate-limit counters are **per region** on both vendors.
- The Stripe webhook path must bypass the firewall, and that bypass is a hole by
  construction. It must be signature-verified on the way in.
- ⚠️ **The failure the dev's rule does not cover:** a distributed script can freeze the
  whole board with fake 15-minute reservations while the site stays up and the attack
  costs almost nothing. Offline is acceptable to the dev; a board nobody can buy from,
  at no cost to the attacker, was never considered. This is now a live question for
  [ticket 06](06-buying-for-real.md).

### What this changes elsewhere

- **[Ticket 09](09-artwork-storage.md)** — artwork must be pre-sized and served with a
  fixed quality and no varying query string, or Image Optimization becomes the bill.
- **[Ticket 10](10-clicks-for-real.md)** — a click must not fan out to every
  subscriber, and an anonymous visitor must not hold a websocket at all.
- **[Ticket 14](14-environments-and-keys.md)** — the concrete limit values above are
  what it has to set.
