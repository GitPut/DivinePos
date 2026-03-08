# Divine POS — Developer Guide

## Overview

Divine POS is a web-based Point of Sale system built with React 18 + Vite. It runs as a single-page application (SPA) in the browser — there is no native mobile app. It includes a POS interface, an admin backend panel, and a customer-facing online storefront.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework + build tooling |
| TypeScript (strict) | Type safety |
| simpler-state | Global state management |
| Firebase (compat API) | Auth, Firestore, Storage, RTDB, Functions |
| React Router DOM v5 | Client-side routing (NOT v6) |
| QZ Tray | Thermal receipt printing |
| Stripe | Subscription billing & online payments |
| WooCommerce REST API | E-commerce integration (polling) |
| Recharts | Dashboard analytics charts |
| react-icons | All icons (fi, io5, md, fa, sl) |

---

## Project Structure

```
Divine POS/
├── src/
│   ├── main.tsx                       # Vite entry point
│   └── global.css                     # Global CSS + @font-face
├── index.html                         # Vite HTML entry
├── vite.config.ts                     # Vite config (path aliases, node polyfills)
├── App.tsx                            # Root component (wraps with AlertProvider)
│
├── router/
│   ├── Router.tsx                     # Main router + app bootstrap
│   ├── NavigationContent.tsx          # Subscription gating
│   ├── AuthRoute.tsx                  # Protected routes (/pos, /authed)
│   └── PublicRoute.tsx                # Public routes (login, signup, online store)
│
├── features/
│   ├── auth/                          # Login, Signup, ResetPassword
│   ├── pos/                           # POS interface
│   │   ├── PosScreen.tsx              # Main POS screen
│   │   └── components/
│   │       ├── Products/              # ProductsSection, CategorySection, ItemContainer
│   │       ├── Cart/                  # Cart, CartItem, CartAmountRow, print.ts
│   │       ├── ProductBuilder/        # Product option selection modal
│   │       ├── Tables/                # TableFloorView, TableCard, TableCartHeader, OpenTableModal
│   │       └── CartMobile.tsx         # Mobile cart layout
│   ├── admin/                         # Backend admin panel
│   │   ├── AdminContainer.tsx         # Admin layout with sidebar navigation
│   │   ├── dashboard/                 # Analytics, charts, stats
│   │   ├── products/                  # Product CRUD, categories, options
│   │   ├── reports/                   # Invoices, employees, time tracking
│   │   ├── settings/                  # Store config, devices, tables, online store
│   │   └── help/                      # Help page
│   └── online-store/                  # Customer-facing storefront
│       ├── OrderPage.tsx              # Storefront router
│       ├── pages/                     # StoreFront, Order, Pickup, Delivery, Checkout, Completed
│       └── components/                # DeliveryDetails, CheckOutDetails, FieldInput
│
├── shared/
│   ├── components/
│   │   ├── ui/                        # Modal, InputWithLabel, Switch, Dropdowns, Loader, ProductImage
│   │   ├── header/                    # Header, LogoutDropdown
│   │   ├── modals/                    # All modal dialogs
│   │   │   ├── AuthModal.tsx
│   │   │   ├── CashPaymentModal.tsx
│   │   │   ├── PhoneOrderModal.tsx
│   │   │   ├── PendingOrdersModal/    # Pending orders + KitchenView
│   │   │   ├── DiscountModal/
│   │   │   ├── ClockInModal/
│   │   │   └── SavedCustomersModal/
│   │   └── billing/                   # NewUserPayment, TrialEnded, PaymentUpdateNotification
│   └── hooks/
│       ├── useWindowSize.ts           # Window dimensions hook
│       └── useInterval.ts            # Polling interval hook
│
├── services/
│   ├── firebase/
│   │   ├── config.ts                  # Firebase init, auth, db, storage exports
│   │   └── functions.ts              # All Firebase operations
│   ├── printing/
│   │   └── receiptPrint.tsx           # QZ Tray receipt formatting & printing
│   └── woocommerce/                   # WooCommerce integration
│
├── store/
│   ├── appState.ts                    # All global state entities
│   └── posState.ts                    # POS-specific UI state
│
├── types/
│   ├── index.ts                       # All TypeScript types
│   ├── global.ts                      # Legacy types
│   └── images.d.ts                    # Module declarations
│
├── utils/
│   ├── cartCalculations.ts            # SINGLE SOURCE OF TRUTH for cart math
│   ├── dateFormatting.ts              # parseDate()
│   ├── generateId.ts                  # generateId()
│   ├── resolveOptionPrice.ts          # Product option price resolution
│   ├── googlePlacesStyles.ts          # Google Places autocomplete styles
│   ├── scrollToTop.ts                # Scroll restoration
│   └── searchFilters.ts              # Search/filter helpers
│
└── functions/                         # Firebase Cloud Functions (server-side)
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
  tablesState            → Table[]                    (table definitions)
  tableSectionsState     → string[]                   (table sections)

posState.ts:
  posState               → POS UI state (modals, section, delivery fields, table state, etc.)
```

### Usage Pattern
```typescript
// Read state (in component)
const cart = cartState.use();

// Read state outside component (non-reactive)
const cart = cartState.get();

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
  └── products/{docId}      (public product data for online store)
```

---

## Cart Math

**Always use `calculateCartTotals()` from `utils/cartCalculations.ts`** — this is the single source of truth. Never compute cart totals inline.

```typescript
import { calculateCartTotals } from "utils/cartCalculations";

calculateCartTotals(
  cart: CartItemProp[],
  taxRate: string,              // e.g. "13" for 13%
  deliveryPrice: string,        // e.g. "5.00"
  includeDelivery: boolean,
  discountAmount?: string | null // e.g. "5%", "10", null
): CartTotals

interface CartTotals {
  itemsSubtotal: number;  // sum of item prices × quantities
  deliveryFee: number;     // delivery fee if included
  discount: number;        // computed discount amount
  subtotal: number;        // after delivery + discount, before tax
  tax: number;
  total: number;           // final amount
}
```

---

## Table Ordering

Dine-in table management system:

1. **Table Setup**: Admin configures tables in Settings → Table Settings (name, number, capacity, section)
2. **Table Floor View**: Visual grid of tables grouped by section, showing occupied/available status
3. **Opening a Table**: Select an empty table → enter guest count + optional server name → creates a `pendingOrder` with `method: "tableOrder"`
4. **Table Sessions**: Each open table has a cart that auto-saves to Firestore on changes
5. **Switching Tables**: Saves current cart, loads the target table's cart
6. **Completing**: Close table via pending orders → processes payment

Key state:
- `tablesState` — table definitions (from Firestore)
- `posState.activeTableId` — currently selected table
- `posState.activeTableSessionId` — pending order ID for active table
- `posState.tableViewActive` — whether table floor view is shown
- `posState.ongoingListState` — all active table sessions (TransListStateItem[])

---

## Delivery Platform Integration

Third-party delivery platform orders (DoorDash, Uber Eats, Skip The Dishes, Grubhub):

- Orders stored in `pendingOrders` with `deliveryPlatform` field
- Visual indicators with brand colors in PendingOrderItem
- Platform-specific labels in PendingOrdersModal and receipts
- Auto-printed when `printOnlineOrders` is enabled

---

## Printing System

1. **QZ Tray** — desktop thermal printer via helper app
2. Print requests flow:
   - POS completes order → calls `receiptPrint()` → formats ESC/POS commands
   - If `useDifferentDeviceToPrint` → writes to Firestore `printRequests` collection
   - Target device's `Router.tsx` listener picks it up → sends to QZ Tray → deletes request
3. WooCommerce and online orders auto-print when `printOnlineOrders` is enabled

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

1. **Firebase Compat API** — use `db.collection("users").doc(uid)` style, NOT modular imports
2. **React Router v5** — use `<Route>`, `<Switch>`, NOT v6 patterns
3. **Styling** — plain `Record<string, React.CSSProperties>` objects + inline styles (no CSS-in-JS libraries)
4. **Lazy Loading** — Major route components use `React.lazy()` + `Suspense`
5. **Product Options** — Single/multi-select with price increases, conditionals, required fields
6. **Offline Support** — Firestore persistence enabled with multi-tab detection
7. **Product Filtering** — Uses `useMemo` for filtering products/categories by search and category (no DOM manipulation)
8. **Custom Modal** — `shared/components/ui/Modal.tsx` (replaced react-native-modal-web)
9. **Icons** — `react-icons` library (FiEdit, MdCancel, etc.)

---

## NPM Scripts

```bash
npm run dev            # vite (dev server)
npm run build          # vite build (production → dist/)
npm run preview        # vite preview (serve production build)
```

---

## Common Gotchas

- `taxRate` is a **string** (e.g. "13"), not a number — always `parseFloat()` before math
- `firebase.firestore.Timestamp` (client) vs `@google-cloud/firestore Timestamp` (server) — different types
- Cart items matched by `name + options + extraDetails`, NOT by ID
- `window.location.reload()` should never be called in state update functions
- Device ID comes from browser cookie, not Firebase auth
- WooCommerce polling runs every 10s in Router.tsx when enabled
- Cart totals must use `calculateCartTotals()` — never compute inline
- Variable naming follows camelCase for setters (e.g. `setCartOpen`, `setSearchQuery`)
