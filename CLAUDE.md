# Divine POS — Claude Code Instructions

## What This Project Is
Web-based Point of Sale system. Plain React 18 + Vite (browser SPA only, no native mobile). Firebase backend, Stripe billing, QZ Tray printing, WooCommerce integration.

## Tech Stack (DO NOT deviate)
- React 18 + Vite (plain HTML elements — NO React Native Web)
- TypeScript strict
- **simpler-state** for global state (NOT Redux, NOT Context)
- **Firebase compat API** (NOT modular imports)
- **React Router DOM v5** (NOT v6 — no `useNavigate`, no `<Routes>`)
- QZ Tray for receipt printing
- Stripe for subscriptions

## Project Structure
```
features/{auth,pos,admin,online-store}  — Feature modules
shared/components/{ui,header,modals,billing} — Shared UI
shared/hooks/                           — Custom hooks
services/firebase/{config.ts,functions.ts} — Firebase setup & ops
services/printing/receiptPrint.tsx      — Receipt printing
store/appState.ts                       — All global state entities
store/posState.ts                       — POS-specific UI state
utils/cartCalculations.ts              — SINGLE SOURCE OF TRUTH for cart math
types/index.ts                         — All TypeScript types
router/Router.tsx                      — App bootstrap + routing
router/NavigationContent.tsx           — Subscription gating
```

## 3 Main Routes
- `/pos` → POS interface (`features/pos/PosScreen.tsx`)
- `/authed` → Admin panel (`features/admin/AdminContainer.tsx`)
- `/order/:urlEnding` → Online storefront (`features/online-store/OrderPage.tsx`)

## Key State Names (store/appState.ts)
- `cartState` — shopping cart
- `storeProductsState` — products + categories
- `storeDetailsState` — store config (name, tax, delivery, etc.)
- `customersState`, `employeesState`, `deviceState`, `deviceTreeState`
- `trialDetailsState`, `wooCommerceState`, `onlineStoreState`
- `transListState` — completed transactions
- `productBuilderState`, `orderDetailsState`, `settingsAuthState`

## Key State Names (store/posState.ts)
- `posState` — POS UI (modals, section, delivery fields, etc.)
- Use `updatePosState({...})` for partial updates, `resetPosState()` to clear

## Directories to IGNORE (auto-generated, not our code)
- `dist/` — Vite build output
- `node_modules/` — npm dependencies
- `.firebase/` — Firebase hosting cache

Never read, modify, or worry about files in these directories. They are auto-generated.

## Critical Rules
1. **Cart math**: ALWAYS use `calculateCartTotals()` from `utils/cartCalculations.ts` — never compute totals inline
2. **taxRate is a string** (e.g. "13") — always `parseFloat()` before arithmetic
3. **Firebase compat API only** — `db.collection("users").doc(uid)` pattern
4. **Auth UID**: use `auth.currentUser?.uid` with null guards — never hardcode UIDs
5. **Timestamp types**: Client uses `firebase.firestore.Timestamp`, types/index.ts has a compatible local type
6. **No window.location.reload()** in state functions
7. **Cart items have no ID** — matched by name + options + extraDetails
8. **Device ID** comes from browser cookie, not Firebase auth

## Firestore Structure
```
/users/{uid}/products/{id}       — Product catalog
/users/{uid}/customers/{id}      — Saved customers
/users/{uid}/employees/{id}      — Staff
/users/{uid}/devices/{id}        — Registered devices
/users/{uid}/devices/{id}/printRequests/{id} — Print queue
/users/{uid}/transList/{id}      — Completed transactions
/users/{uid}/pendingOrders/{id}  — In-progress orders
/users/{uid}/subscriptions/{id}  — Stripe subscriptions
/users/{uid}/stats/monthly       — Analytics
/public/{uid}                    — Public store data for online ordering
```

## Owner Override
`OWNER_OVERRIDE_UID` in `services/firebase/config.ts` = "J6rAf2opwnSKAhefbOZW6HJdx1h2" (gets 3 free extra devices)

## Common Patterns
- State: `const x = someState.use()` to read, `setSomeState(val)` to write
- Modals: lazy-loaded from `shared/components/modals/`
- Printing: `receiptPrint()` formats ESC/POS commands → QZ Tray
- WooCommerce: polled every 10s in Router.tsx

## Full Documentation
See `instructions.md` in project root for complete developer guide.
