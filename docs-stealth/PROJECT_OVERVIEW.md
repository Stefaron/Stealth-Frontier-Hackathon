# Project Overview

> A narrative explanation of **Stealth** — why it exists, who it's for, and what an ideal experience looks like from end to end.

---

## Table of Contents

- [Background](#background)
- [Project goals](#project-goals)
- [Value proposition](#value-proposition)
- [Target users](#target-users)
- [Core experience](#core-experience)
- [User journey](#user-journey)
- [How every feature fits together](#how-every-feature-fits-together)
- [What we deliberately did not build](#what-we-deliberately-did-not-build)

---

## Background

DAOs on Solana have a problem that looks boring from the outside but is serious on the inside: **their payroll is public**. Every contributor can see what every other contributor earns. Any competitor can estimate burn rate and runway just by reading the treasury's transactions. Vendors notice which other vendors get paid in the same window. Candidates being scouted by the talent team know their negotiating position before negotiations begin.

The existing tooling — Realms, Squads, Streamflow — all picks the same side: full transparency. The opposite extreme, Tornado-style mixers, breaks auditability and locks DAOs out of any treasury that takes institutional capital with KYC/AML requirements.

This project was built for the Umbra Side Track at the **Solana Frontier Hackathon 2026**, and it was redesigned from scratch to actually exercise every primitive Umbra ships — not just wrap one.

---

## Project goals

Stealth has one primary goal and several supporting ones:

1. **Prove that privacy and compliance are not a trade-off** — they can be combined in a single product through selective disclosure.
2. **Be the most complete Umbra SDK showcase** — encrypted balances, mixer pool, X25519 compliance grants, mixer pool viewing keys, and the ZK prover all appear in real flows.
3. **Be demo-able in 60 seconds** — the Treasurer → Contributor → Auditor flow has to fit a short pitch without skipping anything important.
4. **Run without a backend** — so it's obvious that the privacy isn't a server-side claim, it's cryptography running in the user's own browser.

---

## Value proposition

Three short sentences we use to introduce Stealth to a new audience:

> *"Your treasurer pays 23 contributors at once with a single click — privately. Your contributors see encrypted balances only they can open. Your auditor opens their own dashboard, exports a certified PDF, and never sees a single line outside the scope you granted."*

The thing we're selling is not privacy on its own. It's the **combination of privacy plus audit**. Every competitor picks one of the two; Stealth refuses the choice.

---

## Target users

The product is designed for three audiences with very different profiles:

### 1. DAOs & treasury teams
- Already on a multisig (Squads / Realms) or stream-based payroll tool.
- Pressured by the optics of public salaries and vendor data.
- Need to clear at least an annual external audit.

### 2. Contributors & contractors
- Web3 freelancers, developers, designers, growth leads paid across multiple DAOs.
- Uncomfortable with their balance being publicly browseable on Solscan.
- Need income proof for visas, mortgages, or taxes — without handing over their entire wallet history.

### 3. Auditors, accountants, compliance teams
- Crypto-native audit firms (Hacken, Quantstamp Audit Services and similar).
- In-house compliance officers at larger DAOs.
- Public accountants learning to read on-chain data.

Every page in Stealth was written with one of these three personas in mind.

---

## Core experience

Three sensations anchor every design decision:

| Sensation | How it shows up |
|---|---|
| **"This looks serious."** | Geist + Playfair Display typography, zinc + indigo palette, smooth GSAP animation, no loud gradients, no excessive emoji. |
| **"I know what's happening."** | Toast system, status pills, per-page eyebrow labels, Treasurer onboarding checklist, scanner progress meter, withdraw `callbackStatus`. |
| **"I don't need the tutorial — but the tutorial is there when I do."** | Role-aware Guide Tour that auto-runs once per role, retro-CRT ConnectGate that nudges connection, copy-to-clipboard on every address. |

---

## User journey

The full story, written as product narrative:

### Day 1 — Mira (Treasurer, Engineering DAO)

Mira opens [stealth.example](http://localhost:3000) and sees a landing page focused on the *trilemma*: Public vs Anonymous vs Private+Auditable. She clicks **Get started**, lands on `/welcome`, and picks **Treasurer**.

On `/treasurer` she sees an **onboarding checklist**: Wallet connected → Stealth session active → Registered with Umbra. She connects Phantom. The checklist fills itself in. The rest is a single signature.

After registration completes, Mira opens **Pay contributors**. She drags in a `payroll-q1.csv` exported from a spreadsheet. Stealth validates each row, shows the total SOL needed, and surfaces a yellow banner: *"Wrap SOL → WSOL first"*. She types `0.5` into the input, clicks **Wrap SOL**. Phantom confirms. Five seconds. Done.

Now **Send N privately** becomes active. Click. Each row in the table flips from **Pending** → **Sending** → **Sent**. Done.

### Day 3 — Adi (Contributor)

Adi is told to visit `/contributor`. He connects his wallet. A banner: *"1 unclaimed payment found."* He clicks **Claim now**. Phantom confirms. Green toast: *"1 payment claimed."* The balance settles at `0.001991 SOL — Shared mode`.

He wants to move it to his public wallet. He clicks **MAX**, clicks **Withdraw**. Phantom confirms. The UI shows `Queued: 43kZ5M…` — Stealth deliberately tells him withdraw is *two steps*: queue now, MPC callback later, because devnet is sometimes slow and Stealth refuses to fake a loading state.

### Day 30 — Hacken (Auditor)

Mira adds Hacken's auditor address on `/treasurer/auditors`, labels it *"Q1 Audit 2026"*, picks VK level **Master**, and clicks **Issue Grant**. Phantom confirms. She also clicks **Derive MVK** from her wallet so Hacken can decrypt immediately without an extra round-trip.

Hacken opens `/auditor`. The active grant is already there. Click **View report** → land on the `Treasury Report` page. Pick VK level *monthly*, click **Load transactions**. Stealth's compliance scanner runs: 1) pull the tx history from Solana RPC, 2) decode the Anchor event logs, 3) descend the TVK from MVK down to the monthly level, 4) decrypt the linker ciphertexts, 5) reassemble the destination addresses.

Hacken clicks **Export PDF**. A file named `stealth-audit-9eAicp…HBy.pdf` lands in their downloads. The header reads *Stealth — Confidential Payroll Audit Report*, with the DAO address, auditor address, timestamp, and a full signature table.

Done. Privacy. Audit. No compromise.

---

## How every feature fits together

Stealth isn't a grab-bag of features — they all hang on one story: **cryptographic access control**.

- **Wallet adapter** is the identity source.
- **Umbra Context** turns a wallet signature into a master seed, which unlocks an encrypted balance.
- **Compliance grant** publishes one extra pair of X25519 public keys (granter + auditor) to the on-chain registry.
- **Mixer Pool Viewing Key** gives the auditor a read-only path into the same ciphertexts.
- **TVK descent** narrows the visibility window to whatever scope the grant defined.

Every page just routes a specific user toward the next link in that chain. There is no "bonus" feature that doesn't belong in this story.

---

## What we deliberately did not build

What's missing is just as load-bearing as what's there:

- **No application database.** Authoritative state is on-chain. `localStorage` only caches UI state (claimed UTXO indices, grant metadata).
- **No email / password login.** A wallet signature is the only identity.
- **No subscription tiers.** This is hackathon scope. Monetization comes after product-market fit.
- **No native mobile app.** Responsive web is enough for a demo and a pilot.
- **No recurring payments** or **scheduled disbursements.** Deferred to v2 to keep the MVP focused.
- **No cross-chain.** Solana-first. Mainnet rolls out after devnet feedback.
- **No on/off-ramp.** That's a different product. Stealth focuses on privacy + audit.
- **No per-jurisdiction tax exports.** Pair Stealth with an accountant or a tax partner.

Saying "no" with confidence is part of the product.

---

[← Back to index](./README.md) · [Next: Frontend Architecture →](./FRONTEND_ARCHITECTURE.md)
