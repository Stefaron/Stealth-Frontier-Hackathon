# Development Notes

> Practical notes for anyone extending Stealth — conventions, recipes, and known limitations.

---

## Table of Contents

- [Code structure conventions](#code-structure-conventions)
- [Adding a new page](#adding-a-new-page)
- [Adding a new component](#adding-a-new-component)
- [Wrapping a new Umbra function](#wrapping-a-new-umbra-function)
- [Keeping the UI consistent](#keeping-the-ui-consistent)
- [Proven patterns](#proven-patterns)
- [Areas that could grow](#areas-that-could-grow)
- [Known limitations](#known-limitations)
- [Day-to-day tips](#day-to-day-tips)

---

## Code structure conventions

### File organization
- **App Router** — one folder per route. `page.tsx` = page, `layout.tsx` = wrapper.
- **Page-specific components** live inline or as siblings (e.g., extract to `app/treasurer/pay/_components/RecipientTable.tsx`).
- **Cross-role components** go in `components/app/`.
- **Reusable primitives** go in `components/ui/`.
- **Landing-page components** go in `components/landing/`.

### Naming
- Files: `kebab-case.ts` for libs/utilities, `PascalCase.tsx` for React components.
- Variables & functions: `camelCase`.
- Module-level constants: `UPPER_SNAKE_CASE`.
- Types: `PascalCase` with optional `Type` / `Props` / `Args` suffix.

### Import order
1. External (`react`, `next/...`, `@solana/...`).
2. Internal lib (`@/lib/...`, `@/hooks/...`, `@/context/...`).
3. Components (`@/components/...`).
4. Type-only imports (`import type { ... }`).

### Client vs Server component
- Default to **Server Component** when possible.
- Add `"use client"` at line one when the component uses hooks or interactivity.
- The landing page is a Server Component that renders Client Components inside it.

### Type safety
- TypeScript strict on. `any` is only allowed with an `// eslint-disable-next-line @typescript-eslint/no-explicit-any` comment that briefly explains why.
- The Umbra SDK has heavy generics — `any` escapes are acceptable as long as they're commented.

---

## Adding a new page

Example: a `/treasurer/analytics` page.

1. Create `app/treasurer/analytics/`.
2. Create `page.tsx`:
   ```tsx
   "use client";
   import { useUmbra } from "@/context/UmbraContext";

   export default function AnalyticsPage() {
     const { client } = useUmbra();
     return (
       <div className="max-w-5xl mx-auto px-5 md:px-8 py-10 md:py-14">
         <span className="eyebrow mb-3">
           <span className="eyebrow-dot" />
           Treasurer · Analytics
         </span>
         <h1 className="mt-3 font-bold text-zinc-900 tracking-tight text-3xl">
           Analytics
         </h1>
         {/* ... */}
       </div>
     );
   }
   ```
3. Update `app/treasurer/layout.tsx` `LINKS` array so the tab appears in the nav.
4. (Optional) Add a step to `buildSteps("treasurer")` in `AppNav.tsx` so the Guide Tour highlights the new element.

> No router registration needed — App Router auto-detects `app/.../page.tsx`.

---

## Adding a new component

### Page-specific component
Put it next to the page or under `_components/`. No need to expose to `components/`.

### Cross-role component
Put it in `components/app/`. Keep props minimal — prefer pure presentational + callbacks.

### Primitive (button, dialog, etc.)
Put it in `components/ui/`. Make sure:
- No coupling to wallet/Umbra/Toast contexts.
- Props accept `className` for styling override (combine with the `cn()` helper in `lib/utils.ts`).
- Animation goes through framer-motion or GSAP, not inline CSS animations (except for trivial cases).

---

## Wrapping a new Umbra function

Rule: **never import from `@umbra-privacy/sdk` directly in a component.** Always go through `lib/umbra/`.

Example: wrapping a new SDK function `getXyzFunction`.

1. Create `lib/umbra/xyz.ts`:
   ```ts
   import { getXyzFunction } from "@umbra-privacy/sdk";
   import type { IUmbraClient } from "@umbra-privacy/sdk/interfaces";

   export async function doXyz(client: IUmbraClient /*, args */) {
     const xyzFn = getXyzFunction({ client });
     try {
       const result = await xyzFn(/* args */);
       return result;
     } catch (e) {
       const msg = e instanceof Error ? e.message : String(e);
       // Translate "already processed" or "TTL" into a user-friendly message
       throw new Error(`Xyz failed: ${msg}`);
     }
   }
   ```
2. In the page component, call `doXyz(client, ...)`.

This pattern makes:
- Migration between SDK versions easy — only `lib/umbra/` needs updating.
- Testing simpler — small wrappers are easy to mock.
- Adding retry / error translation possible without touching components.

---

## Keeping the UI consistent

- Always use the `eyebrow` + `<h1>` pattern at the top of every page.
- Use the `card` class for surfaces — don't define a custom border + bg every time.
- Use `text-zinc-500` for muted text; don't reach for arbitrary grays.
- Press feedback: add `.press` to every clickable button.
- Toast for async feedback; don't inline error messages under a button unless the explanation is long-form.
- Loading state: an inline spinner on the primary button + disabled state.

> Before adding a new CSS class to `globals.css`, check whether something similar exists. Many classes are reusable.

---

## Proven patterns

### Per-wallet localStorage key
```ts
const lsKey = publicKey ? `umbra_claimed_${publicKey.toBase58()}` : null;
```
This prevents cross-contamination when the user switches wallets.

### Manual refresh button
Rather than auto-polling (which burns RPC quota), use a manual refresh button that re-runs the query. The pattern:
```tsx
<button onClick={loadBalancesAndScan} disabled={isLoading} className="press">
  <svg className={isLoading ? "animate-spin" : ""}>...</svg>
  {isLoading ? "Refreshing…" : "Refresh"}
</button>
```

### "Already processed" handling
For transactions that succeed on-chain but fail in the SDK's confirmation retry, detect the message and return success. See `transfers.ts` and `useRegistration.ts`.

### `callbackStatus` surfacing
Withdraw isn't atomic. Show `queueSignature` and `callbackStatus` to the user — *never* pretend "queued = delivered". This isn't a bug; it's transparency.

### Toast for async feedback
```ts
const id = toast.loading("Encrypting & uploading...");
try {
  await doIt();
  toast.dismiss(id);
  toast.success("Published");
} catch (e) {
  toast.dismiss(id);
  toast.error("Failed");
}
```

---

## Areas that could grow

Based on the codebase, these make sense as v2 work:

### 1. A backend for shared state
**Today:** `stealth:compliance-grants` is only in browser localStorage. Treasurer issues a grant on laptop A → opens laptop B → the grant doesn't show.

**Solution:** Vercel KV or a Supabase free tier to sync grant metadata. Still encrypted at rest. Important for a real DAO pilot.

### 2. On-chain auditor attestation
**Today:** The PDF export is off-chain — visually credible, but it can't be verified cryptographically without trusting Stealth.

**Solution:** A v2 "Sign with auditor wallet" flow that publishes the report hash + the auditor signature to an on-chain registry — so the PDF can be verified independently.

### 3. Recurring payments
**Today:** Every payout is a one-shot. No monthly scheduling.

**Solution:** A "Schedule" component on the Pay page + a small backend (cron / Solana scheduled tx). Many DAOs need this for monthly salaries.

### 4. Multi-DAO contributor view
**Today:** Contributors see balances per wallet — if they work for 3 DAOs, they have to switch wallets for each.

**Solution:** A unified view aggregating balances across multiple wallets (or Solana sub-accounts). Requires multi-key derivation in the Umbra SDK.

### 5. Tax exports per jurisdiction
**Today:** PDF & CSV exports are generic — no tax-specific format.

**Solution:** Additional export templates (US 1099-NEC equivalent, EU VAT, etc.). More partnership than engineering.

### 6. Explicit Wallet Standard adapters
**Today:** `WalletProvider.tsx` registers only Solflare, Trust, Ledger, Torus. Phantom & Backpack rely on Wallet Standard auto-detect — works today but isn't explicit.

**Solution:** Add Phantom & Backpack adapters explicitly in case auto-detect fails in some browsers.

### 7. Mobile-responsive Treasurer Pay
**Today:** The recipient table at `/treasurer/pay` overflows on mobile.

**Solution:** Switch to a vertical card layout below the `md` breakpoint.

### 8. i18n
**Today:** English-only. Regional / Indonesia demos are still in English.

**Solution:** `next-intl` or `next-translate`. Small scale — one JSON file per locale.

---

## Known limitations

| Limitation | Source |
|---|---|
| **Grant metadata isn't synced between devices** | `lib/grants-store.ts` uses localStorage. |
| **Devnet Arcium callbacks can time out** | External infrastructure. Mitigated by `maxSlotWindow: 600` + `safetyTimeoutMs: 360_000`. |
| **Compliance scanner needs an explicit MVK** | The auditor must receive the MVK from the treasurer (via "Derive from wallet ↗" + share). |
| **TVK is mint-specific** | The scanner needs the correct mint — wrong mint → every decrypt is bogus. |
| **A page refresh = a fresh signature** | By design (master seed isn't persisted). |
| **Withdraw isn't atomic** | Two steps (queue + MPC callback). The UI explains this clearly. |
| **The tour-seen flag isn't synced cross-browser** | Per-browser localStorage. Acceptable. |
| **Pinata API quota** | The free Pinata tier has limits. For a larger pilot, upgrade or self-host an IPFS node. |
| **Strict CSV format** | Headers must be `address,amount,mint,note`. No per-row validation feedback. |
| **No backend = no rate limit** | Public devnet RPC is the default. For serious traffic, switch to Helius / Triton / QuickNode. |
| **MetaMask is excluded from WalletModal** | `EXCLUDE` set in `WalletModal.tsx`. By design — EVM isn't relevant. |

---

## Day-to-day tips

### Check whether the SDK has an update
```bash
npm outdated | grep umbra
```
The Umbra SDK shipped in April 2026 and is still iterating — minor releases happen.

### Debug an unclear Umbra error
1. Open DevTools → Console.
2. Look for log lines prefixed with `[Umbra]` or `[Claim]` — some wrappers in `lib/umbra/*` already `console.error` with cause.
3. For failed transactions, paste the signature into Solscan devnet — the RPC logs are often more informative than the UI error.

### Quickly test the compliance scanner
1. Run a Treasurer Pay flow to completion.
2. Issue a grant to the auditor's address (the same wallet works for a quick test).
3. Switch to the auditor role.
4. Open the grant → set mint = WSOL (`So111...112`) → VK Level = `monthly` → Load.
5. If `Decrypted = 0`, look at the `Failed`, `WrongMint`, and `LooksBogus` counters in the progress meter.

### Reset local state
For a clean retest:
```js
// In DevTools console
localStorage.clear();
location.reload();
```
This clears claimed indices, grants, the guide-seen flag, and the preferred wallet.

### Inspect the project structure quickly
```bash
# Inside stealth-fe/
npx tree-cli --depth 3 -I "node_modules|.next"
```
Or open the folder in VS Code and collapse `node_modules`.

---

[← Back to index](./README.md) · [Project Overview →](./PROJECT_OVERVIEW.md)
