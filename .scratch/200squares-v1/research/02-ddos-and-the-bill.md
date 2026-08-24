# Research 02 — DDoS, cost and hard limits

Answers [issue 02](../issues/02-ddos-and-the-bill.md). Everything below was read on
**2026-08-24** and every URL was fetched that day. Primary sources only:
`vercel.com/docs`, `developers.cloudflare.com`, `cloudflare.com`, `docs.convex.dev`
and `convex.dev/pricing`. No blogs, no third-party comparisons, no Stack Overflow.

The rule this note is written against, from the map: **an attack may take the site
offline. It may never produce a bill.** The ceiling is **$25 a month** for
infrastructure in a normal month. Where a limit value would change at $50 or $100,
the note says so.

Where a page does not settle a question — for example whether a particular blocked
request is still counted — this note says *the docs do not say* in those words
instead of guessing.

## 0. The short version

- **The dev's direction is aimed at the wrong half of the stack.** Cloudflare in front
  of Vercel is a folk remedy that Vercel argues against by name in four documents.
  Vercel's own firewall on Pro beats Cloudflare Free on every axis, and proxying
  *subtracts* from it — Bot Protection stops working, the app loses the visitor's IP,
  and certificates need hand-holding.
- **Blocked traffic is already free on Vercel.** "WAF deny, challenge, or rate-limit
  mitigated traffic does not incur CDN Requests or Fast Data Transfer", and Attack Mode
  has "zero costs associated with traffic blocked". That is the strongest single fact in
  this note, and it is free on every plan.
- ⚠️ **Hobby is not allowed.** "All commercial usage of the platform requires either a
  Pro or Enterprise plan." A site with a Stripe checkout is commercial. **Vercel Pro is
  $20/month, fixed — 80% of the ceiling before a single visitor arrives.**
- **Spend Management does hard-pause, but not by default and not instantly.** "Setting a
  spend amount does not automatically stop usage"; the check runs "every few minutes" and
  "projects can keep serving traffic and accruing usage for several minutes". Vercel's
  default for new customers is $200, notifications only. Set it to **$5** with *Pause
  production deployment* on.
- **The hole is real and Convex says so.** "Convex doesn't build these in" — no WAF, no
  IP blocking, no bot filter, no challenge. The browser talks straight to
  `*.convex.cloud`, which Vercel cannot proxy ("Vercel rewrites proxy HTTP requests, not
  WebSocket connections") and which is not in the Cloudflare zone.
- ⚠️ **The expensive attack is not the write, it is the fan-out.** "subscription updates
  … count as function calls." One click-write reruns every subscriber's board query, so
  the cost is N clients × M writes. The fix is architectural: serve the board from cache
  and open no websocket for anonymous visitors.
- **Convex can be made to stop instead of bill, and better than Vercel can.** The Free
  plan has hard caps and no overage rate at all. Above it, per-deployment **usage limits**
  with `--type disable` and a daily UTC window turn the deployment off and back on by
  themselves, and a team **spending limit** with a $0 disable threshold means "seat fee
  only, then everything stops".
- ⚠️ **$20 + $25 = $45.** Vercel Pro is compulsory; the only way to put a firewall in
  front of the websocket is a Convex custom domain, and "Custom domains require a Convex
  Pro plan" at $25/developer/month. **At a $25 ceiling the websocket cannot be
  protected.** Convex stays on Free, where an attack breaks the site instead of billing
  it. The step to **$50** is the one that buys anything.
- ⚠️ **And even at $50 the win is partial**: Cloudflare's WAF sees the HTTP 101 upgrade
  and "once a connection has been established, the WAF does not perform any further
  inspections". It caps how many sockets open, not what they carry.
- **The one free control that reaches the websocket is Turnstile**, which works "without
  sending traffic through Cloudflare", is free, and allows unlimited challenges.
- **The cheapest defence is still the best one.** A cached, cookie-free board page with
  pre-sized artwork removes Function Invocations, Active CPU, Provisioned Memory, Fast
  Origin Transfer and every Convex subscription rerun from the worst case, leaving only
  Edge Requests and transfer — 10 M and 1 TB of which are included. ⚠️ Watch Image
  Optimization: cache writes are **$4.00 per 1M**, and a varying query string is how an
  attacker forces them.
- **The answer to the dev's rule is yes, with one honest exception.** Nothing in this
  configuration can produce a surprise invoice larger than $25 except Spend Management's
  few minutes of overshoot — but the checkout reservation can freeze the board without
  costing anything, and that failure the rule does not cover.

---

## 1. Vercel — what the Firewall gives, what Spend Management really does

### 1.1 First, the plan question, because it decides everything else

The ticket names the project `rob-vb/200-squares`, scope `robs-projects-52973834`.
`.vercel/project.json` in this repo confirms the ids
(`prj_2k5K3sd6UsJlvqdn381E0ILa2qLN`, `team_hFIT9GiF1xvSQIYY29S7jvzO`). **The plan
itself cannot be read from the repo or from any public page** — it is only visible in
the dashboard under Settings → Billing. The scope slug `robs-projects-…` is the shape
Vercel gives a personal Hobby team, so the project is almost certainly on **Hobby**
today.

⚠️ **That cannot survive launch.** Vercel's fair-use page is explicit:

> **Hobby teams** are restricted to non-commercial personal use only. All commercial
> usage of the platform requires either a Pro or Enterprise plan.

> Commercial usage is defined as any Deployment that is used for the purpose of
> financial gain of **anyone** involved in **any part of the production** of the
> project […] Examples of this include, but are not limited to, the following:
>
> - Any method of requesting or processing payment from visitors of the site
> - Advertising the sale of a product or service

Source: https://vercel.com/docs/limits/fair-use-guidelines (read 2026-08-24).

200squares.com sells squares with Stripe. It is commercial by both bullets. So the
site must be on **Pro** the day it takes a card, and the $25 ceiling has to be
planned around Pro, not around Hobby.

This matters enormously for the ticket's own rule, because **Hobby and Pro fail in
opposite directions**:

- **Hobby cannot produce a bill at all.** There is no card on file and no billing
  cycle. When you exceed a limit the feature simply stops:

  > As the Hobby plan is a free tier there are no billing cycles. In most cases, if
  > you exceed your usage limits on the Hobby plan, you will have to wait until 30
  > days have passed before you can use the feature again.

  Source: https://vercel.com/docs/plans/hobby (read 2026-08-24). That is exactly the
  dev's rule — offline, no invoice — enforced by the platform for free. It is also
  against the terms for this site.

- **Pro bills on demand by default.** Overage is automatic unless you configure
  otherwise (§1.5).

### 1.2 The money on Pro

> - $20/month Pro platform fee
>   - 1 deploying team seat included
>   - $20/month in usage credit

> **Monthly credit**: Every Pro plan has $20 in monthly credit.
> **Included infrastructure usage**: Each month, you have 1 TB Fast Data Transfer and
> 10,000,000 Edge Requests included. Once you exceed these included allocations,
> Vercel will charge usage against your monthly credit before switching to on-demand
> billing.

> The credit and allocations expire at the end of the month if they are not used […]

Source: https://vercel.com/docs/plans/pro-plan (read 2026-08-24).

So the floor is **$20/month, fixed**, out of a $25 ceiling. The site gets $5/month of
real headroom on Vercel — and before that $5 is touched, an attacker must first burn
through 1 TB of transfer, 10 million edge requests, **and** $20 of credit.

Overage rates, `iad1` (Washington), which is Vercel's US-East region and the one a
default Next.js project lands in; rates are regional and differ per region
(https://vercel.com/docs/pricing/regional-pricing/iad1, read 2026-08-24):

| Resource | Rate |
| --- | --- |
| Fast Data Transfer | Included first 1 TB, then **$0.15 per 1 GB** |
| Edge Requests | Included first 10,000,000, then **$2.00 per 1,000,000** |
| Fast Origin Transfer | **$0.06 per 1 GB** |
| Edge Requests – Additional CPU Duration | **$0.30 per hour** |
| Image Optimization Transformation | **$0.05 per 1K** |
| Image Optimization Cache Reads / Writes | **$0.40 per 1M** / **$4.00 per 1M** |
| Firewall Rate Limit Requests | **$0.50 per 1,000,000 Allowed Requests** |
| Firewall OWASP Requests | **$0.80 per 1,000,000 Inspected Requests** |
| Firewall OWASP Excess Bytes | **$0.20 per 1 GB of inspected request payload** |
| ISR Writes / Reads | **$4.00 per 1M** / **$0.40 per 1M** |

Function compute, from the same fair-use page
(https://vercel.com/docs/limits/fair-use-guidelines, read 2026-08-24): Active CPU
"Starting at $0.128 per hour", Provisioned Memory "Starting at $0.0106 per GB-hr",
Function Invocations "$0.60 per 1M invocations".

Worth doing the arithmetic once: **$5 of headroom is 2.5 million edge requests beyond
the included 10 million, or 33 GB of transfer beyond the included 1 TB.** An
unfiltered L7 flood does that in minutes. The included allocation, not the headroom,
is what actually protects the bill — and only if the flood is blocked before it
counts.

### 1.3 What Vercel blocks, in what order, and what it costs

Every request passes four layers, in this order
(https://vercel.com/docs/vercel-firewall, read 2026-08-24):

> 1. DDoS mitigation rules
> 2. WAF IP blocking rules
> 3. WAF custom rules
> 4. WAF Managed Rulesets

**Platform DDoS mitigation** is on for everyone, always, free:

> Vercel provides automatic DDoS mitigation for all deployments, regardless of your
> plan. We block incoming traffic if we identify abnormal or suspicious levels of
> incoming requests.

> **Note:** Vercel does not charge customers for traffic that gets blocked with DDoS
> mitigation.

> Vercel mitigates against L3, L4, and L7 DDoS attacks regardless of the plan you are
> on.

Source: https://vercel.com/docs/vercel-firewall/ddos-mitigation (read 2026-08-24).

⚠️ **But the same page states the leak in plain words:**

> Usage will be incurred for requests that are successfully served prior to us
> automatically mitigating the event. Usage will also be incurred for requests that
> are not recognized as a DDoS event, which may include bot and crawler traffic.

That is the whole problem in two sentences. Automatic mitigation is reactive; it
costs you everything served before it engages, and everything it does not classify as
an attack. A slow, distributed, plausible-looking flood — 200 IPs each fetching the
board page twice a second — is *not* a DDoS event by that definition. It is just
traffic, and it is billed.

**Attack Mode** (the dev's "attack mode") is the manual override:

> Attack Mode is a security feature that protects your site during DDoS attacks. When
> enabled, visitors must complete a security challenge before accessing your site,
> while known bots (like search engines and webhook providers) are automatically
> allowed through.

> Attack Mode is available for free on all plans and requests blocked by Attack Mode
> do not count towards your usage limits.

> All mitigations by Attack Mode are free and unlimited, and there are zero costs
> associated with traffic blocked by Attack Mode.

Source: https://vercel.com/docs/vercel-firewall/attack-mode (read 2026-08-24).
Enable it at Dashboard → project → **Firewall** → **Bot Management** → **Attack
Mode** → **Enable**. Search crawlers are exempt, so it is safe to leave on for long
periods:

> Attack Mode can be safely used for extended periods without affecting search engine
> indexing or webhook functionality.

⚠️ Attack Mode is a **manual switch**. Nothing in the docs turns it on for you. If
the attack starts at 03:00 the dev is the trigger. ⚠️ And it breaks non-browser
callers:

> Standalone APIs, other backend frameworks, and non-recognized automated services
> may not be able to pass challenges and could be blocked.

Stripe webhooks are on Vercel's verified-bot list ("known bots […] like search
engines and webhook providers"), but the docs do not name Stripe specifically. Before
relying on this, put a `bypass` custom rule on the Stripe webhook path.

**What is billed while a request is being blocked** — this is the ticket's question 1,
and the WAF pricing page answers it directly:

> WAF deny, challenge, or rate-limit mitigated traffic does not incur CDN Requests or
> Fast Data Transfer (FDT). Requests that pass a challenge and continue to your
> application count toward normal usage.

> The same applies to persistent actions, DDoS mitigation, Attack Mode, and IP
> blocking.

Source: https://vercel.com/docs/vercel-firewall/vercel-waf/usage-and-pricing (read
2026-08-24).

So: **a blocked request costs nothing.** Deny, challenge, rate-limit, IP block,
persistent action, DDoS mitigation, Attack Mode — all free, all unmetered. That is a
genuinely strong answer and it is the reason Vercel's own firewall, not Cloudflare, is
the load-bearing defence here.

⚠️ Three carve-outs, all in that same quote or nearby:

1. **A request that *passes* a challenge counts.** Attack Mode does not make traffic
   free; it makes *blocked* traffic free.
2. **Rate limiting itself is metered on Pro** — $0.50 per 1,000,000 *Allowed*
   Requests. You pay for the requests the rate limiter lets through, not the ones it
   stops. On Hobby it is "1,000,000 Allowed requests" included.
3. **OWASP managed ruleset is metered per inspected request** ($0.80/1M plus $0.20/GB
   of payload). Under a flood, an inspecting ruleset is itself a cost driver. Do not
   enable OWASP on a $25 budget.

### 1.4 The rule and limit counts, per plan

From the Hobby/Pro comparison table (https://vercel.com/docs/plans/hobby, read
2026-08-24) and the rate-limiting limits table
(https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting, read 2026-08-24):

| | Hobby | Pro |
| --- | --- | --- |
| DDoS mitigation | On by default | On by default |
| Attack Mode | Available, free | Available, free |
| WAF IP blocking | Up to **3** | Up to **100** |
| WAF custom rules | Up to **3** | Up to **40** |
| WAF rate limit rules | **1 per project** | **40 per project** |
| Rate limit counting keys | IP, JA4 Digest | IP, JA4 Digest |
| Rate limit algorithm | Fixed window | Fixed window |
| Rate limit window | min **10s**, max **10 min** | min **10s**, max **10 min** |
| Rate limit included requests | 1,000,000 Allowed | Usage-based |
| Spend Management | **N/A** | Configurable |
| Log Drains | – | Configurable |
| Edge Requests | Up to 1,000,000 | 10,000,000 included, then on-demand |
| System Bypass Rules | – | Pro and Enterprise |

Custom rule actions are `log`, `deny`, `challenge`, `bypass`, `redirect`, plus rate
limit (https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules, read
2026-08-24). Rules apply without redeploying: "When you apply the configuration, it
takes effect immediately and does not require re-deployment." Rules can also be
written in natural language, and the docs' own example prompt is exactly what this
site needs: *"Rate limit POST /auth/login to 10 per minute per IP, deny for 15
minutes"*.

**Persistent actions** are the cheap, nasty weapon:

> With persistent actions, you can automatically block potential bad actors by adding
> a time-based block to the **Challenge** or **Deny** action of your custom rule.

> - It is applied to the IP address of the client that originally triggered the rule
>   to match.
> - It happens before the firewall processes the request, so that none of the
>   requests blocked by persistent actions count towards your CDN and traffic usage.

Same source. So a rate-limit rule with a persistent action promotes a noisy IP into a
free, pre-firewall IP block for a chosen period (default 1 minute). The docs do not
state a plan restriction on persistent actions on that page.

⚠️ **The rate limiter counts per region:**

> Rate limit counters are tracked on a per-region basis; traffic matching a given rate
> limit key in multiple regions can exceed the limit you configure for any single
> region.

Source: https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting (read
2026-08-24). A distributed attacker gets N × your limit, where N is the number of
Vercel CDN regions it hits. Set limits assuming they are soft by a factor of ten.

**Bot Protection managed ruleset** challenges non-browser traffic that claims to be a
browser, and excludes verified bots. It is **inactive by default**
(https://vercel.com/docs/bot-management, read 2026-08-24). Vercel's pricing page marks
both "Bot Protection (managed ruleset)" and "AI Bots (managed ruleset)" as included on
Hobby, Pro and Enterprise with no price attached, alongside "BotID — Basic checks
included" on Hobby and "$1 per 1,000 Deep Analysis checks" on Pro
(https://vercel.com/pricing, read 2026-08-24). The WAF usage-and-pricing page prices
only OWASP and rate limiting, so on the evidence Bot Protection is free — but *the docs
do not say* explicitly that it is unmetered the way they say it for Attack Mode. Treat
it as free and watch the first invoice.

⚠️ And here is the sentence that decides question 2 before we even get to Cloudflare:

> Bot Protection doesn't work when a reverse proxy (e.g. Cloudflare, Azure, or other
> CDNs) is placed in front of your Vercel deployment. This setup significantly
> degrades detection accuracy and performance, leading to a suboptimal end-user
> experience.

Source: https://vercel.com/docs/bot-management (read 2026-08-24).

### 1.5 Spend Management — it does hard-pause, but only if you tell it to, and it is late

This is the ticket's sharpest sub-question. The honest answer: **it can hard-pause,
it does not by default, and it is minutes behind reality.**

> Spend management is a way for you to notify or to automatically take action on your
> account when your team hits a set spend amount. The actions you can take are:
> - Receive a notification
> - Trigger a webhook
> - Pause the production deployment of all your projects

> **Note:** Setting a spend amount does not automatically stop usage. If you want to
> pause all your projects at a certain amount, you must enable the option.

> When your team reaches the spend amount, Vercel automatically pauses the production
> deployment for **all projects** on your team.

> When visitors access your production deployment while it is paused, they will see a
> 503 DEPLOYMENT_PAUSED error.

Source: https://vercel.com/docs/spend-management (read 2026-08-24).

⚠️ **The delay is documented and it is not small:**

> Vercel checks your metered resource usage often to determine if you are approaching
> or have exceeded your spend amount. This check happens every few minutes.

> Because these checks are not continuous, notifications, webhooks, and project
> pausing can trigger several minutes after you cross your spend amount. Plan for this
> delay if you are relying on Spend Management to cap usage, and consider setting your
> spend amount below the absolute maximum you are willing to spend.

> **Note:** Pausing is not instantaneous. Because Vercel checks your spend every few
> minutes, projects can keep serving traffic and accruing usage for several minutes
> after you cross the spend amount.

Vercel is telling you in its own docs: this is not a hard cap, it is a fast-acting
soft cap. Budget for overshoot.

⚠️ **What the spend amount does *not* cover:**

> The spend amount that you set covers metered resources that go beyond your Pro plan
> credits and usage allocation for all projects on your team.
> It **does not** include seats, integrations (such as Marketplace), or separate
> add-ons, which Vercel charges on a monthly basis.

So a spend amount of `$5` means "$20 platform fee + up to $5 of on-demand overage",
i.e. **$25**. The spend amount is measured *after* the $20 credit and the 1 TB / 10 M
allocations are exhausted. Set it to the headroom, not to the total.

⚠️ **The default is wrong for this project:**

> **Note:** By default, Vercel enables spend management notifications for new
> customers at a spend amount of $200 per billing cycle.

Source: https://vercel.com/docs/plans/pro-plan (read 2026-08-24). $200 is eight times
the ceiling, and by default only *notifications* are on — not pausing.

Other mechanics worth knowing: alerts fire at **50%, 75% and 100%** of the amount;
SMS alerts fire only at 100% and must be enabled per person; a webhook fires at
those thresholds and again at `endOfBillingCycle`; and unpausing is manual —

> Projects need to be resumed on an individual basis […] Projects won't automatically
> unpause if you increase the spend amount, you must resume each project manually.

Setting the amount below current spend triggers the actions immediately, which makes
"set it to $1" a usable panic button.

### 1.6 The limit values to set at Vercel, for $25 / $50 / $100

| Setting | $25 ceiling | $50 ceiling | $100 ceiling |
| --- | --- | --- | --- |
| Plan | Pro, 1 seat ($20) | Pro, 1 seat ($20) | Pro, 1 seat ($20) |
| Spend amount | **$5** | **$5** | **$20** |
| Pause production deployment | **Enabled** | Enabled | Enabled |
| Notifications | web + email + SMS at 100% | same | same |
| OWASP managed ruleset | **Off** (metered per request) | Off | On, in Log first |
| Bot Protection ruleset | On, **Challenge** | On, Challenge | On, Challenge |
| Rate limit rules | as many as fit in 40 | same | same |

Nothing at $50 or $100 changes the *architecture*; only the spend amount and whether
you can afford to run OWASP inspection. The spend amount does not rise in step with the
ceiling, because at $50 and $100 the extra money goes to **Convex Pro at $25 a
developer** (§6.0), which is the dimension that actually needs it.

---

## 2. Cloudflare in front of Vercel — supported, or folk remedy?

Short answer: **it is a folk remedy that Vercel actively argues against, in four
separate documents, by name.** It is not forbidden, and one specific part of it
(client-IP recovery) *is* officially supported. But Vercel's position is unambiguous
and it is worth reading in full before the dev commits to it.

### 2.1 What Vercel says, verbatim

From the KB page whose title is literally the question
(https://vercel.com/kb/guide/cloudflare-with-vercel, read 2026-08-24, page last
updated 2026-07-16):

> Using reverse proxies like Cloudflare will limit Vercel's traffic visibility for
> security measures, introduce latency that degrades performance, and create cache
> management issues that may affect reliability. We **do not recommend** using a
> reverse proxy in front of Vercel.

> ## DNS
> We recommend moving to Vercel as your DNS provider.

> ## Bot Protection
> We discourage using reverse proxies (e.g. Cloudflare, Azure, or other CDNs) in front
> of Vercel when Bot Protection is enabled. This setup significantly degrades
> detection accuracy and performance, resulting in a poor end-user experience.
>
> Reverse proxies interfere with Vercel's ability to reliably identify bots:
> - **Obscured detection signals** – Legitimate users may be incorrectly challenged
>   because the proxy masks signals that Bot Protection relies on.
> - **Frequent re-challenges** – Some proxies rotate their exit node IPs frequently,
>   forcing Vercel to re-initiate the challenge on every IP change.

> The biggest disadvantage is that Vercel no longer has full traffic visibility, which
> prevents the Vercel Firewall and our threat intelligence products from working to
> their full potential. This includes our ability to automatically challenge requests,
> prevent DDoS attacks, and more.

From the docs page (https://vercel.com/docs/security/reverse-proxy, read 2026-08-24):

> **We do not recommend** placing a reverse proxy server in front of your Vercel
> project as it affects Vercel's firewall in the following ways:
>
> - Vercel's CDN **loses visibility** into the traffic, which reduces the
>   effectiveness of the firewall in identifying suspicious activity.
> - Real end-user IP addresses cannot be accurately identified.
> - If the reverse proxy undergoes a malicious attack, this traffic can be forwarded
>   to the Vercel project and cause usage spikes.
> - If the reverse proxy is compromised, Vercel's firewall cannot automatically purge
>   the cache.

⚠️ Read the third bullet again against the ticket's rule. Vercel is saying that a
proxy in front does not stop an attack from becoming *your* usage — it just moves
where the decision is made.

### 2.2 The list of things that break, from Vercel's own proxy guide

All of the following is verbatim from
https://vercel.com/kb/guide/can-i-use-a-proxy-on-top-of-my-vercel-deployment (read
2026-08-24, last updated 2026-07-16). This page is the most concrete of the four and
every item is a real operational trap.

**Two caches, and stale HTML after every deploy:**

> A third party proxy, when used with Vercel, can introduce two caching layers: one at
> the third party and one at Vercel. This can result in incorrect data being sent to
> visitors.
>
> When you push a new deployment to Vercel, our platform will purge the existing cache
> across all of our regions automatically. You will need to ensure that your proxy is
> also respecting this behaviour, and purging its own proxy cache after each
> deployment.

The companion page spells out the failure mode
(https://vercel.com/kb/guide/why-running-another-cdn-on-top-of-vercel-is-not-recommended,
read 2026-08-24):

> A new release on Vercel can cause other CDNs to serve stale content referencing
> files that no longer exist. […] The stale HTML is returned by the 3rd party CDN but
> other assets were purged from it, returning a 404. For that reason, we recommend
> users to either configure the 3rd party CDN with a very short TTL in the cache or
> disable it completely.

⚠️ **Two paths must never be cached and never be redirected**, or the domain breaks:

> You should also ensure the following path is **never** cached:
> `https://<YOUR_DOMAIN>/.well-known/vercel/*`
> Otherwise, your users may experience stale content, mixed assets, challenge mode
> issues and other unexpected behaviour.

> To allow this traffic to pass correctly, you must ensure your proxy does not block
> or automatically redirect traffic on the following HTTP wildcard path:
> `http://<YOUR_DOMAIN>/.well-known/acme-challenge/*`
> In addition to allowing: `/.well-known/vercel/*`
> You must also ensure that the HOST header is correctly forwarded, otherwise the
> request will also fail. Certain proxy providers such as Cloudflare automatically
> configure these rules for you, but creating additional rules may block this.

The `/.well-known/vercel/*` path being cached is what breaks **Attack Mode** — that is
what "challenge mode issues" means. So the dev's own preferred combination (Cloudflare
in front *plus* Vercel attack mode) is precisely the combination this sentence warns
about, and it only works if Cloudflare is configured to bypass cache on that path.

⚠️ **Vercel may ban your proxy's IPs:**

> Most proxies use a single IP address to connect to our systems, so if we detect an
> anomaly in requests coming from a single source, the IP can get banned for a period
> of time ranging from a few minutes to days.
>
> You must ensure that any traffic mitigation measures, such as DDoS protection, rate
> limiting or throttling are implemented within your third party proxy, to prevent this
> traffic from being subsequently routed to Vercel, resulting in your proxy IP
> address(es) being blocked from accessing Vercel.

This is the sharpest practical risk of the arrangement: an attack arrives, Cloudflare
forwards some of it, Vercel's platform firewall sees a flood from Cloudflare's egress
IPs and bans them — and now Cloudflare cannot reach Vercel at all. The site is offline.
Under the dev's rule that is an *acceptable* failure, but it is worth knowing that the
proxy makes it more likely, not less.

> Additionally, if you run a proxy in front of your Vercel apps, you must ensure that
> it is sending the SNI hostname correctly. […] Not sending the SNI hostname can
> result in aggressive blocking by our system firewall rules.

⚠️ **Certificates and domain verification:**

> Vercel automatically provisions SSL certificates and checks to make sure that any
> custom domain are configured correctly. Using a proxy can impact this traffic. This
> may result in incorrect domain configuration alerts and prevent our Let's Encrypt
> SSL certificates from being provisioned.

**Geolocation and IP:**

> Using a proxy will send all traffic through the proxy first, then to Vercel. This
> will result in incorrect geolocation data being presented and the public IP address
> of your proxy being sent.

**And support goes away:**

> Using a proxy introduces complications to your project or deployment that are
> unrelated to the Vercel platform and therefore we cannot recommend or provide
> support for issues when using a proxy. […] Per our Support Terms, it may be
> necessary for the team to require you to disable or reconfigure your proxy before we
> can assist further.

### 2.3 The one part that *is* supported: `CF-Connecting-IP`

There is a real exception, and it matters, because it is the fix for "real end-user IP
addresses cannot be accurately identified" — which would otherwise destroy every
IP-keyed rate limit on the Vercel side.

Vercel runs a feature called **Verified Proxy**, and Cloudflare is on the
automatically-enabled list for **all plans**
(https://vercel.com/docs/security/reverse-proxy, read 2026-08-24):

> Verified Proxy is automatically enabled for the providers listed below on all plans.

| Provider | Required Header | Configuration |
| --- | --- | --- |
| Cloudflare | `CF-Connecting-IP` | A built-in header. No additional configuration required. |

> **Plan eligibility:**
> - Hobby/Pro: Verified Proxy Lite only
> - Enterprise: Lite + Advanced (self-hosted/geolocation preservation)

> **Prerequisites**
> - **TLS setup:** Disable HTTP→HTTPS redirection for
>   `http://<DOMAIN>/.well-known/acme-challenge/*` on port 80
> - **Cache control:** Never cache `https://<DOMAIN>/.well-known/vercel/*` paths

So on Pro, with Cloudflare proxying, Vercel's **firewall** recovers the true client IP
from `CF-Connecting-IP` with no configuration, and IP-keyed WAF rules and rate limits
keep working. That is the single strongest argument for the arrangement, and it is a
real, documented, first-party one. ⚠️ But it is narrower than it sounds on two counts:
Verified Proxy Lite is about **client IP identification**, not about restoring Bot
Protection's signals, so the warning in §2.1 stands; and it does not give **your
application** the visitor's IP or geolocation — that needs Verified Proxy Advanced,
which is Enterprise-only (§2.5).

### 2.4 What Cloudflare's Free plan actually gives

The domain already sits at Cloudflare with Cloudflare nameservers and an empty zone
([ticket 04](../issues/04-domain.md)), so turning the proxy on costs nothing and moves
nothing. The question is only whether it earns its place.

**Prices.** Free `$0/month`; Pro `$25/month` billed monthly (`$20/month` billed
annually); Business `$250/month` monthly (`$200/month` annually); Enterprise is
contract-only. Source: the plan data behind https://www.cloudflare.com/plans/, read
2026-08-24 — the visible page now renders Developer Platform pricing and the plan cards
are client-rendered. Corroborated at
https://developers.cloudflare.com/billing/understand/how-billing-works/ (read
2026-08-24):

> Domain plan charges (Free, Pro, Business, Enterprise) are flat-rate and billed at the
> start of each billing period for the upcoming month or year. Plans are billed **per
> domain** — if you have 20 domains on the Pro plan at $25/month, you will see a single
> line item for 20 x $25 = $500.

⚠️ **Cloudflare Pro alone is the entire $25 ceiling.** Cloudflare has to be Free here,
and at $50 or $100 it competes directly with Convex Pro (§6.0). Free it is.

**Cloudflare Free cannot produce an invoice.** The billing page lists exactly three
charge types — flat-rate plan charges, flat-rate subscriptions and add-ons, and
usage-based charges, where the usage-based list is "Workers, R2, Cache Reserve
operations, Stream minutes viewed, and Argo data transfer". Plain proxied requests and
bandwidth are not on that list, and **the docs do not say** anywhere that proxied
requests on a Free zone are metered. The one Free-plan risk is the opposite one, from
https://www.cloudflare.com/terms/ (read 2026-08-24):

> We will make each such Free Service available to you free of charge until the earlier
> of […] (c) **termination of the Free Service by Cloudflare in our sole discretion**.

So Cloudflare Free can be taken away — offline — but it cannot bill. That is exactly the
failure the dev has already accepted.

**DDoS mitigation, all plans, unmetered** (https://www.cloudflare.com/plans/ feature row
"Unmetered DDoS Protection", true on all four plans, read 2026-08-24):

> Cloudflare's unmetered mitigation of DDoS stops illegitimate volumetric traffic at the
> Cloudflare edge. All Cloudflare plans include unmetered mitigation without fear of
> being dropped.

The docs table (https://developers.cloudflare.com/ddos-protection/, read 2026-08-24,
header "Available on all plans") lists **"Standard, unmetered DDoS protection (layers
3-7)"** as *Yes* for Free, along with HTTP DDoS attack protection and network-layer
(L3/4) protection. ⚠️ **DDoS Alerts are not on Free** — Pro and up only. On Free the dev
finds out from the site being slow, not from Cloudflare.

**WAF custom rules** (https://developers.cloudflare.com/waf/custom-rules/, read
2026-08-24):

| | Free | Pro | Business | Enterprise |
| --- | --- | --- | --- | --- |
| Number of rules | **5** | 20 | 100 | 1,000 |
| Supported actions | All except Log | All except Log | All except Log | All |
| Regex support | **No** | No | Yes | Yes |
| Custom rulesets per zone | 1 | 2 | 5 | 10 |

"All except Log" on Free means Block, Managed Challenge, Non-Interactive (JS) Challenge,
Interactive Challenge and Skip
(https://developers.cloudflare.com/ruleset-engine/rules-language/actions/, read
2026-08-24). The table restricts count, actions and regex only; **the docs do not say**
that Free restricts which *fields* a custom rule may match, unlike rate limiting where
the field list is explicitly per-plan.

**Rate limiting rules** — this is the weak spot
(https://developers.cloudflare.com/waf/rate-limiting-rules/, read 2026-08-24):

| | Free | Pro | Business |
| --- | --- | --- | --- |
| Number of rules | **1** | 2 | 5 |
| Fields usable in the expression | **Path, Verified Bot** | Host, URI, Path, Full URI, Query, Verified Bot | + Method, Source IP, User Agent |
| Counting characteristics | **IP** | IP | IP with NAT support |
| Counting period | **10 s** | up to 1 min | up to 10 min |
| Mitigation timeout | **10 s** | up to 1 h | up to 1 day |
| Cache exclusion | **No** | No | Yes |

⚠️ Read the Free row carefully: **one rule, matching only on URI path or verified-bot
status, counting per IP, over a fixed 10-second window, blocking for 10 seconds.** The
request threshold itself is a free integer (`requests_per_period`,
https://developers.cloudflare.com/waf/rate-limiting-rules/parameters/, read 2026-08-24),
but everything around it is fixed. Three further traps, all verbatim:

> Depending on your Cloudflare plan, this rule parameter might not be available. In that
> case, Cloudflare will also apply rate limiting to cached assets (the parameter is
> enabled by default).

— i.e. on Free, **cache hits count toward the limit**, so a rate limit on a cached page
punishes honest readers.

> Cloudflare does not support global rate limiting counters across the entire network.
> Each data center maintains its own counters.
> (https://developers.cloudflare.com/waf/rate-limiting-rules/request-rate/, read 2026-08-24)

— the same per-region softness as Vercel's (§1.4), and worse: a distributed attack across
100 colos gets 100× the configured threshold.

> Rate limiting rules are not designed to allow a precise number of requests to reach
> your origin server. There may be a delay of up to a few seconds between detecting a
> request and updating rate counters. Due to this delay, excess requests could still
> reach the origin before Cloudflare enforces a mitigation action.

**Managed rulesets** (https://developers.cloudflare.com/waf/managed-rules/, read
2026-08-24). Free gets one, and only one:

> **Cloudflare Free Managed Ruleset**: Available on all Cloudflare plans. Provides
> protection against high-impact and widely exploited vulnerabilities.

| | Free | Pro | Business | Enterprise |
| --- | --- | --- | --- | --- |
| Free Managed Ruleset | **Yes** | Yes | Yes | Yes |
| Cloudflare Managed Ruleset | **No** | Yes | Yes | Yes |
| Cloudflare OWASP Core Ruleset | **No** | Yes | Yes | Yes |

⚠️ **The docs do not say** which individual rules the Free Managed Ruleset contains —
there is no reference page for it, unlike every other ruleset.

**IP, ASN and country blocking**
(https://developers.cloudflare.com/waf/tools/ip-access-rules/, read 2026-08-24): IP
Access Rules give **50,000 rules per account on every plan**, but

> **Block by country is only available on Enterprise plans.** Other customers may
> perform country blocking using WAF custom rules.

So geoblocking has to spend one of the five Free custom rules, e.g.
`(ip.src.country in {"KP" "SY"})` → Block. Free also allows only **1 custom list**.
⚠️ And an Allow rule is a loaded gun: "Allowing an IP or ASN will bypass any configured
custom rules, rate limiting rules, WAF Managed Rules".

**Bot Fight Mode** is the Free bot filter
(https://developers.cloudflare.com/bots/get-started/bot-fight-mode/ and
https://developers.cloudflare.com/bots/plans/free/, read 2026-08-24). It "Identifies
traffic matching patterns of known bots" and "Issues computationally expensive
challenges that force the requesting client to perform CPU-intensive calculations",
against "Simple bots from cloud hosting providers and headless browsers". ⚠️ Three
warnings that matter for this app:

> Although these products are designed to fight malicious actors on the Internet, they
> **may challenge API or mobile app traffic**.

> **You cannot bypass or skip Bot Fight Mode using WAF custom rules or Page Rules.**
> This is because Bot Fight Mode does not run on the Ruleset Engine — it operates in a
> separate evaluation pipeline where *Skip*, *Bypass*, and *Allow* actions have no
> effect. If you need to create exceptions for specific traffic (for example, your own
> API clients or monitoring tools), use Super Bot Fight Mode instead.

> For Bot Fight Mode customers, JavaScript Detections is automatically enabled and
> **cannot be disabled**. If you have a Content Security Policy (CSP) […] Ensure that
> anything under `/cdn-cgi/challenge-platform/` is allowed.

Super Bot Fight Mode — the version with Skip rules — is Pro and up. So on Free, Bot
Fight Mode is an all-or-nothing switch with no exception mechanism, forced script
injection, and a documented risk of challenging exactly the API traffic this site needs.

**Under Attack mode** (https://developers.cloudflare.com/fundamentals/reference/under-attack-mode/
and https://developers.cloudflare.com/waf/tools/security-level/, read 2026-08-24) is the
zone `security_level` setting; that page carries no plan restriction.

> Cloudflare's Under Attack mode performs additional security checks to help mitigate
> layer 7 DDoS attacks. Validated users access your website and suspicious traffic is
> blocked. It is designed to be used as one of the last resorts when a zone is under
> attack (and will temporarily pause access to your site and impact your site
> analytics).

> The `Checking your browser before accessing...` challenge determines whether to block
> or allow a visitor within five seconds.

> **Caution:** Only use Under Attack mode when a website is under a DDoS attack. Under
> Attack mode may affect some actions on your domain, such as **your API traffic**.

It is switched on from the zone overview's **Quick Actions** sidebar, or scoped to
particular paths with a configuration rule (Free allows 10 of those).

⚠️ **Challenges break non-HTML requests**, which is the same trap in a third guise
(https://developers.cloudflare.com/cloudflare-challenges/challenge-types/challenge-pages/,
read 2026-08-24):

> Challenge Pages interrupt the request flow by returning a full HTML page for the
> user's browser to render and solve. **This mechanism fails when the browser expects a
> non-HTML response, such as an AJAX or XHR (fetch) request.**
> To ensure your API calls are protected without breaking single-page applications (SPAs)
> or API integrations, Cloudflare recommends using Turnstile Pre-clearance.

**Turnstile** is the one Cloudflare product in this note that works with no zone at all,
and it is free (https://developers.cloudflare.com/turnstile/plans/ and
https://developers.cloudflare.com/turnstile/, read 2026-08-24):

| | Free |
| --- | --- |
| Pricing | Free |
| Number of widgets | Up to 20 per account |
| **Unlimited challenges (traffic or verification requests)** | **Yes** |
| Hostnames per widget | 10 |
| Pre-clearance support | Yes |

> Turnstile can be embedded into any website **without sending traffic through
> Cloudflare** and works without showing visitors a CAPTCHA.

> In contrast to our Challenge page offerings, Turnstile allows you to run challenges
> anywhere on your site in a less-intrusive way **without requiring the use of
> Cloudflare's CDN**.

That sentence is the most useful thing in this section, and §4.6 spends it.

**Caching on Free.** HTML is not cached by default
(https://developers.cloudflare.com/cache/concepts/default-cache-behavior/, read
2026-08-24):

> Cloudflare only caches based on file extension and not by MIME type. **The Cloudflare
> CDN does not cache HTML or JSON by default.**

The fix is a Cache Rule (Free allows **10**) with **Cache eligibility → Eligible for
cache** (https://developers.cloudflare.com/cache/how-to/cache-rules/, read 2026-08-24);
the legacy Page Rules "Cache Everything" setting is available on all plans
(https://developers.cloudflare.com/rules/page-rules/reference/settings/, read
2026-08-24). Free gets 3 Page Rules, 10 Cache Rules, 10 Configuration Rules and 10
Transform Rules. ⚠️ Free's minimum Edge Cache TTL is **2 hours** against 1 second on
Business, so short-TTL strategies are unavailable. Cloudflare respects origin cache
headers by default on Free, Pro and Business, in the precedence
`Cloudflare-CDN-Cache-Control` > `CDN-Cache-Control` > `Cache-Control`
(https://developers.cloudflare.com/cache/concepts/cache-responses/, read 2026-08-24).

⚠️ **Two things Free does not have that matter during an actual attack:** Firewall
Analytics and Cache Analytics (Pro and up), and ticket support — Free is "community
forums and documentation only". During an incident the dev would be reading Vercel's
firewall dashboard, not Cloudflare's.

### 2.5 The mechanics that must be right, if the proxy ever goes on

**SSL mode: Full (strict), never Flexible.** Vercel's own troubleshooting article
(https://vercel.com/kb/guide/resolve-err-too-many-redirects-when-using-cloudflare-proxy-with-vercel,
read 2026-08-24):

> This error occurs when your Cloudflare SSL/TLS configuration is set to "Flexible".
> Under that scenario, Cloudflare will send requests from their servers to your Vercel
> deployment using HTTP instead of HTTPS. […] To fix the issue, you need to set the
> "SSL/TLS" option in Cloudflare to "Full".

Cloudflare's own advice goes one step further
(https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/, read
2026-08-24): "If possible, Cloudflare strongly recommends using **Full** or **Full
(strict)** modes". Vercel serves a valid public Let's Encrypt certificate, so **Full
(strict)** validates and is the right choice.

**Certificates.** The proxy genuinely does break issuance and renewal
(https://vercel.com/kb/guide/a-record-and-caa-with-vercel and
https://vercel.com/kb/guide/domain-not-generating-ssl-certificate, read 2026-08-24):

> A proxied Cloudflare record (the orange cloud) sits between the public DNS answer and
> Vercel's expected A record, which **blocks verification and the SSL challenge**.

> **If your certificate worked before and now fails to renew:** Certificates renew
> automatically, and renewal repeats the same validation. A certificate issued while
> your domain pointed directly at Vercel will fail its next renewal if a proxy was
> enabled in between.

The documented fixes are to go DNS-only while the certificate issues, or to exempt
`/.well-known/acme-challenge/*` from caching, redirects, rewrites *and* firewall rules —
plus the CAA record must permit `letsencrypt.org`.

**DNS values.** ⚠️ Any memory of `cname.vercel-dns.com` is stale. Vercel now says
(https://vercel.com/kb/guide/a-record-and-caa-with-vercel and
https://vercel.com/docs/domains/working-with-domains/add-a-domain, read 2026-08-24):

> Always use the value shown in your project's domain card. For most projects that value
> is `76.76.21.21` […] Newer projects draw a value from a pool of anycast IPs matched to
> the plan and project […] The card is the source of truth.

> Each project has a unique CNAME record e.g. `d1d4fc829fe7bc7c.vercel-dns-017.com`.

Run `vercel domains inspect 200squares.com` to get the exact records. Cloudflare's CNAME
flattening makes a CNAME at the apex work on all plans. ⚠️ Vercel "do not support IPv6
yet", so do not add a proxied AAAA.

**Client IP — and the part that is worse than it first looks.** Verified Proxy Lite
means Vercel's *firewall* trusts `CF-Connecting-IP` (§2.3). It does **not** give the app
the visitor's IP (https://vercel.com/docs/headers/request-headers, read 2026-08-24):

> If you are trying to use Vercel behind a proxy, **we currently overwrite the
> `X-Forwarded-For` header and do not forward external IPs.** This restriction is in
> place to prevent IP spoofing.

> **Enterprise customers** can purchase and enable a trusted proxy to allow your custom
> `X-Forwarded-For` IP.

And (https://vercel.com/kb/guide/how-to-setup-verified-proxy, read 2026-08-24):

> That is expected because our system sees your Proxy IP as a client IP address. If you
> need to see the real client IP/geolocation throughout your application, you must
> enable **Verified Proxy Advanced** (Enterprise only).

> If you do use a proxy in front of your deployment, be aware that the Vercel platform
> will always display a "Proxy Detected" banner in the Firewall page.

So with Cloudflare proxying, `x-forwarded-for`, `x-real-ip` and every `x-vercel-ip-*`
geolocation header show **Cloudflare**, not the visitor. Application code would have to
read `CF-Connecting-IP` itself. That is a second, quieter cost of the arrangement.

**Not orange-to-orange.** Cloudflare's O2O only applies when the origin is another
Cloudflare zone using Cloudflare for SaaS, in a different account
(https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/saas-customers/how-it-works/,
read 2026-08-24). Vercel runs its own edge, and Cloudflare's non-proxiable-target list
(https://developers.cloudflare.com/dns/proxy-status/limitations/, read 2026-08-24)
contains no `vercel-dns` entry, so the record can be orange-clouded. Cloudflare *in front
of Convex* is a real O2O case, and Convex says so itself (§3.5).

### 2.6 Does Cloudflare stop Vercel from billing?

Yes, for anything it blocks — and this is the strongest cost argument for the
arrangement. Cloudflare's own cache-status reference
(https://developers.cloudflare.com/cache/concepts/cache-responses/, read 2026-08-24)
describes what happens on a WAF block:

> A WAF custom rule was triggered to block a request. **The response will come from the
> Cloudflare global network before it hits cache.**

No origin fetch means no Vercel Edge Request, no Fast Data Transfer, no invocation. But
three things blunt it:

1. **Vercel already gives the same guarantee for free.** WAF deny, challenge, rate
   limit, IP block, persistent actions, DDoS mitigation and Attack Mode all "does not
   incur CDN Requests or Fast Data Transfer" (§1.3). Blocked traffic was already free.
2. **What Cloudflare passes through, Vercel bills** — Vercel states it in the negative:
   "If the reverse proxy undergoes a malicious attack, this traffic can be forwarded to
   the Vercel project and cause usage spikes" (§2.1).
3. **Cloudflare Free adds no invoice risk of its own** (§2.4). That is a real point in
   its favour: the downside is operational, not financial.

The genuine, unique win is **caching HTML at Cloudflare's edge**. A Cache Rule marking
the board page "Eligible for cache" turns a Vercel Edge Request into a Cloudflare cache
hit that Vercel never sees — and Cloudflare collapses simultaneous misses:

> Only the first request is forwarded to the origin to fetch the asset. The remaining
> requests wait for the first request to complete […] preventing the origin from
> receiving excessive traffic.

⚠️ **The docs do not say**, in those words, that a Cloudflare cache hit is free. It is
implied by the absence of any request or bandwidth meter on a domain plan, not stated.

### 2.7 Verdict on question 2

Judged on merit, with the registrar question already settled:

**Do not put Cloudflare in front of `200squares.com` itself.** For Vercel-served traffic,
Vercel's own firewall on Pro is strictly better than Cloudflare Free — 40 custom rules
against 5, 40 rate-limit rules against 1, windows of 10 s to 10 min and blocks of any
length against 10 s and 10 s, IP *and* JA4 keys against IP only, real analytics against
none — and every block is free on both sides. Putting Cloudflare in front *subtracts*:
Bot Protection stops working (§1.4), the firewall loses visibility, the app loses the
visitor's IP and geolocation entirely, the two caches fight after every deploy,
certificate renewal needs hand-holding, a "Proxy Detected" banner appears, and Vercel
support may ask for the proxy to come off before they help. The one thing gained —
edge-cached HTML — is available more cheaply by making the board page cacheable on
Vercel's own CDN (§5).

**Cloudflare's place in this stack is in front of Convex, not in front of Vercel** —
that is the surface with no other defence, and Convex documents the arrangement itself
(§3.5). It needs a Convex Pro plan, and §6.0 shows what that costs.

⚠️ **And even there the win is smaller than it looks.** Cloudflare supports proxied
websockets on every plan (https://developers.cloudflare.com/network/websockets/, read
2026-08-24) — but read the WAF row of its own compatibility table:

> The initial HTTP 101 request is subject to WAF managed rules, custom rules, rate
> limiting rules, and other WAF features like any other WebSockets connection.
> **However, once a connection has been established, the WAF does not perform any
> further inspections.**

So a Cloudflare zone in front of the Convex websocket can rate-limit and challenge
**connection setup**, and nothing else. One connection sending a million mutations is
invisible to it. That single sentence is the reason §6 does not treat the custom domain
as a solution to the click-flood problem — only to the connection-flood problem.

---

## 3. The hole this stack has — Convex, and the websocket nobody guards

The ticket's instinct is right and Convex's own documentation confirms it in writing.
This section is the most important one in the note.

### 3.1 Convex says so itself

Convex has a page called **Abuse protection**
(https://docs.convex.dev/production/abuse-protection, read 2026-08-24). Verbatim:

> Protecting a Convex deployment from abuse — denial-of-service (DDoS) floods,
> scraping, credential stuffing, and other malicious or expensive traffic — is partly
> handled for you and partly up to you.

> Convex serves deployments through Cloudflare. This applies to your default
> `*.convex.cloud` and `*.convex.site` domains and to custom domains alike — a custom
> domain is not required to get this baseline. Because traffic passes through
> Cloudflare's network, it benefits from Cloudflare's network-layer (L3/L4) DDoS
> mitigation: volumetric floods that try to saturate the connection before a request
> is ever processed.

> The network-layer baseline doesn't include **application-layer** protections — the
> tools you'd reach for against abuse like floods of expensive HTTP requests,
> scraping, or credential stuffing. **Convex doesn't build these in**, but you can add
> them by routing your domain through your own Cloudflare zone or Vercel project.

The things you must bring yourself, verbatim from the same page:

> - Custom WAF and firewall rules — blocking by country, ASN, IP, path, header, or
>   request shape.
> - Per-route or per-IP rate limiting.
> - Bot management and challenge pages.
> - Caching, analytics, and log export for traffic to your domain.

So: **L3/L4 is free and automatic. L7 — the layer this site will actually be attacked
at — is entirely the dev's problem.** There is no WAF, no IP block list, no bot filter
and no challenge page inside Convex. On IP addresses the networking page is blunt
(https://docs.convex.dev/production/networking, read 2026-08-24): those published IPs
are egress only, "shared across all Convex deployments in a region, not just yours. Do
not rely on source IP alone to authenticate or authorize incoming requests."

### 3.2 What is billed, and the one that will actually get you

Convex meters nine things. Prices are US-region; "EU region pricing is 1.3x"
(https://www.convex.dev/pricing, read 2026-08-24, and
https://docs.convex.dev/production/state/limits, read 2026-08-24 — the two agree on
every number).

| Resource | Free (hard cap) / Starter (included) | Professional |
| --- | --- | --- |
| Function calls | 1,000,000/month — Starter $2.20 per extra 1M | 25M included, $2 per extra 1M |
| Query/mutation compute | Free | Free |
| Action compute | 20 GB-hours — $0.33/GB-hr extra | 250 GB-hrs, $0.30/GB-hr |
| Database storage | 0.5 GB — $0.22/GB/month | 50 GB, $0.20/GB |
| Database I/O | 1 GB/month — $0.22/GB | 50 GB, $0.20/GB |
| File storage | 1 GB — $0.033/GB/month | 100 GB, $0.03/GB |
| Data egress | 1 GB/month — $0.132/GB | 50 GB, $0.12/GB |
| Search storage | 0.5 GB — $0.55/GB/month | 1 GB, $0.50/GB |
| Search queries | 3,000 query-GBs — $0.11/1,000 | 50,000, $0.10/1,000 |

Plan prices: **Free & Starter $0/month and pay as you go**; **Professional $25 per
developer/month**; Business & Enterprise "$2,500 monthly minimum"
(https://www.convex.dev/pricing, read 2026-08-24).

⚠️ **Look at what a "function call" is.** This is the sentence that decides the whole
threat model (https://docs.convex.dev/production/state/limits, read 2026-08-24):

> Explicit client calls, scheduled executions, **subscription updates**, and file
> accesses count as function calls.

The log-stream reference makes it concrete
(https://docs.convex.dev/production/integrations/log-streams/, read 2026-08-24) — every
one of these is a billed run:

> - `"initialSubscription"`: the first run of a query a client subscribed to over the
>   WebSocket sync protocol.
> - `"dataChange"`: a rerun of a query whose subscription was invalidated by a write.
> - `"identityChange"`: a rerun of a query caused by the client's auth identity
>   changing.
> - `"webSocket"`: a mutation or action called by a client over the WebSocket sync
>   protocol.

⚠️ **The real attack on 200squares is not the write. It is the fan-out.** The board is
a live view. If every visitor subscribes to a board query, then one click-write
invalidates every subscriber and reruns their query — **N connected clients × M writes
= N × M billed function calls.** An attacker does not need a botnet for this; they need
one loop calling the click mutation while a hundred honest people have the board open.
Nothing in the Convex docs caps this.

The one relief, and note its exact wording
(https://docs.convex.dev/realtime, read 2026-08-24):

> Convex automatically caches the result of your query functions so that future calls
> just read from the cache. The cache is updated if the data ever changes. **You don't
> get charged for database bandwidth for cached reads.**

*Database bandwidth* is exempted for a cache hit. It does not say **function calls**
are exempted. So the cache protects the I/O meter, not the call meter.

### 3.3 Can a Convex deployment be made to stop instead of bill? Yes — three ways

This is the good news, and it is better than Vercel's answer.

**(a) The Free plan simply cannot bill you.** Verbatim
(https://docs.convex.dev/production/state/limits, read 2026-08-24):

> Free and Starter share the same S16 provisioned performance tier. **Free has hard
> resource caps**, while Starter can exceed its included resource amounts with
> usage-based pricing.

> After these limits are hit on the Free plan, new mutations that attempt to commit
> more insertions or updates may fail.

Every Free row reads "N per month **total**", with no per-unit overage rate anywhere.
An attack on a Free deployment produces failures, not an invoice. That is precisely the
dev's rule, enforced by the platform, for $0. ⚠️ Whether a credit card is required on
the Free plan — *the docs do not say*.

**(b) Usage limits — per deployment, per resource, hard disable.** This is Convex's
best feature for this ticket and it has no Vercel equivalent
(https://docs.convex.dev/production/usage-limits, read 2026-08-24). Verbatim:

> Usage limits allow you to cap how much usage a single deployment can consume per day
> or calendar month. Usage limits are a guardrail against runaway workloads: a
> scheduled function stuck in a loop, an action hammering a third-party API, or
> unexpected traffic spike that would otherwise show up on your bill.

> Each metric can have two thresholds, each enforced over a daily or monthly window:
> - The **warning threshold** is a soft limit: when it is exceeded, an event is
>   recorded on the deployment's history page.
> - The **disable threshold** is a hard limit: when it is exceeded, **the deployment is
>   disabled for the rest of the window**, and new function calls return an error
>   explaining that the deployment exceeded a usage limit.

> A deployment disabled by a usage limit is re-enabled automatically when the window
> rolls over, or as soon as you raise, disable, or delete the limit that was triggered.

> Limits cover calendar windows in UTC:
> - Daily limits reset at midnight UTC.
> - Monthly limits reset on the first of the month, at midnight UTC.

Metrics available: Function calls ("Query, mutation, action, HTTP action, and file
storage calls"), Query/Mutation compute (dedicated only), Action compute (Convex
runtime), Action compute (Node.js), Action compute (CPU) (Business/Enterprise),
Database I/O, Search queries, Data egress.

⚠️ **There is no usage-limit metric for database storage or file storage.** Only the
metered flow and compute metrics can be capped this way. Storage growth from an attack
— an attacker inserting millions of click rows — is *not* directly cappable, only
indirectly via the function-call and I/O limits.

Settable from the CLI (https://docs.convex.dev/cli/reference/deployment, read
2026-08-24):

> `npx convex deployment usage-limits set --metric functionCalls --window day --type disable --limit 1000000`

> `--type <type>` — `warning` only notifies; `disable` **pauses the deployment** when
> exceeded.

There is also a Deployment API (`create-usage-limit`, `update-usage-limit`,
`list-usage-limits`, `delete-usage-limit`;
https://docs.convex.dev/deployment-api/create-usage-limit, read 2026-08-24).
⚠️ Two silences: whether usage limits are available on the Free plan
— *the docs do not say*; and what the enforcement delay is between crossing a threshold
and the deployment being disabled — *the docs do not say*.

**(c) Spending limits — team-wide, in dollars, requires a subscription.** Verbatim
(https://docs.convex.dev/dashboard/teams/teams, read 2026-08-24):

> When you have an active Convex subscription, you can set the spending limits for your
> team on the billing page:
> - The **warning threshold** is only a soft limit: if it is exceeded, the team will be
>   notified by email, but no other action will be taken.
> - The **disable threshold** is a hard limit: if it is exceeded, **all projects in the
>   team will be disabled**. This will cause errors to be thrown when attempting to run
>   functions in your projects. You can re-enable projects by increasing or removing
>   the limit.

> Spending limits only apply to the resources used by your team's projects beyond the
> amounts included in your plan. The seat fees … are not counted towards the limits.
> For instance, if you send the spending limit to $0/month, you will be billed for the
> seat fees only and the projects will be disabled if you exceed the built-in resources
> included in your plan.

**A disable threshold of $0 is therefore a genuine hard cap** on a paid plan: seat fee
only, everything else stops. ⚠️ It is gated on "an active Convex subscription", so it
is *not available on Free* — which is fine, because Free cannot bill anyway.

**(d) The big red button.** (https://docs.convex.dev/production/pause-deployment, read
2026-08-24):

> Pausing a deployment is a way to "turn off" a deployment without deleting any data.
> This can be useful if you have an action that is blowing through a third-party API
> quota and you just need a big red stop button.

> When a deployment is paused:
> - New function calls will return an error.
> - Scheduled jobs will queue and run when the deployment is resumed.
> - Cron jobs will be skipped.

And the sentence that answers "does pausing stop the bill"
(https://docs.convex.dev/deployment-api/pause-deployment, read 2026-08-24):

> **This means that no function calls or bandwidth usage will be charged while the
> deployment is paused, but storage costs will still apply.**

`POST /pause_deployment` and `POST /unpause_deployment` exist, so this can be wired to
an alert. ⚠️ For 200squares, pausing also stops the **00:00 UTC auction cron** — "Cron
jobs will be skipped", not queued. Pausing across midnight means the auction does not
close. That is a product failure, not just an outage.

### 3.4 Rate limiting inside Convex — real, but it does not save the meter

There is an official Rate Limiter component
(https://www.convex.dev/components/rate-limiter and
https://github.com/get-convex/rate-limiter, read 2026-08-24). Its own README sets
expectations, verbatim:

> Application-layer rate limiting happens in your app's code where you are handling
> authentication, authorization, and other business logic. It allows you to define
> nuanced rules, and enforce policies more fairly. **It is not the first line of
> defense for a sophisticated DDOS attack** (which thankfully are extremely rare), but
> will serve most real-world use cases.

Two algorithms, both per-key:

> The **`token bucket`** approach provides guarantees for overall consumption via the
> `rate` per `period` at which tokens are added, while also allowing unused tokens to
> accumulate (like "rollover" minutes) up to some `capacity` value.
> The **`fixed window`** approach differs in that the tokens are granted all at once,
> every `period` milliseconds.

> Use `key` to use a rate limit specific to some user / team / session ID / etc.

Useful properties, verbatim: "Efficient storage and compute: storage is not
proportional to requests"; "Transactional evaluation: all rate limit changes will roll
back if your mutation fails"; "**Fails closed, not open**: avoid cascading failure when
traffic overwhelms your rate limits". Under contention you shard: "take the max queries
per second you expect and divide by two" for the shard count.

⚠️ **But it runs inside the function that has already been counted.** By the time
`rateLimiter.limit()` executes, the client call has been made, the function has been
invoked, and the function call is on the meter. The component caps *writes*,
*downstream work* and *third-party API spend*. It does not cap function-call billing.
Whether the component's own reads and writes are billed as separate function calls —
*the docs do not say*; the definition of a function call quoted in §3.2 does not list
component calls, and the best-practices page only warns about explicit nested
`ctx.runQuery` / `ctx.runMutation` calls
(https://docs.convex.dev/understanding/best-practices, read 2026-08-24).

### 3.5 Can the websocket be put behind Cloudflare? Yes — and only Cloudflare

This is the direct answer to the ticket's "neither protects the expensive part". From
the abuse-protection page (read 2026-08-24), verbatim table:

> | You want… | Use |
> | Network-layer protection only | Nothing — the built-in baseline covers it |
> | Control over your domain's reputation | A custom domain |
> | Your own WAF / rate limits on the realtime API (`*.convex.cloud`) | A custom domain through your own Cloudflare zone |
> | Your own WAF / rate limits on HTTP actions (`*.convex.site`) | Your own Cloudflare zone, or a Vercel project |

> **Custom domains require a Convex Pro plan.**

> If the domain is managed in your own Cloudflare account, you can route custom-domain
> traffic through your zone first, so your WAF rules, rate limiting, and bot management
> apply before traffic reaches Convex. **This is the only option that works for the
> realtime Convex API (`*.convex.cloud`)**, and it works for HTTP actions too.

⚠️ And Vercel explicitly cannot do it:

> This works for HTTP actions (`*.convex.site`) **only**. Vercel rewrites proxy HTTP
> requests, not WebSocket connections, and the realtime Convex API (queries, mutations,
> and actions over `*.convex.cloud`) uses WebSockets — so it cannot be served through a
> Vercel rewrite. Vercel is not a general custom-domain protection strategy for Convex;
> it's an option for the HTTP-actions surface specifically.

⚠️ Convex itself calls the arrangement advanced and warns about certificates:

> Treat this as an **advanced setup**. Custom domains already sit behind Cloudflare
> (`convex.domains` is a Cloudflare zone), so fronting your domain with your own zone
> usually doesn't change the network-layer story — its practical value is the
> application-layer control listed above. You are also running "Cloudflare in front of
> Cloudflare" (Cloudflare calls this orange-to-orange), which adds moving parts to
> certificate issuance and renewal.

> **caution** — Convex issues the TLS certificate for your custom domain using
> HTTP-based validation. Before you rely on this in production, confirm that the domain
> reaches a verified state in your Convex Deployment Settings, and watch that the
> certificate continues to renew successfully over time.

Setup, verbatim: add the custom domain in Convex Deployment Settings; in the Cloudflare
zone create "A `CNAME` from your domain (e.g. `api.example.com`) to `convex.domains`,
with the Cloudflare proxy **enabled** (the orange cloud)" plus "The `TXT` record at
`_convex_domains.<your domain>`"; then "Configure WAF, rate limiting, and bot management
rules on your zone." The client is pointed at it by overriding `CONVEX_CLOUD_URL`
(https://docs.convex.dev/production/custom-domains, read 2026-08-24).

⚠️⚠️ **The bypass that undoes all of it.** Putting the websocket behind your own zone
changes what *your frontend* connects to. It does not, on the evidence of the docs,
stop the original `https://<name>.convex.cloud` from answering. An attacker who reads
the deployment name out of the client bundle — and it is in the client bundle, because
the browser has to connect — can talk to the raw endpoint and skip the zone entirely.
The abuse-protection page mentions turning the defaults off only in passing ("If you
later move your deployment exclusively to a custom domain and stop serving the default
`*.convex.cloud` / `*.convex.site` endpoints…"), and **the docs do not say** how to stop
serving them, or whether that is self-serve. Until that is answered, treat the custom
domain as a *filter for honest traffic*, not as a wall.

### 3.6 The capacity ceiling — what "offline" looks like

Free and Starter run deployment class **S16**; Professional runs **S256**
(https://docs.convex.dev/production/state/limits, read 2026-08-24):

| | S16 (Free/Starter) | S256 (Professional) |
| --- | --- | --- |
| Concurrent sessions (websockets) | **1,000** | 10,000 |
| Concurrent queries | **16** | 256 |
| Concurrent mutations | **16** | 256 |
| Mutation write throughput | **4 MiB** | 8 MiB |
| Convex-runtime actions / HTTP actions | 64 | 512 |
| Scheduled jobs | 8 | 256 |
| Query cache | 1 GB shared | 1 GB shared |

Excess is queued, not rejected: "Functions may become temporarily queued when
concurrency limits have been reached"
(https://docs.convex.dev/production/integrations/log-streams/, read 2026-08-24). ⚠️ On
S16 the site becomes unusable for everybody at **1,000 concurrent websockets** — which
is also, usefully, a cheap natural cap on fan-out. Whether an idle open websocket costs
anything by itself — *the docs do not say*; concurrent sessions appears in no pricing
table.

Per-transaction hard limits, all from the same page: query/mutation execution 1 second
of user code; 16 MiB read and 16 MiB written per transaction; 32,000 documents scanned;
16,000 documents written; 4,096 index ranges read; 16 MiB function argument and return
size; document size 1 MiB; HTTP action response 20 MiB, and "**There is no specific
limit on request size**". Action execution time is 30 minutes in the Convex runtime and
10 minutes in Node.

⚠️ Also worth knowing before the bill arrives: "Each index is priced as another copy of
the table" (database storage note, same page).

### 3.7 Three things Convex's docs do not answer

Stated in the ticket's own terms, because guessing here would be worse than silence:

- **Is a function call billed when it throws?** *The docs do not say.* No page states
  that failed executions are excluded from the meter. The log-stream schema records a
  `status` of `"success"` or `"failure"` for every `function_execution` event, and the
  usage docs describe those events as carrying the fields that drive billing — which
  suggests failures *are* counted, but that is inference, not documentation.
- **Is a call billed when the rate limiter rejects it, or when auth fails?** *The docs
  do not say.* Structurally it must be, because both checks run inside the function.
  Convex is explicit that authorization is your code's job
  (https://docs.convex.dev/production/state, read 2026-08-24): "For now, you can
  implement manual authorization checks within your queries and mutations."
- **Is there any per-second mutation rate cap?** *The docs do not say.* The only
  published controls are the concurrency numbers in §3.6.

---

## 4. The two unauthenticated writes

Two things let a stranger write: **placing a click**
([ticket 10](../issues/10-clicks-for-real.md)) and **starting a checkout**, which
reserves a rectangle for 15 minutes ([ticket 06](../issues/06-buying-for-real.md)).
They fail in different ways and they need different tools.

### 4.1 They are not the same attack

- **The click is a cost attack.** Each call is a function call, and each call
  invalidates every subscriber's board query (§3.2), so the cost is multiplied by the
  number of people watching. It also makes the public total on `/how-it-works` a lie,
  which ticket 10 already flags.
- **The reservation is an inventory attack.** Cost barely matters; a script that
  reserves rectangles in a loop can hold the entire board as *taken* for 15 minutes at
  a time and never pay. That freezes the product without spending a cent and without
  producing much of a bill. The dev's rule ("offline is acceptable") does not cover
  this: the site is *up*, it just cannot sell anything.

### 4.2 The tools that exist, in the order the request meets them

**(1) Cloudflare zone rules, if — and only if — the surface is behind a hostname in
the zone.** For a Vercel-served POST that means `200squares.com` proxied. For a Convex
mutation over the websocket it means a Convex Pro custom domain CNAME'd to
`convex.domains` with the orange cloud on (§3.5). Blocked at Cloudflare, the request
costs nothing anywhere. This is the only layer that sits in front of the websocket.

**(2) Vercel WAF rate limiting and Attack Mode**, for anything that arrives as an HTTP
request to `200squares.com`. Fixed window, 10 s to 10 min, keyed on IP or JA4 digest, 1
rule on Hobby / 40 on Pro, with an optional persistent action that promotes the source
into a free pre-firewall IP block (§1.4). Denied traffic incurs no CDN Requests and no
Fast Data Transfer. ⚠️ Useless for the websocket, which never touches Vercel.

**(3) Convex's Rate Limiter component**, inside the mutation. Real, transactional,
fails closed — and already too late to save the function call (§3.4).

**(4) Convex usage limits**, `--type disable`, daily window. The last line of defence:
the deployment goes dark for the rest of the UTC day and comes back by itself (§3.3b).

**(5) Cloudflare Turnstile**, which is free, needs no zone, and works on the websocket
because the token is verified inside the function rather than at an edge (§4.6).

**(6) Stripe's own rate limits**, for the checkout path only
(https://docs.stripe.com/rate-limits, read 2026-08-24):

> - *Live mode*: 100 requests per second
> - Individual API endpoints (unless otherwise noted): 25 requests per second

> Requests that get rate-limited return a `429 Too Many Requests` HTTP status code, and
> include a `Stripe-Rate-Limited-Reason` header

⚠️ Note what that means under attack: a checkout flood does not bill the dev at Stripe
(there is no per-API-call charge, and "Write API requests have no allocation limit"),
but it *does* burn the account's 25/s Checkout Session budget, so honest buyers get
`429`s. Another way to take the shop offline without an invoice.

### 4.3 The architectural move that buys the most

**Put the abusable writes behind Vercel, and keep the websocket for reading.**

The Convex websocket is the one surface with no free block. Everything routed through
`200squares.com` instead gets three layers of *free* mitigation — Cloudflare's, Vercel
DDoS, and Vercel WAF deny/challenge/rate-limit, all of which cost nothing when they
block (§1.3). So:

- **Starting a checkout should be a POST to a Next.js route handler**, not a mutation
  called from the browser. Behind it, the route creates the Stripe Checkout Session
  and only then writes the reservation into Convex. A blocked POST costs zero; a
  blocked mutation-over-websocket costs a function call.
- **Recording a click can go the same way.** Ticket 10 already asks whether a click is
  a Convex mutation or "a redirect through a route that counts and then forwards". On
  cost grounds the redirect wins outright: it is an HTTP request, so Vercel's WAF can
  rate-limit and deny it for free, and the mutation only runs for requests that
  survived the firewall.

⚠️ The trade: each surviving request now costs **both** a Vercel function invocation
($0.60 per 1M, plus Active CPU and Fast Origin Transfer) **and** a Convex function
call. That is worse per honest request and far better per attack, because the attack
requests never reach either.

### 4.4 The privacy trap ticket 10 flags, and the way out

`/privacy` promises that nothing about the visitor is kept — "no name, no identifier,
no address, no time". An IP-keyed or cookie-keyed rate limit in Convex means the site's
own database holds an identifier, however briefly. That is the dev's promise to break,
not this note's.

There are two escapes, and both are documented:

1. **Rate-limit at the edge, not in the database.** Vercel's WAF and Cloudflare's rate
   limiting key on IP or JA4 inside the platform's own infrastructure. The site never
   stores it; the dev never queries it. Whether that still counts as "kept" is a
   judgement for ticket 10 and for `/privacy`, but it is a materially different claim
   from writing an IP into a Convex table.
2. **Use a global, unkeyed rate limit in Convex.** The Rate Limiter component supports
   limits with no `key` at all — a single site-wide bucket. "N clicks per second across
   the whole site, then everyone is refused" stores nothing about anybody and needs no
   identifier. Under attack the honest visitor's click is dropped along with the
   attacker's: the counter under-reports rather than over-reports, and the bill stays
   flat. Given that ticket 10 already says the count is deliberately rough — the same
   person clicking twice counts twice — a global cap fits the product's own definition
   of the number better than an IP cap does.

### 4.5 Bounding the reservation specifically

Cost controls do not fix an inventory attack. What does:

- **Do not reserve until a Stripe Checkout Session exists.** The session is created
  server-side; that gives the reservation an identity to be idempotent on, and it puts
  Stripe's own 25/s endpoint limit in the attacker's path.
- **Cap the total board area under reservation at once**, site-wide, not per visitor —
  the same unkeyed trick as §4.4. If more than, say, a fifth of the free board is
  already held, refuse new holds. An attacker cannot then freeze the board, only a slice
  of it.
- **Release on abandonment, not only on expiry.** 15 minutes is the ceiling, not the
  normal case: a session that Stripe reports as expired or cancelled should free the
  squares immediately.
- **Make the hold cheap to store.** One document per reservation, indexed, deleted on
  release — remembering that "Each index is priced as another copy of the table"
  (§3.6) and that database storage *cannot* be capped by a usage limit (§3.3b).

### 4.6 Turnstile — the one edge control that reaches the websocket for $0

Every other Cloudflare control needs the traffic to pass through a Cloudflare zone, and
the Convex websocket does not (§3.5). Turnstile is the exception, and Cloudflare says so
in as many words (https://developers.cloudflare.com/turnstile/, read 2026-08-24):

> Turnstile can be embedded into any website **without sending traffic through
> Cloudflare** and works without showing visitors a CAPTCHA.

> In contrast to our Challenge page offerings, Turnstile allows you to run challenges
> anywhere on your site in a less-intrusive way **without requiring the use of
> Cloudflare's CDN**.

It is free, with "Up to 20 widgets" per account and **unlimited challenges**
(https://developers.cloudflare.com/turnstile/plans/, read 2026-08-24). So:

- The board page renders a Turnstile widget (invisible / managed mode).
- The token is passed with the first click or the first checkout start.
- The Convex mutation — or the Vercel route in front of it — verifies the token
  server-side against Cloudflare's siteverify endpoint before doing any work.

⚠️ It does not stop the request from arriving, so the Convex function call is still
billed (§3.4 — the same "too late" problem as the rate limiter). What it buys is that a
scripted attacker must solve a challenge per token rather than replay a `fetch` in a
loop, and it costs nothing and needs no plan change on any vendor. ⚠️ It also stores
nothing about the visitor in the site's own database, so unlike an IP-keyed limit it
does not touch the `/privacy` promise — though the widget does load third-party script
from Cloudflare, which is its own disclosure question for `/privacy` and for the CSP.

---

## 5. The cheapest defence — how much of the board never touches a function

This is the highest-leverage section for a $25 ceiling, and it is almost free to
implement.

### 5.1 What "static" buys, and what it does not

Static files on Vercel are cached automatically, forever, per deployment
(https://vercel.com/docs/caching/cdn-cache, read 2026-08-24):

> Static files are **automatically cached on Vercel's global network** for the lifetime
> of the deployment after the first request.
> - If a static file is unchanged, the cached value can persist across deployments due
>   to the hash used in the filename

> Vercel **doesn't allow bypassing the cache for static files** by design.

That last sentence matters: an attacker cannot cache-bust a hashed static asset.

⚠️ **But static is not free.** From
https://vercel.com/docs/manage-cdn-usage (read 2026-08-24):

> When visiting your site, requests are made to a Vercel CDN region. Traffic is routed
> to the nearest region to the visitor. **Static assets and functions all incur CDN
> Requests.**

So going static removes **Function Invocations, Active CPU, Provisioned Memory and Fast
Origin Transfer** from the worst case, and leaves **Edge Requests and Fast Data
Transfer**. On Pro that is 10,000,000 requests and 1 TB included before a cent, and
both are free when the request is denied at the firewall (§1.3). That is a very
different shape of worst case: a flood that used to cost compute now costs only from
the allocation, and an attack that trips a WAF rule costs nothing at all.

To be cacheable at all, a response must meet these criteria (same page, verbatim):

> - Request uses `GET` or `HEAD` method.
> - Request doesn't contain `Range` header.
> - Request doesn't contain `Authorization` header.
> - Response uses `200`, `404`, `410`, `301`, `302`, `307` or `308` status code.
> - Response doesn't exceed `10MB` in content length.
> - Response doesn't contain the `set-cookie` header.
> - Response doesn't contain the `private`, `no-cache` or `no-store` directives in the
>   `Cache-Control` header.
> - Response doesn't contain `Vary: *` header

⚠️ **`set-cookie` disables caching.** If Better Auth sets a session cookie on the board
page, the board page stops being cacheable for everyone. Keep the board anonymous and
cookie-free; put anything that needs a session on its own route.

### 5.2 The move that kills the fan-out attack

§3.2 showed that the expensive failure mode is the live subscription: every write
reruns every subscriber's query, and every rerun is a billed function call. The fix is
architectural and it is the single best value in this whole note:

**Anonymous visitors get a cached page and open no websocket at all.**

- Render the board as a cached document — a static build plus revalidation, or a
  function response carrying `Cache-Control: public, s-maxage=…, stale-while-revalidate=…`
  (§5.1). Revalidate it when a purchase completes, from the Stripe webhook, not on a
  timer.
- Open the Convex websocket only where live really matters: the buy panel during a
  selection, the auction page in the run-up to 00:00 UTC, and a signed-in owner's own
  pages.
- With no anonymous subscribers, a click write invalidates nobody. `N × M` collapses to
  `M`. The 1,000 concurrent-session ceiling on S16 (§3.6) also stops being a limit that
  ordinary traffic can reach.

A `Vercel-CDN-Cache-Control` header can hold the Vercel cache longer than the browser
cache, which keeps the board fresh-looking without more origin work:

> - `CDN-Cache-Control`, which allows you to control the Vercel CDN Cache or other CDN
>   cache *separately* from the browser's cache.
> - `Vercel-CDN-Cache-Control`, which allows you to specifically control Vercel's Cache.
>   Neither other CDNs nor the browser will be affected by this header

Note the middle one is the header Cloudflare would read, which makes the two-cache
problem of §2.2 controllable rather than accidental.

### 5.3 ⚠️ The images are the real bill on this page

The board is 200 squares of other people's artwork. Image Optimization is metered
(https://vercel.com/docs/image-optimization/limits-and-pricing, read 2026-08-24):

| Image usage | Hobby included | On-demand |
| --- | --- | --- |
| Image transformations | 5K/month | $0.05 – $0.0812 per 1K |
| Image cache reads | 300K/month | $0.40 – $0.64 per 1M |
| Image cache writes | 100K/month | $4.00 – $6.40 per 1M |

> Image transformations are billed for every cache MISS and STALE. The cache key is
> based on several inputs

> Image cache writes: The total amount of Write Units used to store the cached image in
> the global cache, measured in 8KB units. It is billed for every cache MISS and STALE.

At **$4.00 per 1M cache writes**, forcing misses is the most expensive thing an
anonymous visitor can do to this site through Vercel. The defence is to make the number
of possible cache keys small and fixed. Next.js 16 already pushes this, from the
in-repo docs at
`node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` (read
2026-08-24):

> `qualities` allows you to specify a list of image quality values.
> **Good to know**: This field is required starting with Next.js 16 because
> unrestricted access could allow malicious actors to optimize more qualities than you
> intended.

> The example above will ensure the `src` property of `next/image` must start with
> `/assets/images/` and must not have a query string. **Omitting the `search` property
> allows all search parameters which could allow malicious actors to optimize URLs you
> did not intend.** Try using a specific value like `search: '?v=2'` to ensure an exact
> match.

Concretely, for this project:

- Set `images.qualities: [75]` (the Next 16 default) and never widen it.
- Trim `images.deviceSizes` from the default eight widths
  (`[640, 750, 828, 1080, 1200, 1920, 2048, 3840]`) to the two or three the board
  actually renders. Every removed width removes a cache key per artwork.
- Set `remotePatterns` (or `localPatterns`) with an explicit `search` value, so the
  optimizer refuses unknown query strings with a `400` instead of transforming them.
- Best of all, **normalise artwork at upload time** (ticket 09) and serve it with
  `unoptimized`, or straight from storage. A block's artwork has one known size on the
  board. There is nothing for a per-request optimizer to decide, so paying per
  transformation buys nothing.

### 5.4 The worst case, with and without this

Rough arithmetic, all rates from §1.2, all included allowances Pro:

- **Board page fully cached, images pre-sized, no anonymous websocket.** An attack
  costs Edge Requests and Fast Data Transfer only. 10,000,000 included requests, then
  $2.00 per 1M; 1 TB included transfer, then $0.15/GB. Anything the WAF denies costs
  zero. Convex sees nothing at all. The $5 of headroom is only reached after the
  attacker has pushed 10 M requests *past* the firewall.
- **Board page server-rendered per request, with a live subscription per visitor.**
  The same flood costs Function Invocations, Active CPU, Provisioned Memory, Fast
  Origin Transfer *and* Convex function calls on both the direct calls and every
  subscription rerun — and the Convex half is not behind any firewall at all (§3.1).

The difference between those two is worth far more than any firewall rule in this note.

---

## 6. The recommendation — "Static front, capped back"

A named configuration, the values to set, and then an honest list of what is still
open.

### 6.0 ⚠️ The trade-off the ceiling forces

Two facts collide:

- **Vercel Pro is mandatory**, because the site takes money and Hobby "restricted to
  non-commercial personal use only" (§1.1). That is **$20/month, fixed**.
- **The only thing that can put a firewall in front of the Convex websocket is a Convex
  custom domain**, and "Custom domains require a Convex Pro plan" (§3.5). Convex
  Professional is **$25 per developer/month**.

$20 + $25 = **$45**. At a $25 ceiling the dev can have one or the other, and Vercel Pro
is not optional. **So at $25 the websocket cannot be protected at all.** That is not a
configuration choice; it is arithmetic. The honest configuration at $25 is therefore
*Convex on Free, where an attack breaks the site instead of billing it*, which does
satisfy the dev's rule — just by failing rather than by defending.

| | $25 ceiling | $50 ceiling | $100 ceiling |
| --- | --- | --- | --- |
| Vercel | Pro, $20 | Pro, $20 | Pro, $20 |
| Vercel spend amount | $5 | $5 | $20 |
| Convex | **Free, $0** | **Professional, $25** | **Professional, $25** |
| Convex spending limit | n/a (Free cannot bill) | disable at **$0** | disable at **$50** |
| Cloudflare | Free, zone DNS-only | Free, proxying the Convex custom domain | same |
| Websocket protected? | **No** | **Connection setup only** | Connection setup only |
| Worst-case monthly total | $25 | $50 | $100 |

The step from $25 to $50 is the one that buys protection at all. ⚠️ Even then it is
partial: Cloudflare's WAF inspects only the websocket's HTTP 101 upgrade and "once a
connection has been established, the WAF does not perform any further inspections"
(§2.7). A $50 ceiling buys a limit on how many sockets an attacker may open — not on
what they send down one. Everything between $50 and $100 only buys headroom.

⚠️ Cloudflare Pro is **$25/month billed monthly** (§2.4), which is the whole ceiling by
itself, so Cloudflare stays on Free at every one of these three budgets.

### 6.1 Vercel — project `200-squares`, team `robs-projects-52973834`

1. **Upgrade the team to Pro** before the first live card payment. $20/month, one
   deploying seat, $20 usage credit, 1 TB Fast Data Transfer and 10 M Edge Requests
   included (§1.2). This is a terms requirement, not a performance one.
2. **Settings → Billing → Spend Management**: toggle **Enabled**; set the amount to
   **$5** ($5 at a $50 ceiling too, once Convex takes $25; **$20** at a $100 ceiling);
   enable **Pause production deployment** and confirm with the team name; leave web and
   email alerts on (they fire at 50%, 75%, 100%) and add **SMS at 100%**. ⚠️ Change the
   default: new customers are set to **$200** with notifications only (§1.5).
3. **Firewall → Bot Management**: set **Bot Protection** to **Challenge**; set **AI Bots
   Ruleset** to **Deny**. Both read as included on every plan (§1.4).
4. **Firewall → Rules → WAF Managed Rulesets**: leave **OWASP Core Ruleset off**. It is
   metered at $0.80 per 1 M inspected requests plus $0.20/GB of payload, so under a
   flood the inspector is itself a cost driver (§1.3).
5. **WAF custom rules**, in this order (Pro allows 40; Hobby would allow 3, which is
   another reason Pro is not negotiable):
   - **`stripe-webhook-bypass`** — path starts with the Stripe webhook route → **Bypass**.
     First in the list, so Attack Mode and Bot Protection can never block Stripe (§1.3).
   - **`checkout-start`** — `POST` to the checkout route → **Rate Limit**, fixed window
     **60 s**, limit **5**, keys **IP + JA4 Digest**, follow-up action **Deny**,
     persistent action **15 minutes**.
   - **`click-redirect`** — the click-through route → **Rate Limit**, fixed window
     **10 s**, limit **20**, key **IP**, follow-up **Deny**, persistent action
     **1 minute**.
   - **`method-allowlist`** — method not in `GET`, `HEAD`, `POST` → **Deny**.
   - **`junk-paths`** — path ends in `.env`, `.git`, `.bak` → **Deny**.
   Build each one with the **Log** action first and watch the live traffic before
   switching it to Deny (§1.4). ⚠️ Remember counters are per region, so treat every
   number above as roughly ten times looser than it reads.
6. **Attack Mode**: leave it **off**, and know the path — Firewall → Bot Management →
   Attack Mode → Enable. It is free on every plan, blocked traffic costs nothing, and
   it is safe to leave on for days (§1.3). This is the first thing to press.
7. **Never** use **Pause System Mitigations** — "You are responsible for all usage fees
   incurred when using this feature" (§1.3).
8. **The kill switch.** Keep a Vercel access token to hand and the pause call ready:
   `POST https://api.vercel.com/v1/projects/prj_2k5K3sd6UsJlvqdn381E0ILa2qLN/pause?teamId=team_hFIT9GiF1xvSQIYY29S7jvzO`
   (https://vercel.com/docs/projects/managing-projects, read 2026-08-24). Pausing means
   "you do not incur usage from metered resources on your production deployment";
   visitors get `503 DEPLOYMENT_PAUSED`. Resuming is manual, per project.
9. **`next.config.ts`**: `images.qualities: [75]`; trim `images.deviceSizes` to the two
   or three widths the board really uses; give `remotePatterns` / `localPatterns` an
   explicit `search` value so unknown query strings get a `400` instead of a paid
   transformation (§5.3).
10. **The board page must stay cacheable**: no `set-cookie`, `GET` only, under 10 MB,
    and revalidated from the Stripe webhook rather than on a short timer (§5.1–5.2).

### 6.2 Cloudflare — zone `200squares.com`

11. **`200squares.com` and `www` stay DNS-only (grey cloud)**, pointed at Vercel the way
    Vercel documents. Do not proxy the apex. Vercel's own firewall is strictly stronger
    than Cloudflare Free for this traffic, and proxying subtracts from it (§2.6).
12. **Turnstile now, at $0.** Create a Turnstile widget (Free allows 20 per account,
    with unlimited challenges) and require a verified token before the click write and
    before a checkout start. It needs no zone and no proxying, so it is the only
    Cloudflare control that reaches the Convex websocket at a $25 ceiling (§4.6).
    Declare `https://challenges.cloudflare.com` in the CSP, and add the widget to
    `/privacy` as a third-party script.
13. **Only when the budget reaches $50** and Convex Pro is bought, add the websocket
    hostname:
    - `api.200squares.com` **CNAME → `convex.domains`, proxied (orange cloud)**, plus the
      `TXT` record at `_convex_domains.api.200squares.com` (§3.5).
    - Override `CONVEX_CLOUD_URL` so the client connects there.
    - **One rate-limiting rule** — that is all Free allows. ⚠️ On Free the expression can
      only test **URI Path** and **Verified Bot**, not host (§2.4), so the rule cannot be
      scoped by hostname. That is survivable here precisely because the apex stays
      grey-clouded: the only proxied hostname in the zone is the Convex one, so a
      zone-wide rule effectively applies to it alone. Match the Convex sync path, period
      **10 s** (the only value on Free), threshold around **50 requests per IP**, action
      **Managed Challenge**, mitigation timeout **10 s**.
    - **Custom rules** (5 on Free, no regex): geoblock with `ip.src.country in {…}` if an
      attack is concentrated — country blocking via IP Access Rules is Enterprise-only
      (§2.4).
    - **Bot Fight Mode: leave it off.** It "may challenge API or mobile app traffic", it
      cannot be skipped by any WAF rule on Free, and it force-enables JavaScript
      Detections. A websocket client is exactly the traffic it is documented to break
      (§2.4).
    - **Under Attack mode** on the zone is the panic button for the backend — remembering
      it "may affect some actions on your domain, such as your API traffic".
    - ⚠️ Expect only a cap on **connection setup**. Cloudflare's WAF sees the HTTP 101
      upgrade and nothing after it (§2.7).
14. If the apex is *ever* proxied, four things are mandatory: SSL/TLS mode **Full
    (strict)** (Flexible causes `err_too_many_redirects`), never cache
    `/.well-known/vercel/*`, never block or redirect `/.well-known/acme-challenge/*`, and
    a CAA record permitting `letsencrypt.org` (§2.2, §2.5). Read `CF-Connecting-IP` in
    application code, because `x-forwarded-for` and every `x-vercel-ip-*` header will
    show Cloudflare (§2.5).

### 6.3 Convex — production deployment

18. **Stay on Free.** Free has hard caps and no overage rate; an attack produces failing
    mutations, not an invoice (§3.3a). Move to Professional only when the ceiling moves
    to $50 and the custom domain is worth buying.
19. **Set usage limits with `--type disable` and a daily window**, so an attack costs at
    most one UTC day and recovers by itself at midnight
    (https://docs.convex.dev/cli/reference/deployment, read 2026-08-24):

    ```
    npx convex deployment usage-limits set --metric functionCalls --window day --type warning --limit 20000
    npx convex deployment usage-limits set --metric functionCalls --window day --type disable --limit 50000
    npx convex deployment usage-limits set --metric databaseIO    --window day --type disable --limit 40000000
    npx convex deployment usage-limits set --metric dataEgress    --window day --type disable --limit 40000000
    ```

    The reasoning: the Free monthly caps are 1,000,000 function calls, 1 GB database I/O
    and 1 GB data egress, which is about 33,000 calls and 33 MB a day if spent evenly
    (§3.2). Setting the daily disable a little *above* the even rate leaves room for a
    busy honest day while still stopping a runaway inside 24 hours. ⚠️ Confirm the exact
    metric spellings against `npx convex deployment usage-limits list` — the docs give
    `functionCalls` explicitly and name the others in prose only.
    - **At $50 or $100**, on Professional: raise the daily function-call disable to
      **800,000** (25 M/month spread over 30 days), and set the team **spending limit
      disable threshold** to **$0** for a $50 ceiling, or **$50** for a $100 ceiling
      (§3.3c). A $0 disable threshold means "seat fee only, then everything stops".
20. **Add the Rate Limiter component** and use **global, unkeyed** limits on both
    unauthenticated writes — a site-wide clicks-per-second cap and a site-wide
    reservations-per-minute cap. Unkeyed limits store nothing about any visitor, which is
    the only version that survives the `/privacy` promise (§4.4). Shard them.
21. **Know the second kill switch**: `POST /pause_deployment`
    (https://docs.convex.dev/deployment-api/pause-deployment, read 2026-08-24) — "no
    function calls or bandwidth usage will be charged while the deployment is paused, but
    storage costs will still apply". ⚠️ Cron jobs are **skipped**, not queued, so pausing
    across 00:00 UTC means the auction does not close.
22. **Cap the reservation surface in product terms**, not only in cost terms: a
    site-wide cap on how much of the free board can be held at once, a Stripe Checkout
    Session created before any hold is written, and release on cancellation as well as
    on expiry (§4.5).

### 6.4 What is still unprotected — the honest list

1. **The browser-to-Convex websocket, at a $25 ceiling.** Nothing sits in front of it.
   Convex's own page says the application layer is not their job: "Convex doesn't build
   these in" (§3.1). Vercel cannot proxy it: "Vercel rewrites proxy HTTP requests, not
   WebSocket connections" (§3.5). Cloudflare only proxies hostnames with a proxied record
   in a zone it is authoritative for, and `*.convex.cloud` is not one — so Cloudflare
   Free gives it no WAF, no rate limiting, no Bot Fight Mode, no Under Attack mode and no
   analytics. The defences available at $25 are a Turnstile token (§4.6), an unkeyed
   in-function rate limit (§4.4), and the Convex usage limit — which is a fuse, not a
   filter: it does not stop the attack, it turns the site off for the rest of the day.
2. **Message volume on an established websocket, at any budget.** Even with the Convex
   custom domain behind the zone, Cloudflare inspects only the HTTP 101 upgrade —
   "once a connection has been established, the WAF does not perform any further
   inspections" (§2.7). One socket sending a million mutations is invisible to every
   edge control in this note. **There is no configuration at any price in this document
   that bounds it**; only Convex's own usage limit does, by switching the deployment off.
3. **The `*.convex.cloud` bypass, even at $50.** Buying the custom domain moves the
   *frontend* behind Cloudflare. It does not, on the documentation available, stop the
   original deployment URL from answering — and that URL is in the client bundle,
   because the browser has to connect to it. **The docs do not say** how to stop serving
   the default endpoints (§3.5). Until that is answered, the Cloudflare zone filters
   honest traffic and an attacker who reads one JavaScript file walks around it.
4. **The click write.** It is unauthenticated by design
   ([ticket 10](../issues/10-clicks-for-real.md)), and the fan-out makes it cost `N × M` function calls, not `M` (§3.2). Routing it
   through a Vercel redirect and removing anonymous subscriptions (§4.3, §5.2) reduces
   it enormously, but a call that survives the firewall is still a free write into a
   real database.
5. **The checkout reservation.** Even perfectly rate-limited, a distributed attacker
   with a few hundred IPs can hold a slice of the board hostage for 15 minutes at a
   time without paying anything. The site stays *up* and stops *selling*. The dev's rule
   does not cover that failure at all, and it is the one an actual competitor would use.
6. **The Stripe webhook path**, which must bypass Attack Mode and Bot Protection to work
   at all (§6.1 rule 1). It is signature-verified, but every forged POST still costs a
   Vercel function invocation before the signature is checked.
7. **Spend Management's delay.** Vercel checks "every few minutes" and says so twice:
   "projects can keep serving traffic and accruing usage for several minutes after you
   cross the spend amount" (§1.5). The $25 is a target, not a wall. Convex's usage
   limits have the same shape, and **the docs do not say** what their enforcement delay
   is (§3.3b).
8. **Per-region rate-limit counters at Vercel.** "traffic matching a given rate limit
   key in multiple regions can exceed the limit you configure for any single region"
   (§1.4). Every number in §6.1 is softer than it looks.
9. **Whatever Vercel's automatic mitigation does not classify as an attack.** "Usage
   will be incurred for requests that are not recognized as a DDoS event, which may
   include bot and crawler traffic" (§1.3). A slow, plausible, distributed crawl is
   billed as traffic.
10. **Three billing questions nobody has answered.** Whether a Convex function call is
   billed when it throws, when the rate limiter rejects it, or when auth fails — **the
   docs do not say** in all three cases (§3.7). Structurally the call has already
   happened, so assume it is billed until an invoice proves otherwise.
11. **Storage.** Convex usage limits cannot cap database or file storage (§3.3b), and an
    attack that inserts rows leaves them behind. Storage is also the one thing that keeps
    costing while a deployment is paused.
12. **Blindness and no help.** Cloudflare Free has no Firewall Analytics and no ticket
    support — "community forums and documentation only" (§2.4) — and no DDoS Alerts.
    During an incident the dev would be reading Vercel's firewall dashboard, and nobody
    is on the other end of a Cloudflare ticket. Cloudflare may also withdraw a Free
    service "in our sole discretion" (§2.4): offline, never billed, but offline.
13. **Everything downstream of this ticket.** Resend's quota if magic-link mail can be
    triggered by a stranger, and the auction's card holds at 00:00 UTC. Neither is a
    Vercel, Cloudflare or Convex bill, so neither is answered here.

