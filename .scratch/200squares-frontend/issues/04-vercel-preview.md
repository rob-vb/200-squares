# 04 — Vercel project with working preview deploys

Type: task
Status: resolved
Blocked by: —
Parent: ../map.md

## Question

Nothing can be viewed locally: the dev works on a VPS. Every visual check needs a Vercel preview URL, so this must work before any visual ticket can be judged.

Done when:
- A Vercel project exists and is linked to this repo.
- A push to a branch produces a preview URL.
- The URL opens on the dev's phone.

Record in the answer: project name, the URL pattern, where any tokens live, and which command deploys a branch.

## Answer

Preview deploys work. Verified on 2026-08-22: a branch push produces a public URL that opens without login.

**Project**
- Vercel project: `200-squares`, scope `robs-projects-52973834` (Hobby plan, 1 concurrent build).
- GitHub repo: `rob-vb/200-squares` (private), production branch `main`.
- Git integration is connected, so every push deploys automatically. No manual deploy command is needed.
- Framework detected as Next.js. Stack: Next.js 16.3, React 19, TypeScript, Tailwind v4, App Router, `src/` dir, import alias `@/*`.

**URL pattern**
- Branch preview: `https://200-squares-git-<branch>-robs-projects-52973834.vercel.app`
- Production (`main`): `https://200-squares-robs-projects-52973834.vercel.app`
- Each deploy also gets a unique `https://200-squares-<hash>-robs-projects-52973834.vercel.app`.

**Commands**
- Deploy a branch: `git push origin <branch>` — the git integration does the rest.
- List deploys and URLs: `npx vercel ls 200-squares`
- Manual preview deploy (rarely needed): `npx vercel deploy`

**Tokens and credentials**
- Vercel CLI session lives in `~/.local/share/com.vercel.cli/auth.json`. No token in the repo, no token in CI.
- `.vercel/project.json` holds the project and org id; `.vercel/` is gitignored.
- `.env.local` was written by `vercel link` (OIDC token) and is gitignored.

**Two traps, both fixed**
1. The first two deploys came back `BLOCKED` with *"Git author rbvbaaren@gmail.com must have access to the team"*. The Vercel account is on `hi@robvb.com`. Fix: this repo's `git config user.email` is now `hi@robvb.com`. Any commit authored under another email will block its deploy.
2. Vercel Authentication (SSO protection) was on by default, so preview URLs redirected to a login page and could not open on the phone. It is now Disabled under Settings > Deployment Protection. The prototype has no secrets, so open previews are fine.

Placeholder page committed on `main`; the real canvas lands in ticket 08.
