# Stealth — End-to-End Testing Guide

Complete walkthrough for all three user roles: **Contributor**, **Treasurer**, and **Auditor**.  
Covers setup from zero through real on-chain Umbra data in the auditor dashboard.

---

## Prerequisites

### Wallets needed
You need **at least two Phantom (or Solflare) wallets** on Solana devnet:

| Wallet | Role |
|--------|------|
| Wallet A | Treasurer (pays contributors) |
| Wallet B | Contributor (receives payment) |
| Wallet C | Auditor (optional; Wallet B can double as auditor) |

### Tools
- Node.js 18+
- Git
- Phantom browser extension (devnet mode)

---

## Part 0 — Local Setup

```bash
# 1. Clone repo
git clone <repo-url>
cd stealth-fe

# 2. Install dependencies (must do this after every git pull)
npm install

# 3. Copy env file
cp .env.local.example .env.local   # or ask teammate for .env.local

# 4. Start dev server
npm run dev
```

Open `http://localhost:3000` in browser.

### `.env.local` minimum required:
```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_WS_URL=wss://api.devnet.solana.com
NEXT_PUBLIC_UMBRA_NETWORK=devnet
NEXT_PUBLIC_UMBRA_RELAYER_URL=https://relayer.api-devnet.umbraprivacy.com
NEXT_PUBLIC_UMBRA_INDEXER_URL=https://utxo-indexer.api-devnet.umbraprivacy.com
```

---

## Part 1 — Get Devnet SOL

Every wallet that interacts on-chain needs SOL for transaction fees.

**Option A — Solana CLI:**
```bash
solana airdrop 2 <WALLET_ADDRESS> --url devnet
```

**Option B — Browser faucet:**  
Go to https://faucet.solana.com, paste wallet address, select Devnet, request 2 SOL.

**Option C — In-app (Phantom):**  
Settings → Developer Settings → Airdrop SOL (devnet only).

> Repeat for Wallet A, Wallet B, and Wallet C.

---

## Part 2 — Contributor Flow (Wallet B)

### 2.1 Connect wallet
1. Open `http://localhost:3000/contributor`
2. Click **Connect Wallet** → select Phantom → approve

### 2.2 Initialize Umbra client
1. Click **Initialize Umbra Client**
2. Phantom shows a `signMessage` popup — **Sign it**
   - Message: `"Umbra: Generate Umbra Private Keys"`
   - This derives master seed. Never share this signature.
3. Wait for "Umbra client initialized" toast

### 2.3 Register with Umbra
1. Click **Register**
2. Approve transaction in Phantom
3. Wait for "Registered" toast (~10–30 sec)
4. Status badge changes to **Registered**

> If registration fails with "expired", wait 10 seconds and try again (devnet slot TTL ~180 slots).

### 2.4 Check encrypted balance
- After registration, encrypted balance shows `0.00 USDC` and `0.00 WSOL`
- Balance is `uninitialized` until treasurer sends payment

### 2.5 Claim UTXOs (do this after treasurer sends payment in Part 3)
1. Come back here after Part 3
2. Click **Refresh** to scan for claimable UTXOs
3. If UTXOs found, click **Claim All**
4. Approve transaction in Phantom
5. Encrypted balance updates

### 2.6 Withdraw to public wallet
1. Enter amount in **Withdraw** field
2. Select token (USDC or WSOL)
3. Click **Withdraw**
4. Approve in Phantom
5. Two steps happen:
   - **Queue TX** — deducted from encrypted balance immediately
   - **Callback TX** — Arcium MPC delivers funds to wallet (~1–4 min)
6. `callbackStatus` shown:
   - `finalized` → funds in wallet ✓
   - `timed-out` / `pruned` → devnet MPC failure; wait 2–5 min and check wallet

---

## Part 3 — Treasurer Flow (Wallet A)

### 3.1 Connect wallet
1. Open `http://localhost:3000/treasurer`
2. Connect Phantom with Wallet A

### 3.2 Initialize + Register (same as Contributor)
1. Click **Initialize Umbra Client** → sign message
2. Click **Register** → approve transaction
3. Wait for registered status

### 3.3 Wrap SOL → WSOL (needed for Umbra mixer)
1. Go to `/treasurer/pay`
2. Click **Wrap SOL → WSOL** button (devnet only helper)
3. Enter amount (e.g. `0.5` SOL)
4. Approve in Phantom
5. WSOL balance updates

> If wrap fails with "not confirmed in 30 seconds", try again — devnet congestion.

### 3.4 Send payment to contributor (single)
1. Stay on `/treasurer/pay`
2. Fill **Recipient Address** with Wallet B address
3. Fill **Amount** (e.g. `0.1` WSOL or USDC)
4. Click **Send**
5. Approve in Phantom
6. Toast shows queue signature

> Payment goes through Umbra mixer pool — recipient gets a claimable UTXO, not a direct transfer.

### 3.5 Send bulk payment via CSV (optional)
1. Go to `/treasurer/pay` → **Bulk CSV** tab
2. Upload CSV with format:
   ```csv
   address,amount,mint,note
   <wallet_B_address>,100000,WSOL,Engineering
   <wallet_C_address>,50000,WSOL,Design
   ```
3. Click **Send All**
4. Approve each transaction in Phantom

---

## Part 4 — Auditor Flow (Wallet C or Wallet B)

### Part 4A — Treasurer Issues Grant (Wallet A)

#### 4A.1 Derive master viewing key
1. Open `/treasurer/auditors` (still on Wallet A)
2. Make sure Umbra client is initialized (if not, re-initialize on `/contributor` or `/treasurer`)
3. In the **"Issue New Grant"** form:
   - Fill **Auditor Wallet Address** with Wallet C address
   - Fill **Label** (e.g. `"Q2 2025 Audit"`)
   - In **Viewing Key** field, click **"Derive from wallet ↗"**
   - Phantom shows `signMessage` popup — **Sign it**
   - Viewing key hex auto-fills in the textarea + copied to clipboard

#### 4A.2 Issue grant
4. Click **Issue Grant**
5. Approve transaction in Phantom
6. Toast: `"Grant issued · <signature>…"`
7. Grant appears in the **Active Grants** list with a green dot

> Keep this page open — you need the nonce shown in the grant row.

---

### Part 4B — Auditor Opens Dashboard (Wallet C)

#### 4B.1 Connect auditor wallet
1. Switch to Wallet C in Phantom
2. Open `http://localhost:3000/auditor`
3. Connect Wallet C

> **Note**: Auditor does NOT need to register with Umbra. Viewing is read-only.

#### 4B.2 Find the grant
1. Page shows list of DAOs that granted you access
2. Find the entry from Wallet A (Treasurer)
3. Click **View Report**

#### 4B.3 Scan for real transactions
1. On the report page, the scanner panel appears at the top
2. **Mint** field — leave default (`4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPz...` = USDC devnet)  
   Or change to WSOL mint if treasurer sent WSOL: `So11111111111111111111111111111111111111112`
3. **VK Level** — select `master` (sees all transactions for that mint)
4. Click **Load Transactions**
5. Wait 5–30 seconds (scanning Umbra indexer + decrypting)

#### 4B.4 Reading the results

**Progress counters explained:**

| Counter | Meaning |
|---------|---------|
| Indexed | UTXOs found in Umbra indexer for this treasurer address |
| In Scope | UTXOs matching the selected mint + time window |
| Events | Anchor event logs found and decoded in transactions |
| Decrypted | Successfully decrypted UTXOs |
| Failed | Decryption errors (wrong key, missing events) |
| Bogus | Outputs that look like wrong-key garbage (heuristic check) |

**Transaction table columns:**

| Column | Meaning |
|--------|---------|
| Transaction | First 16 chars of on-chain signature + decrypted recipient address |
| Amount | Token amount (decrypted for ETA, plaintext for ATA) |
| Source | `ATA` = sent from public balance; `ETA` = sent from encrypted balance |
| Date | Block timestamp of the transaction |

#### 4B.5 Export report
- Click **Export CSV** → downloads `stealth-audit-<daoId>.csv`
- Click **Export PDF** → downloads `stealth-audit-<daoId>.pdf`

---

## Part 5 — Troubleshooting

### Indexed = 0
- Devnet indexer may lag 1–5 minutes after a transaction
- Wait and click **Load Transactions** again
- Check the mint address matches what treasurer used

### Events = 0
- The transaction is indexed but its logs can't be fetched
- Devnet public RPC sometimes drops old logs
- Try again; if persistent, the RPC may not archive those logs

### Decrypted = 0, Failed > 0
- MVK derived from wrong wallet — treasurer must be on Wallet A when deriving
- Wrong VK Level vs scope combination
- Try re-issuing grant after re-deriving viewing key

### "More than 50% look invalid" warning
- Viewing key is wrong for these transactions
- Treasurer should re-issue grant using **"Derive from wallet ↗"** while connected to correct wallet

### Wrap SOL fails "not confirmed in 30 seconds"
- Pure devnet congestion — try again
- If repeated, check SOL balance (need >0.01 SOL for fees)

### Registration TX expires
- Solana devnet has ~180 slot TTL for registration
- Error: `"Transaction simulation failed"` or similar
- Just click **Register** again

### Balance shows encrypted / `••••••`
- Balance in MXE mode — Umbra client not fully initialized
- Re-initialize: click **Initialize Umbra Client** again and sign

### Callback timed-out / pruned after withdraw
- Devnet MPC (Arcium) is unreliable — this is expected
- Funds were deducted from encrypted balance (queue TX committed)
- Check public wallet manually on Solscan (devnet)
- May need to wait 2–5 minutes for delayed delivery

---

## Quick Reference — Pages

| URL | Role | Action |
|-----|------|--------|
| `/contributor` | Contributor | Scan UTXOs, claim, view balance, withdraw |
| `/treasurer` | Treasurer | Dashboard overview |
| `/treasurer/pay` | Treasurer | Send private payment, wrap SOL |
| `/treasurer/auditors` | Treasurer | Issue/revoke compliance grants |
| `/auditor` | Auditor | See list of received grants |
| `/auditor/<daoId>?nonce=<nonce>` | Auditor | View + scan treasury report |

---

## Flow Diagram

```
Wallet A (Treasurer)                    Wallet B (Contributor)
─────────────────────                   ──────────────────────
Initialize + Register                   Initialize + Register
        │                                       │
        ▼                                       │
  Wrap SOL → WSOL                              │
        │                                       │
        ▼                                       │
  Send payment ──── Umbra Mixer Pool ──────────▶ Claim UTXO
  /treasurer/pay     (private UTXO)               │
        │                                         ▼
        │                                   Encrypted Balance
        │                                         │
        ▼                                         ▼
  /treasurer/auditors                       Withdraw to wallet
  Derive MVK → Issue grant
        │
        ▼
Wallet C (Auditor)
──────────────────
  /auditor → View grant
  Load Transactions (uses MVK)
  Decrypted real tx data ✓
  Export PDF / CSV
```

---

*Last updated: 2026-05-05*  
*Network: Solana devnet · SDK: @umbra-privacy/sdk v4+*
