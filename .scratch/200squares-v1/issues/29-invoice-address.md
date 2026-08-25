# 29 — Which address the invoice may carry

Type: research
Status: resolved
Parent: ../map.md

## Question

The dev registered the eenmanszaak on their **home address**, and does not want that
address handed to every buyer. [Ticket 17](17-invoice-document.md) put *trading name and
address* on the invoice, and [ticket 23](23-build-invoice.md) built it that way, so today
`BUSINESS_ADDRESS` is the home address or the invoice does not say who supplied.

⚠️ **It gates the first real sale, and it cannot be undone afterwards.** Ticket 17's rule is
that an invoice is written once and never recomputed, so the address is frozen into every
document at the moment it is issued. Changing the variable in 2027 does not rewrite a 2026
invoice — which is what the law wants, and what makes this a decision to take **before**
the first one exists rather than after.

Answer three things, from primary sources — the Belastingdienst on invoice requirements,
and the KVK on what a Handelsregister address is:

1. **What address does art. 35a Wet OB actually demand?** *Het volledige adres van de
   ondernemer* — is that the registered `vestigingsadres`, or is a `correspondentieadres`
   or `postadres` enough? The two are different fields at the KVK and the invoice rule may
   not care which.

2. **What is already shielded, and what is not?** The KVK shields the home address of a
   small business from the public Handelsregister extract, but that is a different question
   from what a supplier prints on an invoice to a customer. Say which of the two is which,
   and whether the shielding covers anything here.

3. **What does a different address cost?** A `vestigingsadres` at a virtual office or a
   business centre, or a `postadres` beside the home `vestigingsadres`. KVK rules on what
   it accepts (a postbus alone is not a vestigingsadres), the yearly price, and whether the
   Belastingdienst accepts it on an invoice. This is a one-person business, so the price is
   a price to a person.

### What is already true, and is not the question

The invoice is **not public**. `BUSINESS_ADDRESS` is read in exactly one place —
`convex/lib/invoice.ts` — and no page on the site prints it. The document sits behind a
32-hex random token, is served `private, no-store` at both ends, is in no index, and its
link goes only to the buyer's own mail and their own My squares.

So the address reaches **customers**, not the web. That is a smaller exposure than the dev
may fear, and it is still an exposure: every buyer, forever, and a buyer may forward the
link to anybody.

### Not this ticket

Changing the document. If the answer is *a correspondentieadres is enough*, the change is
one environment variable and no code at all — which is why ticket 23 put the identity in
variables in the first place.

## Answer

**The dev holds the answer, and the ticket was asking the wrong question.**

The dev's question was never *which address may I use* — they know that. It was **where
does my address appear at all**. That has one answer:

⚠️ **On the invoice, and nowhere else on the site.** `BUSINESS_ADDRESS` is read in exactly
one place, `convex/lib/invoice.ts`, and the document it goes into is not public: a 32-hex
random token, `private, no-store` at both ends, in no index, and the link goes only to the
buyer's own mail and their own My squares. No page of 200squares.com prints it — `/terms`,
`/privacy` and the contact block name `hello@200squares.com` and no address at all
([tickets 11](11-admin-removal.md) and [13](13-email.md)).

So the exposure is *every buyer, forever*, and not *the web*.

The three research questions are dropped unasked. The dev knows what goes in the variable.

The one thing worth keeping from this ticket, and it stays true whatever address is chosen:
⚠️ **the address is frozen into each document at issue time** (ticket 17's write-once rule),
so changing the variable later does not rewrite an invoice already issued. That makes it a
choice to make before the first real sale, and it is recorded on
[ticket 28](28-prove-the-mail.md) where the variables are set.
