# Divine POS — Developer Guide

## Overview

Divine POS is a web-based Point of Sale system built with React Native Web + Expo. It runs as a single-page application (SPA) in the browser — there is no native mobile app. It includes a POS interface, an admin backend panel, and a customer-facing online storefront.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 + React Native Web | UI framework |
| Expo 50 | Build tooling (web-only) |
| TypeScript (strict) | Type safety |
| simpler-state | Global state management |
| Firebase (compat API) | Auth, Firestore, Storage, RTDB, Functions |
| React Router DOM v5 | Client-side routing (NOT v6) |
| QZ Tray | Thermal receipt printing |
| Stripe | Subscription billing & online payments |
| WooCommerce REST API | E-commerce integration (polling) |
| Recharts | Dashboard analytics charts |

---

## Project Structure

```
Divine POS/
├── App.tsx                         # Entry point (wraps with AlertProvider)
├── router/
│   ├── Router.tsx                  # Main router + app bootstrap (auth, data loading, WooCommerce polling, print listener)
│   ├── NavigationContent.tsx       # Subscription gating (trial, payment, canceled)
│   ├── AuthRoute.tsx               # Protected routes (/pos, /authed)
│   └── PublicRoute.tsx             # Public routes (login, signup, online store)
│
├── features/
│   ├── auth/                       # Login, Signup, ResetPassword
│   ├── pos/                        # POS interface
│   │   ├── PosScreen.tsx           # Main POS screen
│   │   └── components/
│   │       ├── Products/           # Product grid, categories
│   │       ├── Cart/               # Cart, CartItem, checkout
│   │       ├── ProductBuilder/     # Product option selection modal
│   │       └── CartMobile.tsx      # Mobile cart layout
│   ├── admin/                      # Backend admin panel
│   │   ├── AdminContainer.tsx      # Admin layout with sidebar navigation
│   │   ├── dashboard/              # Analytics, charts, stats
│   │   ├── products/               # Product CRUD, categories, options
│   │   ├── reports/                # Invoices, employees, time tracking
│   │   ├── settings/               # Store config, devices, online store
│   │   └── help/                   # Help page
│   └── online-store/               # Customer-facing storefront
│       ├── OrderPage.tsx           # Storefront router
│       ├── pages/                  # StoreFront, Order, Pickup, Delivery, Checkout, Completed
│       └── components/             # DeliveryDetails, CheckOutDetails, FieldInput
│
├── shared/
│   ├── components/
│   │   ├── ui/                     # InputWithLabel, Switch, Dropdowns, Loader, ProductImage
│   │   ├── header/                 # Header, LogoutDropdown
│   │   ├── modals/                 # All modal dialogs
│   │   │   ├── AuthModal.tsx
│   │   │   ├── CashPaymentModal.tsx
│   │   │   ├── PhoneOrderModal.tsx
│   │   │   ├── PendingOrdersModal/ # Pending orders + KitchenView
│   │   │   ├── DiscountModal/
│   │   │   ├── ClockInModal/
│   │   │   └── SavedCustomersModal/
│   │   └── billing/                # NewUserPayment, TrialEnded, PaymentUpdateNotification
│   └── hooks/
│       └── useInterval.ts          # Polling interval hook
│
├── services/
│   ├── firebase/
│   │   ├── config.ts               # Firebase init, auth, db, storage exports
│   │   └── functions.ts            # All Firebase operations (signIn, signUp, updateStats, etc.)
│   ├── printing/
│   │   └── receiptPrint.tsx        # QZ Tray receipt formatting & printing
│   └── woocommerce/                # WooCommerce integration (handled in Router.tsx)
│
├── store/
│   ├── appState.ts                 # All global state entities (cart, products, customers, etc.)
│   └── posState.ts                 # POS-specific UI state (modals, section, delivery fields)
│
├── types/
│   ├── index.ts                    # All TypeScript types
│   ├── global.ts                   # Legacy types (committed version)
│   └── images.d.ts                 # Module declarations
│
├── utils/
│   ├── cartCalculations.ts         # SINGLE SOURCE OF TRUTH for cart math
│   ├── dateFormatting.ts           # parseDate()
│   ├── generateId.ts              # generateId()
│   ├── googlePlacesStyles.ts       # Google Places autocomplete styles
│   ├── scrollToTop.ts             # Scroll restoration
│   └── searchFilters.ts           # Search/filter helpers
│
└── functions/                      # Firebase Cloud Functions (server-side)
    └── index.mjs
```

---

## 3 Main Routes

| Route | Purpose | Entry Component |
|---|---|---|
| `/pos` | POS interface for cashiers | `PosScreen.tsx` |
| `/authed` | Backend admin panel | `AdminContainer.tsx` |
| `/order/:urlEnding` | Customer online storefront | `OrderPage.tsx` |

Public routes: `/log-in`, `/sign-up`, `/reset-password`

---

## App Bootstrap Flow

When the app loads (`Router.tsx`):

1. Firebase auth state listener fires
2. If authenticated:
   - Load fonts (Expo vector icons)
   - Fetch user doc from Firestore
   - Load products, categories, employees, customers, devices, subscriptions
   - Check subscription status (active, canceled, trial)
   - Set up device ID from cookie
   - Start WooCommerce polling (if enabled, every 10s)
   - Start print request listener (QZ Tray)
3. `NavigationContent.tsx` gates access:
   - Trial ended? → Show `TrialEnded`
   - New user? → Show `NewUserPayment` (Stripe)
   - Canceled? → Show `PaymentUpdateNotification`
   - Otherwise → Show `AuthRoute` (POS + Admin)

---

## State Management (simpler-state)

All state lives in `store/appState.ts` and `store/posState.ts`. Uses the `entity()` pattern from simpler-state.

### Key State Entities

```
appState.ts:
  cartState              → CartItemProp[]           (shopping cart)
  storeProductsState     → { products, categories } (product catalog)
  storeDetailsState      → StoreDetailsProps         (store config)
  customersState         → CustomerProp[]            (saved customers)
  employeesState         → Employee[]                (staff)
  deviceState            → MyDeviceDetailsProps       (current device)
  deviceTreeState        → { devices, extraDevicesPayingFor }
  trialDetailsState      → { endDate, hasEnded }
  wooCommerceState       → { apiUrl, ck, cs, useWoocommerce }
  onlineStoreState       → { urlEnding, active, stripeKeys, paidStatus }
  transListState         → TransListStateItem[]       (completed orders)
  settingsAuthState      → boolean                    (manager auth)
  productBuilderState    → { product, isOpen, ... }
  orderDetailsState      → { date, total, method, customer, cart, page }

posState.ts:
  posState               → POS UI state (modals, section, delivery fields, etc.)
```

### Usage Pattern
```typescript
// Read state (in component)
const cart = cartState.use();

// Update state
setCartState(newCart);           // full replace
updatePosState({ section: "Pizza" }); // partial merge
resetPosState();                 // reset to defaults
```

---

## Firestore Database Structure

```
/users/{uid}
  ├── storeDetails          (store config object)
  ├── categories            (string array)
  ├── wooCredentials        (WooCommerce API keys)
  ├── freeTrial             (Timestamp or null)
  ├── products/{docId}      (product catalog)
  ├── customers/{docId}     (saved customers)
  ├── employees/{docId}     (staff with pins)
  ├── devices/{docId}       (registered devices)
  │   └── printRequests/{docId}  (queued print jobs)
  ├── subscriptions/{docId} (Stripe subscription status)
  ├── transList/{docId}     (completed transaction history)
  ├── pendingOrders/{docId} (in-progress orders)
  ├── stats/monthly         (aggregated analytics)
  └── wooOrders/{docId}     (synced WooCommerce orders)

/public/{uid}
  ├── urlEnding, storeDetails, onlineStoreActive, onlineStoreSetUp
```

---

## Cart Math

**Always use `calculateCartTotals()` from `utils/cartCalculations.ts`** — this is the single source of truth.

```typescript
calculateCartTotals(
  cart: CartItemProp[],
  taxRate: string,           // e.g. "13" for 13%
  deliveryPrice: string,     // e.g. "5.00"
  includeDelivery: boolean
): { itemsSubtotal, deliveryFee, subtotal, tax, total }
```

---

## Printing System

1. **QZ Tray** — desktop thermal printer via helper app
2. Print requests flow:
   - POS completes order → calls `receiptPrint()` → formats ESC/POS commands
   - If `useDifferentDeviceToPrint` → writes to Firestore `printRequests` collection
   - Target device's `Router.tsx` listener picks it up → sends to QZ Tray → deletes request
3. WooCommerce orders auto-print when `printOnlineOrders` is enabled

---

## Subscription & Billing

- Stripe subscriptions with roles: "Pos Software Plan", "Premium Plan", "Online Store", "Extra Device", "Test Plan"
- Free trial: 1 month (Firestore timestamp)
- Owner override: `OWNER_OVERRIDE_UID` gets 3 free extra devices
- `NavigationContent.tsx` gates all access based on subscription status

---

## Multi-Device Support

- Cookie-based device ID (`deviceID` cookie)
- Each device registered in Firestore `/users/{uid}/devices/{docId}`
- Devices can be configured for:
  - Direct printing (QZ Tray on same machine)
  - Remote printing (send to another device's print queue)
  - Auto-print online orders

---

## Key Patterns

1. **Firebase Compat API** — use `firebase.firestore()` style, NOT modular imports
2. **React Router v5** — use `<Route>`, `<Switch>`, NOT v6 patterns
3. **Styling** — React Native `StyleSheet.create()` + inline styles (no CSS files)
4. **Lazy Loading** — Major route components use `React.lazy()` + `Suspense`
5. **Product Options** — Single/multi-select with price increases, conditionals, required fields
6. **Offline Support** — Firestore persistence enabled with multi-tab detection

---

## NPM Scripts

```bash
npm start              # expo start --web
npm run web            # expo start --web (with openssl legacy)
npm run build          # Build + deploy to Firebase Hosting
npm run functionsDeploy  # Deploy Cloud Functions only
```

---

## Common Gotchas

- `taxRate` is a **string** (e.g. "13"), not a number — always `parseFloat()` before math
- `firebase.firestore.Timestamp` (client) vs `@google-cloud/firestore Timestamp` (server) — different types
- Cart items matched by `name + options + extraDetails`, NOT by ID
- `window.location.reload()` should never be called in state update functions
- Device ID comes from browser cookie, not Firebase auth
- WooCommerce polling runs every 10s in Router.tsx when enabled
