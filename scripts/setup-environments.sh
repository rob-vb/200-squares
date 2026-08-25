#!/usr/bin/env bash
# Ticket 14 — Environments, keys and the first real deploy.
# This walks you through the work that only you can do: accounts, dashboards, keys.
# It sets nothing behind your back. It stops at each step and waits for you.
#
# Read docs/environments.md first. It says where everything lives and why.
#
# Run it from the repo root:   bash scripts/setup-environments.sh
# You can stop at any time with Ctrl-C and start again. It keeps your place.
#
# ⚠ Editing a step's text: escape every dollar sign as \$ . `set -u` is on, so a bare
#   $20 in a double-quoted line is read as the positional parameter $2 and the script
#   exits on the spot. That bug cost step 11 two runs.
#
# ⚠ Do not pipe input into this script to test it. Every Enter marks a step done in
#   .setup-state, so a dry run silently claims work nobody did.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_FILE="$REPO_ROOT/.setup-state"
touch "$STATE_FILE"

B=$'\033[1m'; DIM=$'\033[2m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; R=$'\033[0m'

done_before() { grep -qxF "$1" "$STATE_FILE"; }
mark_done()   { grep -qxF "$1" "$STATE_FILE" || echo "$1" >> "$STATE_FILE"; }

step() {
  local key="$1"; shift
  local title="$1"; shift
  if done_before "$key"; then
    printf '%s✓%s %s %s(done — skipping)%s\n' "$GREEN" "$R" "$title" "$DIM" "$R"
    return 0
  fi
  printf '\n%s━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%s\n' "$DIM" "$R"
  printf '%s%s%s\n\n' "$B" "$title" "$R"
  printf '%s\n' "$@"
  printf '\n%sPress Enter when this is done, or type s to skip: %s' "$YELLOW" "$R"
  read -r answer
  if [ "$answer" = "s" ]; then
    printf '%sSkipped. Run the script again later to pick it up.%s\n' "$DIM" "$R"
    return 0
  fi
  mark_done "$key"
}

ask() {
  # ask <prompt> -> echoes the answer
  local prompt="$1"
  printf '%s%s%s ' "$YELLOW" "$prompt" "$R" >&2
  read -r reply
  printf '%s' "$reply"
}

cat <<'INTRO'

  200 squares — environments, keys and the first real deploy
  ══════════════════════════════════════════════════════════

  This sets up:

    Convex     two deployments: dev and prod
    Vercel     production, and a staging branch with its own domain
    Stripe     test keys and live keys, and two webhook endpoints
    Resend     an API key, and DNS records at Cloudflare
    Turnstile  a site key and a secret key
    Limits     the spend caps that keep an attack from making a bill

  Nothing here can be done by an agent. Every step is a dashboard or a login.
  Keep docs/environments.md open beside this.

INTRO

printf '%sPress Enter to start.%s ' "$YELLOW" "$R"; read -r _

# ─────────────────────────────────────────────────────────────────── git ──
step git-email "1. Set the commit address" \
"Vercel refuses a deploy that is not committed as hi@robvb.com." \
"" \
"    git config user.email hi@robvb.com" \
"" \
"Run it now in this repo."

# ───────────────────────────────────────────────────────────────── convex ──
step convex-login "2. Log in to Convex" \
"    npx convex login" \
"" \
"This opens a link. Open it on the machine where your browser is, and paste the" \
"code back. You need a Convex account; the free plan is what this project uses" \
"and it must stay free."

step convex-dev "3. Make the dev deployment" \
"    npx convex dev --once" \
"" \
"It asks for a project name. Answer: 200squares" \
"" \
"This writes .env.local with CONVEX_DEPLOYMENT, NEXT_PUBLIC_CONVEX_URL and" \
"NEXT_PUBLIC_CONVEX_SITE_URL. That file is in .gitignore and stays there." \
"" \
"Write down both URLs. You need them in Vercel later." \
"They look like:  https://<name>-<number>.convex.cloud" \
"                 https://<name>-<number>.convex.site"

step convex-prod "4. Make the prod deployment" \
"Open the Convex dashboard:  https://dashboard.convex.dev" \
"" \
"  - Open the 200squares project." \
"  - There is a deployment switcher at the top. Create the Production deployment." \
"  - Write down its .convex.cloud and .convex.site URLs too." \
"" \
"Check that the project is on the Free plan and that no card is attached." \
"Ticket 02 depends on that: Free refuses work instead of billing for it."

# ────────────────────────────────────────────────────────────────── stripe ──
step stripe-account "5. Stripe account" \
"https://dashboard.stripe.com" \
"" \
"Register the business as the eenmanszaak: KVK number, BTW-id, address." \
"" \
"⚠ Read this before you describe the business. Ticket 01 found that resale makes" \
"  this a Stripe restricted business twice over: 'payment facilitation and" \
"  aggregation' and 'stored value or credits'. Selling advertising space on a" \
"  web page is the first-hand product and is not restricted. Describe what the" \
"  site sells today. Resale is a later conversation with Stripe, not a lie now."

step stripe-test-keys "6. Stripe test keys" \
"Turn on Test mode with the switch at the top right." \
"Developers → API keys." \
"" \
"  - Copy the Secret key (sk_test_...). You will paste it twice: into Convex dev" \
"    and into the Vercel Preview environment." \
"" \
"Do not put a key in a file in this repo."

step stripe-live-keys "7. Stripe live keys" \
"Turn Test mode off. Developers → API keys." \
"" \
"  - Reveal and copy the live Secret key (sk_live_...)." \
"" \
"You may need to finish account activation first. That is fine — you can come" \
"back to this step. Nothing before the launch needs a live key."

# ─────────────────────────────────────────────────────────────────── resend ──
step resend-account "8. Resend account and API keys" \
"https://resend.com" \
"" \
"  - Make two API keys, so one can be revoked without the other:" \
"      200squares-dev" \
"      200squares-prod" \
"  - Stay on the free plan. 3,000 mails a month is far above what this site sends." \
"  - Attach no card."

step resend-domain "9. Verify the domain at Resend, with DNS at Cloudflare" \
"Resend → Domains → Add Domain." \
"" \
"  - Use the subdomain  send.200squares.com , not the root domain." \
"    Mail from a subdomain keeps the root domain's reputation separate." \
"  - Resend then shows a list of records: MX, SPF (TXT), DKIM (TXT) and DMARC." \
"" \
"Add every one of them at Cloudflare → 200squares.com → DNS → Records." \
"" \
"⚠ Set every record to DNS only (grey cloud), never Proxied. Ticket 02 keeps the" \
"  whole zone DNS-only, because Vercel's firewall on Pro beats Cloudflare Free." \
"" \
"Then press Verify DNS Records at Resend. It can take some minutes." \
"" \
"Ticket 13 cannot be tested at all until mail arrives, so this is the step that" \
"unblocks the most."

# ──────────────────────────────────────────────────────────────── turnstile ──
step turnstile "10. Cloudflare Turnstile" \
"Cloudflare dashboard → Turnstile → Add widget." \
"" \
"  - Name: 200squares" \
"  - Hostnames: 200squares.com, www.200squares.com, staging.200squares.com" \
"  - Widget mode: Managed" \
"" \
"Copy the Site Key (public) and the Secret Key (never public)." \
"" \
"Turnstile is free and unlimited, and ticket 02 found it is the only free control" \
"that reaches a Convex write. Ticket 16 makes the reservation mutation demand a" \
"token."

# ────────────────────────────────────────────────────────── email routing ──
step email-routing "10b. A reply must reach a person" \
"Cloudflare dashboard → 200squares.com → Email → Email Routing." \
"" \
"  - Enable Email Routing." \
"  - Add a custom address:  hello@200squares.com" \
"  - Forward it to your own inbox, and confirm the verification mail." \
"" \
"Cloudflare adds its own MX records for the root domain. Resend's records are on" \
"the send. subdomain, so the two do not collide." \
"" \
"⚠ Ticket 13 decided the site never sends from no-reply@. Ticket 08 made 'email" \
"  the dev and prove the payment' the official way back into a locked-out account," \
"  and a black hole on the other end would make that promise false."

# ────────────────────────────────────────────────────────────────── vercel ──
step vercel-pro "11. Vercel Pro" \
"https://vercel.com → your team → Settings → Billing." \
"" \
"Pro is \$20 a month and ticket 02 found it is compulsory for a commercial site." \
"The free plan forbids commercial use, and Pro is what carries the firewall this" \
"project depends on."

step vercel-spend "12. The spend cap" \
"Settings → Billing → Spend Management." \
"" \
"  - Turn it on." \
"  - Amount: 5   (five dollars, above the plan fee)" \
"  - Turn ON: Pause production deployment." \
"  - Confirm by typing the team name." \
"" \
"⚠ Vercel checks every few minutes, so this is a brake and not a wall. That is" \
"  why the amount is far under what you would tolerate." \
"" \
"This is the rule from ticket 02, made real: the site may go offline, it may not" \
"make a bill."

step vercel-domains "13. Domains" \
"Project → Settings → Domains." \
"" \
"  - Add  200squares.com  and  www.200squares.com  → Production." \
"  - Add  staging.200squares.com  → and assign it to the git branch  staging ." \
"" \
"Vercel gives you the DNS records. Add them at Cloudflare, DNS only (grey cloud)." \
"" \
"staging.200squares.com is the fixed address for everything in test mode. Stripe," \
"Better Auth, Resend and Turnstile all need an address that does not change with" \
"the branch name, and a preview URL does change."

step vercel-build "14. The build command" \
"Project → Settings → Build & Development Settings → Build Command → Override:" \
"" \
"    if [ \"\$VERCEL_ENV\" = \"production\" ]; then npx convex deploy --cmd 'npm run build'; else npm run build; fi" \
"" \
"Production pushes the Convex functions as part of the build. A preview does not," \
"because previews run against the dev deployment, which your VPS pushes to with" \
"npx convex dev."

step vercel-env "15. Vercel environment variables" \
"Project → Settings → Environment Variables." \
"Take the table in docs/environments.md and enter it row by row." \
"" \
"Production:" \
"  CONVEX_DEPLOY_KEY             the prod deploy key (Convex dashboard →" \
"                                Settings → Deploy keys, Production)" \
"  NEXT_PUBLIC_CONVEX_SITE_URL   https://<prod>.convex.site" \
"  NEXT_PUBLIC_SITE_URL          https://200squares.com" \
"  NEXT_PUBLIC_TURNSTILE_SITE_KEY  the Turnstile site key" \
"  STRIPE_SECRET_KEY             sk_live_..." \
"" \
"Preview:" \
"  NEXT_PUBLIC_CONVEX_URL        https://proper-heron-683.eu-west-1.convex.cloud" \
"  NEXT_PUBLIC_CONVEX_SITE_URL   https://proper-heron-683.eu-west-1.convex.site" \
"  NEXT_PUBLIC_SITE_URL          https://staging.200squares.com" \
"  NEXT_PUBLIC_TURNSTILE_SITE_KEY  the Turnstile site key" \
"  STRIPE_SECRET_KEY             sk_test_..." \
"" \
"⚠ Do NOT set CONVEX_DEPLOY_KEY on Preview. A preview must not push functions." \
"⚠ NEXT_PUBLIC_ means the value is compiled into the browser bundle. A secret" \
"  with that prefix is a leaked secret."

# ───────────────────────────────────────────────── convex env, both sides ──
printf '\n%s━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%s\n' "$DIM" "$R"
printf '%s16. Variables on the Convex deployments%s\n\n' "$B" "$R"
printf 'This part the script can run for you, because npx convex env set takes the\n'
printf 'value on the command line. It is still your keys that go in.\n\n'
printf 'Do the dev deployment now? (y/n) '
read -r do_convex_env

if [ "$do_convex_env" = "y" ]; then
  printf '\n%sBETTER_AUTH_SECRET, SITE_URL and BOARD_LIVE are already set on dev.%s\n' "$DIM" "$R"
  printf '%sOnly the three keys you hold are left.%s\n\n' "$DIM" "$R"

  sk=$(ask "Stripe TEST secret key (sk_test_...):")
  [ -n "$sk" ] && npx convex env set STRIPE_SECRET_KEY "$sk"

  rk=$(ask "Resend dev API key (re_...):")
  [ -n "$rk" ] && npx convex env set RESEND_API_KEY "$rk"

  tk=$(ask "Turnstile secret key:")
  [ -n "$tk" ] && npx convex env set TURNSTILE_SECRET_KEY "$tk"

  printf '\n%sSTRIPE_WEBHOOK_SECRET comes in the next step, after the endpoint exists.%s\n' "$DIM" "$R"
  mark_done convex-env-dev
fi

step stripe-webhook-test "17. The Stripe webhook, test mode" \
"Stripe → Test mode on → Developers → Webhooks → Add endpoint." \
"" \
"  Endpoint URL:  https://proper-heron-683.eu-west-1.convex.site/stripe/webhook" \
"" \
"  Events:  checkout.session.completed" \
"           checkout.session.expired" \
"           charge.refunded" \
"           payment_intent.payment_failed" \
"" \
"The webhook goes to Convex, not to Vercel. Convex is the source of truth" \
"(ticket 05), the .convex.site address never changes with a branch, and Vercel" \
"Deployment Protection never sees it. See docs/environments.md." \
"" \
"Then copy the signing secret (whsec_...) and set it:" \
"" \
"    npx convex env set STRIPE_WEBHOOK_SECRET whsec_..." \
"" \
"⚠ The endpoint does not exist in the code yet. Ticket 16 builds it. Making the" \
"  endpoint now is fine — Stripe will simply get errors until then."

step convex-env-prod "18. The same variables on prod" \
"Switch the deployment:" \
"" \
"    npx convex env set --prod BETTER_AUTH_SECRET \"\$(openssl rand -base64 32)\"" \
"    npx convex env set --prod SITE_URL https://200squares.com" \
"    npx convex env set --prod BOARD_LIVE true" \
"    npx convex env set --prod STRIPE_SECRET_KEY sk_live_..." \
"    npx convex env set --prod RESEND_API_KEY re_..." \
"    npx convex env set --prod TURNSTILE_SECRET_KEY ..." \
"" \
"⚠ BETTER_AUTH_SECRET must be a DIFFERENT value from dev." \
"" \
"Then add the live webhook endpoint in Stripe with Test mode OFF, pointing at" \
"https://<prod>.convex.site/stripe/webhook , and set its own signing secret:" \
"" \
"    npx convex env set --prod STRIPE_WEBHOOK_SECRET whsec_..." \
"" \
"⚠ Test and live have separate signing secrets. Mixing them fails silently in the" \
"  worst way: the signature check rejects every real payment."

step first-deploy "19. The first real deploy" \
"    git checkout -b staging" \
"    git push -u origin staging" \
"" \
"Then open  https://staging.200squares.com  and check the board still draws." \
"" \
"Nothing is connected to Convex yet — ticket 15 does that. This deploy proves" \
"the domain, the build command and the environment variables are right, while" \
"the site is still simple enough to see what broke."

# ──────────────────────────────────────────────────────────────────── end ──
printf '\n\n%s━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%s\n' "$DIM" "$R"
printf '%sDone with this run.%s\n\n' "$B" "$R"
printf 'Your place is kept in %s.\n' "${STATE_FILE#"$REPO_ROOT"/}"
printf 'Run the script again to pick up anything you skipped.\n\n'
printf 'When every step is done, tell the agent: "ticket 14 is finished".\n'
printf 'It then closes ticket 14 and starts ticket 15, the Convex schema.\n\n'
