# Umbra Compliance Portal — Pipeline Summary

A read-only audit tool. Takes a wallet address + a viewing key + a scope,
returns the decrypted UTXO transactions the wallet **sent** through the
Umbra mixer pool, restricted to the viewing key's scope.

---

## Background — Three ciphertexts per UTXO, only one is yours to decrypt

Every Umbra UTXO carries three independent ciphertexts. The portal only
ever touches the third.

* **`aes_encrypted_data`** — AES-256-GCM, keyed by X25519 ECDH between
  depositor and recipient. Recovery blob. Master-seed required to decrypt.
  Skip.
* **`rc_encrypted_*`** (amount, fees, random_factor) — Rescue cipher,
  keyed by X25519 ECDH with the Arcium MXE network key. MPC-decryptable
  only. Skip.
* **`linker_encryption_0/1/2`** — Poseidon stream cipher, **keyed
  directly by `BigInt(transactionViewingKey)`**. No KDF, no envelope, no
  derived AES key. The viewing key bigint goes straight into the cipher.
  This is the only blob the portal reads.

The linker ciphertexts live in **Anchor event logs** on the create /
deposit transactions. They are NOT in `UtxoDataItem`. They are NOT in any
on-chain account at audit time (the `StealthPoolDepositInputBuffer` PDA
gets closed by the deposit instruction).

---

## Dependencies

* **`@umbra-privacy/sdk`** (public, MIT, npm) — Poseidon hasher, Poseidon
  decryptor, address splitter, branded viewing-key types.
* **`@umbra-privacy/umbra-codama`** (public, MIT, npm) — codegen output
  from Umbra's public Anchor IDL. Provides:
  * `UMBRA_PROGRAM_ADDRESS` — program ID constant.
  * Per-event borsh decoders (every Anchor event in the IDL).
  * Per-instruction builders (not used by the portal, but available).
  * PDA seed encoders (e.g. `getAccountOffsetEncoder` — the LE-u128
    encoding for buffer-PDA seeds).
  * Account decoders for on-chain state (not used by the portal).
* **`@solana/kit`** — RPC client, `getAddressEncoder`,
  `getProgramDerivedAddress`, signature types.
* **A Helius RPC URL** with embedded `?api-key=…`. Required because:
  1. The portal relies on JSON-RPC batching (paid plans) for sub-second
     audits.
  2. Closed-PDA signature history queries require deep archive depth
     beyond vanilla Solana RPC's ~2-epoch window.

---

## Inputs (from auditor)

* **Wallet address** — the audited depositor.
* **Viewing key** — bigint. Auto-detect format on input: hex with `0x`,
  decimal bigint string, or base58 32-byte.
* **VK level** — where the supplied key actually sits in the hierarchy.
  Mandatory. One of: `master / mint / yearly / monthly / daily / hourly /
  minute / second`. Defaults to null in the form; submit blocks until
  picked.
* **Scope** — the audit window. A discriminated union by `kind`:
  * `master` → mint (mandatory).
  * `mint` → mint.
  * `yearly` → mint + year.
  * `monthly` → mint + year + month.
  * `daily` → mint + year + month + day.
  * `hourly` → mint + year + month + day + hour.
  * `minute` → mint + year + month + day + hour + minute.
  * `second` → mint + year + month + day + hour + minute + second.

**Validation at submit:**

* `validateScope(scope)` — rejects e.g. Feb 30, hour 24.
* `validateVkLevelVsScope(vkLevel, scope)` — enforces
  `idx(vkLevel) ≤ idx(scope.kind)`. Ascending pairs (e.g. Daily key +
  Monthly window) are mathematically impossible — Poseidon is one-way.
* The mint input is shown even at master level — the master→mint Poseidon
  step needs it.

---

## Step 1 — Enumerate UTXOs via data-indexer (1 HTTP, cached)

* **Endpoint**: `GET /proxy/data-indexer/utxo?user=<wallet>&limit=1000`
  (proxied through a Next.js rewrite to
  `https://data-indexer.api.umbraprivacy.com` — same-origin to skip CORS
  preflight + keep auditor IP off the indexer access logs).
* Returns one entry per UTXO this wallet has deposited. Each entry:
  * `mint`
  * `slot`
  * `blockTime`
  * `requestTxSignature` (the create-tx OR deposit-tx, depending on flow)
  * `callbackTxSignature` (the MPC callback tx)
  * `depositor`
* **Cached** in factory closure for the entire audit session. "Load more"
  reuses the cache and walks with a `beforeSlot` cursor — no re-fetch.
* `fetchWithRetry` handles 5xx / 429 / network blips with exponential
  backoff.
* This **replaces** any `getSignaturesForAddress(wallet)` walk. Volume
  scales with **in-scope UTXOs**, not the wallet's overall tx history.

---

## Step 2 — In-memory pre-filter (zero RPC)

The cheap-by-design step that makes viewing-key scans 100–1000× cheaper
than master-seed scans.

* Drop entries where `entry.mint != scope.mint` → counted as `wrongMint`.
* Drop entries with `entry.blockTime` outside `scopeTimeRange(scope)` →
  counted as `outOfScopeTime`.
* Apply `beforeSlot` cursor — skip entries with `slot >= beforeSlot`.
* Stop assembling once `inScope.length ≥ eventLimit * 2` (overshoot
  margin: some entries will fail to decrypt; we want enough to satisfy
  `eventLimit` after losses).

Out-of-scope entries pay **zero** crypto / RPC cost.

---

## Step 3 — Batch-fetch in-scope request-txs (1 HTTP)

* One Helius JSON-RPC POST with an array of `getTransaction` calls — up
  to 100 signatures per batch. For larger N, auto-chunks at 100 and fires
  chunks via `Promise.all`.
* Returns a `Map<signature, BatchedTx>` where `BatchedTx` carries
  `meta.logMessages`.
* Helius batch endpoint counts as **one request** for billing.

---

## Step 4 — Decode Anchor event logs

* Scan each tx's `meta.logMessages` for lines matching `Program data:
  <base64>`.
* Base64-decode, take the **first 8 bytes** as the Anchor event
  discriminator.

### Discriminator math

* For each event struct name `S`, the discriminator is the first 8 bytes
  of `sha256("event:" + S)`. Computed once at module load and cached.

### Three events the portal recognizes

* **`DepositIntoStealthPoolFromPublicBalanceEventV1`** — ATA-source
  flow. Variant tag: `public_balance`. Contains **2 linkers**, plaintext
  mint, plaintext amount (`transferAmount`).
* **`DepositIntoStealthPoolFromSharedBalanceV11EventV1`** — ETA-source
  flow deposit-tx. Variant tag: mint hint only. Contains **0 linkers**;
  carries plaintext mint + `bufferOffset`. Triggers Step 5.
* **`CreateStealthPoolDepositInputBufferEventV1`** — ETA-source flow
  input-buffer-tx. Variant tag: `encrypted_balance`. Contains **3
  linkers**; the third linker is the encrypted amount. This event lives
  in a *different* transaction than the data-indexer's
  `requestTxSignature`.

### Decode method

* Codama generates borsh decoders for every event in the IDL — the
  portal uses those directly. Don't hand-roll borsh.

### Per-entry classification

* **records** — events with linkers (ATA flow, or ETA after Step 5
  succeeds).
* **hints** — events with only mint info (ETA flow, before Step 5).
* For ETA hints, compute `joinKey = "<depositor base58>:<bufferOffset>"`
  for the Step 5 record↔hint match.

---

## Step 5 — ETA fallback for hint-only entries (2 HTTPs)

The ETA-source flow splits its data across two transactions:

* **Tx A** — `create_stealth_pool_deposit_input_buffer` — emits the 3
  linker_encryptions.
* **Tx B** — `deposit_into_stealth_pool_from_shared_balance_v11` — emits
  a mint-hint event (no linkers).

The data-indexer surfaces only Tx B's signature. To reach Tx A
deterministically:

### 5a — Derive the input-buffer PDA (pure compute, no RPC)

* The `StealthPoolDepositInputBuffer` PDA is derivable from
  `(depositor, bufferOffset)` — both come from Tx B's hint event payload.
* **Seeds**:
  1. A 32-byte seed prefix — copy-pasted from codama's instruction
     generator at
     `umbra-codama/src/instructions/depositIntoStealthPoolFromSharedBalanceV11.ts:461-465`.
     If the Umbra program is ever redeployed with a different
     `[seeds(...)]` macro, regenerate this prefix from the new codama
     output.
  2. The depositor address bytes — encoded via `getAddressEncoder()`
     from `@solana/kit`.
  3. The `bufferOffset` — encoded as a **16-byte little-endian u128**
     via `getAccountOffsetEncoder()` from `@umbra-privacy/umbra-codama`.
* PDA derived via `getProgramDerivedAddress` from `@solana/kit`, with
  `programAddress = UMBRA_PROGRAM_ADDRESS` (also from
  `@umbra-privacy/umbra-codama`).

### 5b — Batched signature list (1 HTTP)

* `getSignaturesForAddress(bufferPda, limit: 5)` for every ETA-pending
  entry, in one Helius batch call.
* Buffer PDAs only ever see 2–3 signatures total (create, use, maybe
  close). No `before` cursor — we want the whole history of the PDA so
  the create-tx is findable even if older than the deposit.
* **Closed-buffer audits work**: the PDA is closed by the deposit
  instruction (rent refunded), but `getSignaturesForAddress` queries the
  tx-history index, which is independent of account state. Helius
  archive depth is what makes this reachable for older audits — vanilla
  Solana public RPC truncates sig history at ~2 epochs.

### 5c — Batched transaction fetch (1 HTTP)

* For each PDA's sig list, drop the known `requestTxSignature` (Tx B,
  already fetched in Step 3). What remains contains Tx A.
* Dedupe the candidate sigs across all ETA entries.
* One batched `getTransaction` call covers every candidate.

### 5d — Match hint ↔ record

* Decode each candidate tx's logs. Build a map
  `joinKey → CreateStealthPoolDepositInputBufferEventV1 record`.
* For each pending entry, look up by `joinKey =
  "<depositor>:<bufferOffset>"`. Promote `hint` → `event` on match;
  count `decryptionFailed` on miss.

This deterministic path replaces an older heuristic that walked the
depositor's last 5 sigs and broke when unrelated wallet activity
interleaved between create and deposit.

---

## Step 6 — TVK descent + Poseidon decrypt (pure compute)

### Poseidon viewing-key hierarchy

The Umbra protocol defines a Poseidon-keyed hierarchy rooted at the
master seed:

```
MVK     = bigint                                     (master viewing key, root)
h_mint  = Poseidon([MVK,    mint_low_u128, mint_high_u128])  ← MintViewingKey
h_year  = Poseidon([h_mint, year])                           ← YearlyViewingKey
h_month = Poseidon([h_year, month])                          ← MonthlyViewingKey
h_day   = Poseidon([h_month,day])                            ← DailyViewingKey
h_hour  = Poseidon([h_day,  hour])                           ← HourlyViewingKey
h_min   = Poseidon([h_hour, minute])                         ← MinuteViewingKey
h_sec   = Poseidon([h_min,  second])                         ← SecondViewingKey ≡ TVK
```

Properties:

* Master → Mint takes **3 inputs** (parent + two U128 halves of the mint
  address).
* Every other level takes **2 inputs** (parent + one integer time
  component).
* Each step is a one-way Poseidon hash. Child keys can derive
  descendants but not parents or siblings.
* Output is a `Bn254FieldElement` — the BN254 scalar field, prime
  `p ≈ 2^254`. Specifically, the master viewing key is masked to 252
  bits to satisfy ZK-circuit bit-length constraints.

### Descent algorithm

* Convert event timestamp:
  `unixSecondsToUtc(event.insertionTimestampSec)` →
  `{ year, month, day, hour, minute, second }` (UTC).
* Anchor the descent at `vkLevel` (the level the supplied key sits at).
* If `vkLevel === "master"`, apply the 3-input master→mint step using
  `scope.mint` (split into U128 halves — see address split math below).
  Re-anchor descent index to "mint".
* For each level strictly **below** the (re-anchored) starting level,
  apply the 2-input Poseidon hash with the event's coordinate for that
  level: year, then month, then day, …, down to second.
* The final result is the per-UTXO TVK.

**Off-by-one footgun**: descend strictly below (`<`), never at-or-below
(`<=`). Hashing AT the supplied level re-derives a level the auditor's
key already encodes — silent garbage TVK and garbage decrypts.

### Address split math (master→mint step)

A Solana address is 32 bytes. The split:

* `low  = bytes[0..16]   interpreted as little-endian U128`
* `high = bytes[16..32]  interpreted as little-endian U128`

Reassembly is the inverse — see Step 7.

### Number of Poseidon hashes per level

* **master**  → 7 hashes (mint, year, month, day, hour, minute, second).
* **mint**    → 6 hashes (year, month, day, hour, minute, second).
* **yearly**  → 5 hashes.
* **monthly** → 4 hashes.
* **daily**   → 3 hashes.
* **hourly**  → 2 hashes.
* **minute**  → 1 hash.
* **second**  → 0 hashes (already TVK).

### Poseidon stream cipher math

The linker ciphertexts are encrypted with a Poseidon-PRF stream cipher
keyed directly by the TVK. No KDF, no envelope, no AES.

```
keystream[i]  = Poseidon([TVK, counter_i, 2n])  mod p
ciphertext[i] = (plaintext[i]  + keystream[i])  mod p
plaintext[i]  = (ciphertext[i] - keystream[i])  mod p
```

* `p ≈ 2^254` (BN254 scalar field).
* `2n` is a protocol-level domain-separation constant for the Poseidon
  evaluation point.
* All arithmetic is field-modular addition / subtraction on
  `Bn254FieldElement`.

### Counter assignment per variant

* **`public_balance` (ATA)** — counter 0 = `destinationAddressLow`,
  counter 1 = `destinationAddressHigh`. Amount comes from the event's
  plaintext `transferAmount`; **no third linker**.
* **`encrypted_balance` (ETA)** — counter 0 = `destinationAddressLow`,
  counter 1 = `destinationAddressHigh`, counter 2 = `amount` (U64).

### Decrypt step

* Convert each 32-byte LE linker_encryption to a `bigint`.
* Validate via `assertPoseidonCiphertext` (each must be < p).
* Validate the TVK via `assertPoseidonKey`.
* Call `getPoseidonDecryptor()` from `@umbra-privacy/sdk` with
  `(linkers, BigInt(tvk))`.
* Output: `[destLow, destHigh]` (ATA) or `[destLow, destHigh, amount]`
  (ETA), each as `Bn254FieldElement` bigints.

---

## Step 7 — Validate + finalize each record

### Destination address reassembly

Inverse of the split used in Step 6's master→mint step:

```
bytes = new Uint8Array(32)
for i in 0..16:  bytes[i]      = (destLow  >> (8 * i)) & 0xff   ← low half, LE
for i in 0..16:  bytes[16 + i] = (destHigh >> (8 * i)) & 0xff   ← high half, LE
address = base58(bytes)
```

Implemented via `getAddressDecoder` from `@solana/kit`.

### Mint precedence (defense-in-depth — indexer is untrusted)

1. `chainMint` — from the data-indexer entry (handler-table column;
   authoritative on-chain value).
2. `event.publicMintAddress` — from the ATA deposit-tx event (plaintext
   on-chain).
3. `scope.mint` — auditor input (least trusted; the auditor could have
   guessed or been misled).

Always prefer the highest-priority source available.

### Amount source

* **ATA flow** → `event.transferAmount` (plaintext on the event; matches
  the on-chain transfer).
* **ETA flow** → `plaintexts[2]` (decrypted from the third linker).

### Wrong-VK detection — heuristic only, no auth tag

Poseidon stream cipher has **no authentication tag**. Wrong-key decrypts
return field-element-sized garbage silently.

The SDK writes `keystreamCommitments` to each event for crisp
authentication, but the commitment's blinding factor is master-seed-bound
(`getPoseidonKeystreamBlindingFactorDeriver` calls
`client.masterSeed.getMasterSeed()`). An auditor with only a viewing key
**cannot recompute it**.

The portal's heuristic — `plaintextsLookValid`:

* `destLow  < 2^128`
* `destHigh < 2^128`
* `amount   < 2^64`

Wrong-VK decrypts produce values larger than these bounds with
overwhelming probability. The page surfaces a "wrong viewing key likely"
warning when `looksBogus / decrypted > 0.5` (≥ 3 sample). Bogus rows are
dropped from the final results table entirely.

### Direction label

Derived from two facts:

* **Source variant** — `ATA` if event was `public_balance`, `ETA` if
  `encrypted_balance`.
* **Destination identity** — `(audited wallet == decrypted destination)?`.

Composed: `ATA→ATA / ATA→ETA / ETA→ATA / ETA→ETA`.

### Important fact: encryption keying for both flows

Both **self-claimable AND receiver-claimable** UTXOs encrypt the linker
ciphertexts with the **sender's TVK** (not the recipient's). Verified
against SDK source — `self-utxo-encrypted.ts:952` and
`receiver-utxo-encrypted.ts:860` are identical.

Implication: an auditor with the sender's viewing key decrypts every
UTXO that wallet created — both self-burns AND receiver-claimable
transfers to other people.

---

## Step 8 — Return + paginate

* Stop after `eventLimit` **decrypted records** (default 10) — not
  `eventLimit` *attempts*. Failed decrypts don't count.
* Return shape:
  * `transactions[]` — final `DecryptedUtxoTransaction` records.
  * `oldestSlot` — slot of the oldest in-scope entry processed this
    batch.
  * `hasMore` — true iff stopped because `eventLimit` was reached.
  * Plus full `ScanProgress` counters: `indexerCount`, `inScopeCount`,
    `batchesFetched`, `eventsFound`, `decrypted`, `decryptionFailed`,
    `wrongMint`, `outOfScopeTime`, `looksBogus`.
* Pagination — caller passes `beforeSlot = oldestSlot` on the next
  `scan()` call. Cached indexer entries are walked from `beforeSlot`
  downward; everything above is already in the UI.

---

## RPC volume profile

For a wallet with 50 in-scope UTXOs (~25 ETA, ~25 ATA):

* **Paid Helius (batched)** — 4 HTTP round-trips, ~600 ms total:
  * 1 indexer fetch
  * 1 batched request-tx fetch
  * 1 batched buffer-PDA sig-list fetch
  * 1 batched candidate-tx fetch
* **Free Helius (parallel-singles fallback)** — same shape, ~200
  individual HTTPs, ~40 s wall-clock at 5 concurrent / 200 ms interval
  (≈ 5 RPS aggregate, safely under Helius free's 10 RPS cap with
  headroom for retries).

Volume scales with **in-scope UTXOs**, not the wallet's overall
signature history.

For very large N (1000+ in-scope) on paid plans, batches chunk at the
Helius 100-call cap and parallelize via `Promise.all` — total wall-clock
bounded by a single chunk's round-trip (~150–300 ms), not N × per-call.

---

## Free-tier Helius detection

Helius free plans reject batched JSON-RPC arrays with **HTTP 403**
carrying a JSON-RPC error body — code `-32403`, message "Batch requests
are only available for paid plans."

* **Important**: the error arrives as a non-200 response (HTTP 403), not
  as a successful 200 with an error payload. Naive code that throws on
  any non-OK status will retry indefinitely.
* The portal parses the body on any non-OK status before deciding
  between throw and fallback.
* On detection, latch a module-level flag `batchKnownUnsupported = true`
  and route every subsequent call through `postParallelSingles`:
  * Each `getTransaction` / `getSignaturesForAddress` becomes its own
    POST body.
  * Dispatched through a token-bucket limiter — 5 concurrent + 200 ms
    minimum interval.
  * Same `BatchedTx` / `BatchedSigRecord` result shape; public APIs
    unchanged.
  * Existing 5xx / 429 / network exponential backoff still applies.

---

## Critical rules / footguns

1. **Never plan a `getSignaturesForAddress(walletAddress)` walk for
   primary enumeration.** The data-indexer's `/utxo?user=` endpoint
   replaces it — one HTTP call replaces walking thousands of unrelated
   wallet txs.
2. **Don't use `UmbraClient` for the auditor.** It requires a signer and
   eagerly derives a master seed by default. The auditor doesn't have
   one. Use SDK primitives — Poseidon hasher, decryptor, address splitter
   — directly.
3. **TVK descent off-by-one — use `<` not `<=`.** Hashing AT the
   auditor's level re-derives what the key already encodes; produces
   garbage TVK silently.
4. **Mint scope is mandatory at master level.** No mint, no master→mint
   3-input Poseidon step, no descent. Show the mint input even at master
   level.
5. **VK level ≤ scope kind, ordered.** Ascending pairs (Daily key +
   Monthly window) are mathematically impossible; reject at submit.
6. **Buffer PDA seed prefix is hand-extracted from codama output.** If
   the Umbra program is ever redeployed with a different `[seeds(...)]`
   macro, the 32-byte prefix becomes stale. Regenerate from the new
   codama output.
7. **Helius free tier returns `-32403` on HTTP 403, not 200.** Parse
   the body on non-OK status before throwing or retrying. If free-tier
   path retries indefinitely, this is the bug.
8. **Don't trust `scope.mint` for display.** Authoritative chain mint
   beats it; document the precedence (chainMint > event.publicMintAddress
   > scope.mint).
9. **No crisp wrong-VK signal — heuristics only.** Bounds check on
   decrypted plaintexts (U128 + U64); surface a warning at >50% bogus;
   drop bogus rows from the table.
10. **Viewing key in URL/query strings is a leak.** Body-only on POST,
    never logged. Document; can't enforce in code.
11. **The data-indexer is UNTRUSTED.** A malicious indexer can serve
    fabricated entries. Defenses: chain-mint stays authoritative through
    the pipeline; bounds heuristic catches malformed payloads. Crisp
    decrypt authentication needs `keystreamCommitment` recompute, which
    requires master-seed access — out of scope for the read-only portal.
12. **No claim-side / receiver discovery in v1.** The data-indexer's
    `/utxo?user=` enumerates by depositor. UTXOs sent **to** the audited
    wallet by other people are not surfaced. Out of scope; document.
13. **No on-chain account state reads.** Input-buffer PDAs are closed by
    their deposit instruction. `getAccountInfo` returns null. Sig-history
    is the only post-deposit handle on the buffer.
14. **No `/v0/transactions/` Enhanced REST endpoint.** Free tier excludes
    it; the parsed format omits `meta.logMessages` for unknown programs
    (Umbra mainnet). Plain JSON-RPC `getTransaction` is the only path
    that returns the raw logs we need for Anchor event parsing.

---

## Codama in the portal — what it provides, what we do with it

`@umbra-privacy/umbra-codama` is the codegen output from Umbra's public
Anchor IDL, produced by [Codama](https://github.com/codama-idl/codama).
The portal uses four pieces of it:

1. **`UMBRA_PROGRAM_ADDRESS`** — the Umbra program ID, used as
   `programAddress` in PDA derivation.
2. **`getAccountOffsetEncoder()`** — encodes the `bufferOffset` (a u128
   wrapped in a struct `{ first: bigint }`) as little-endian 16 bytes,
   matching the on-chain seed format. Used in
   `deriveStealthPoolDepositInputBufferPda`.
3. **The 32-byte seed prefix** for `StealthPoolDepositInputBuffer` — not
   re-exported as a constant, but visible in the codama-generated
   instruction file
   (`instructions/depositIntoStealthPoolFromSharedBalanceV11.ts:461-465`).
   The portal copies it into `derive-buffer-pda.ts` as a `Uint8Array`
   literal. Copy-pasted from generated source means stale on program
   redeploy — regenerate from new codama output.
4. **Per-event borsh decoders** for the three Anchor events the portal
   recognizes. These are the canonical, IDL-derived decoders — using
   them means the portal automatically tracks IDL changes when the
   codama package version bumps.

What the portal does **not** use from codama:

* Per-instruction builders — the portal never sends instructions; it's
  read-only.
* On-chain account decoders — the portal never calls `getAccountInfo`
  on Umbra accounts.

---

## Cross-references

* Encryptor side proving sender-side TVK encryption for both variants:
  * `ts-sdk/sdk/src/deposit/self-utxo-encrypted.ts:952`
  * `ts-sdk/sdk/src/deposit/receiver-utxo-encrypted.ts:860`
* Anchor event source structs:
  * `anchor-program/programs/umbra/src/instructions/deposit_into_stealth_pool/from_public_associated_token_account/deposit.rs`
  * `anchor-program/programs/umbra/src/instructions/deposit_into_stealth_pool/from_encrypted_token_account/{input_buffer,deposit}.rs`
* Buffer PDA seed source:
  * `ts-sdk/umbra-codama/src/instructions/depositIntoStealthPoolFromSharedBalanceV11.ts:457-470`
* Indexer route source:
  * `rs-services/utxo-indexer/onchain-data-indexer/api/src/main.rs:951-1007`
* JSON-RPC batching spec:
  * https://www.jsonrpc.org/specification#batch — Helius supports up to
    100 calls per array.
* Public packages (all MIT):
  * `@umbra-privacy/sdk`
  * `@umbra-privacy/umbra-codama`
  * `@solana/kit`
