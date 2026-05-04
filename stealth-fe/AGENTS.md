<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Frontend-Specific Context

See `../CLAUDE.md` for full project context. This file covers frontend-only rules and gotchas.

---

## Package Requirements

After every `git pull`, run:

```bash
cd stealth-fe && npm install
```

`gsap` and `lenis` are in `package.json` but may not be in `node_modules` if a teammate added them without running install. TypeScript errors like `Cannot find module 'gsap'` or `Cannot find module 'lenis'` mean `npm install` is needed.

---

## Animation System

### GSAP hooks — `hooks/useGsap.ts`

| Hook | Purpose |
|------|---------|
| `useGsapEnter(ref, opts)` | Single element fade-up on IntersectionObserver |
| `useGsapStagger(containerRef, childSelector, opts)` | Staggered children reveal |
| `useGsapCharReveal(ref, trigger)` | Per-character text reveal on trigger change |

Import GSAP via the hook file — do not import directly from `gsap`:
```ts
import { gsap } from "@/hooks/useGsap";
```

### `[data-anim]` pattern

Inside modals/panels that need per-element animation, add `data-anim` to elements and animate with `gsap.fromTo` in `useLayoutEffect`:
```tsx
useLayoutEffect(() => {
  gsap.fromTo(
    ref.current?.querySelectorAll<HTMLElement>("[data-anim]"),
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: "power3.out" }
  );
}, [trigger]);
```

---

## WalletModal Architecture

`components/app/WalletModal.tsx` — two-pane RainbowKit-style modal.

### State
- `mounted` — controls `createPortal` render
- `closing` — prevents double-close during GSAP exit animation
- `hovered` — which row mouse is currently over (clears on mouse leave)
- `lastHovered` — which row was last hovered; **intentionally never clears**

### Why `lastHovered` never clears
Right pane (`WalletPreview`) must stay mounted while user moves mouse from left row to right pane to click "Connect Phantom". If right pane unmounts on `mouseleave`, the click target disappears before it fires. `lastHovered` keeps the right pane stable.

### Modal close on `open` prop change
`open=false` must trigger `triggerClose()`. The `useEffect` handles both directions:
```tsx
useEffect(() => {
  if (open) {
    setMounted(true);
    setClosing(false);
  } else if (mounted && !closing) {
    triggerClose();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [open]);
```
Missing the `else if` branch = modal stays visible after parent calls `setModalOpen(false)`.

---

## Wallet Adapter Setup

`context/WalletProvider.tsx` uses `@solana/wallet-adapter-react`. Wallets configured:
- PhantomWalletAdapter
- SolflareWalletAdapter
- TrustWalletAdapter
- LedgerWalletAdapter
- TorusWalletAdapter

MetaMask is excluded in `WalletModal` via `EXCLUDE` set — EVM only, irrelevant here.

---

## Contributor Page Patterns

`app/contributor/page.tsx`

### Balance states from Umbra SDK
- `"shared"` — decrypted balance available, show number
- `"mxe"` — MXE-encrypted, show `••••••` and explain
- `"uninitialized"` — account not yet activated, show `0.00`
- `undefined` / no entry — show "Ask treasurer to send payment first"

### Withdraw disabled condition
```tsx
disabled={isWithdrawing || !withdrawAmount || balances.get(withdrawMint)?.state !== "shared"}
```
Withdraw only enabled when balance state is `"shared"`.

### UTXO claim flow
1. `scanClaimableUtxos(client)` — get list of unclaimed UTXOs
2. Filter by `claimedIndices` (localStorage-persisted per wallet)
3. `claimReceiverUtxos(client, utxos)` — claim one-by-one (batch fails if any already spent)
4. Persist newly claimed indices to localStorage

---

## Lenis Scroll

If `lenis` is used for smooth scroll, initialize in layout or a client component wrapping children. Do not initialize in server components.

---

## Tailwind Conventions

- Dark theme: `bg-[#0d0c0a]` base, `bg-white/[0.025]` cards, `border-white/[0.06]` borders
- Text hierarchy: `text-white` → `text-white/85` → `text-white/55` → `text-white/35` → `text-white/25` → `text-white/15`
- Monospace labels: `font-mono text-[9px] tracking-[0.22em] uppercase`
- Primary CTA: `bg-white text-[#0d0c0a] rounded-full font-bold tracking-widest uppercase`
- `press` class: custom CSS for active scale effect on buttons
