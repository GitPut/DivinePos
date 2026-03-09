# Divine POS — Claude Code Instructions

## What This Project Is
Web-based Point of Sale system for restaurants and retail. Plain React 18 + Vite (browser SPA only, no native mobile). Firebase backend (Firestore, Auth, Storage, RTDB, Functions), Stripe billing, QZ Tray thermal receipt printing, WooCommerce integration, delivery platform webhooks. Firebase project ID: `posmate-5fc0a`.

## Tech Stack (DO NOT deviate)
- React 18 + Vite (plain HTML elements — NO React Native Web)
- TypeScript strict
- **simpler-state** for global state (NOT Redux, NOT Context)
- **Firebase compat API** (NOT modular imports — `firebase/compat/app`)
- **React Router DOM v5** (NOT v6 — no `useNavigate`, no `<Routes>`)
- QZ Tray for thermal receipt printing (ESC/POS commands)
- Stripe for subscriptions + online store payments
- react-icons (fi, io5, md, fa, sl) for all icons
- Recharts for dashboard analytics charts
- react-alert for toast notifications
- SweetAlert2 for confirmation dialogs
- react-google-places-autocomplete for address inputs
- moment-timezone for date/time handling
- Styling: plain `Record<string, React.CSSProperties>` objects + global CSS classes (NO CSS-in-JS libraries for components)

## Directories to IGNORE (auto-generated, not our code)
- `dist/` — Vite build output
- `node_modules/` — npm dependencies
- `.firebase/` — Firebase hosting cache

Never read, modify, or worry about files in these directories.

## Project Structure
```
Divine POS/
├── src/main.tsx                          # Vite entry → React root
├── src/global.css                        # Global CSS, RNW defaults, animations
├── index.html                            # HTML entry with #root mount
├── vite.config.ts                        # Aliases, node polyfills, port 3000
├── App.tsx                               # Root: AlertProvider → AppRouter
│
├── router/
│   ├── Router.tsx                        # Bootstrap: auth, data loading, listeners
│   ├── NavigationContent.tsx             # Subscription gating layer
│   ├── AuthRoute.tsx                     # Protected routes (/pos, /authed, /customer-display)
│   └── PublicRoute.tsx                   # Public routes (/log-in, /sign-up, /order/*)
│
├── features/
│   ├── auth/
│   │   ├── Login.tsx                     # Email/password login
│   │   ├── Signup.tsx                    # Account creation (name, phone, email, pw)
│   │   └── ResetPassword.tsx            # Password reset via Cloud Function
│   │
│   ├── pos/
│   │   ├── PosScreen.tsx                # Main POS: products grid + cart + sidebar
│   │   └── components/
│   │       ├── Products/
│   │       │   ├── ProductsSection.tsx  # Filtered product grid (useMemo)
│   │       │   ├── CategorySection.tsx  # Category filter pills
│   │       │   └── ItemContainer.tsx    # Product card (stock-aware, click→cart/builder)
│   │       ├── Cart/
│   │       │   ├── Cart.tsx             # Desktop cart sidebar (totals, discount, checkout)
│   │       │   ├── CartItem.tsx         # Cart row (qty controls, edit, expand options)
│   │       │   ├── CartAmountRow.tsx    # Label + amount display row
│   │       │   ├── CartMobile.tsx       # Mobile cart (modal drawer)
│   │       │   ├── CheckoutButton.tsx   # Context-aware payment buttons
│   │       │   └── print.ts            # Order lifecycle: validate→persist→print→clear
│   │       ├── ProductBuilder/
│   │       │   ├── ProductBuilderModal.tsx  # Product customization modal
│   │       │   ├── OptionDisplay.tsx        # Routes to correct option component
│   │       │   ├── DropdownOption.tsx       # Single-select dropdown (portal rendered)
│   │       │   ├── SingleSelectOptionGroup.tsx  # Pill button options
│   │       │   ├── MultiSelectOptionGroup.tsx   # Qty grid + half&half
│   │       │   ├── IncludedSelectionsGroup.tsx  # "Choose N included" options
│   │       │   ├── TableOption.tsx              # Checkbox grid option
│   │       │   ├── SingleSelectButton.tsx       # Individual pill button
│   │       │   ├── AddToCartButton.tsx          # Add/Save button with price
│   │       │   └── GoBackButton.tsx             # Back arrow button
│   │       ├── Tables/
│   │       │   ├── TableFloorView.tsx    # Table grid by section (occupied/available)
│   │       │   ├── TableCard.tsx         # Individual table (color-coded, elapsed time)
│   │       │   ├── TableCartHeader.tsx   # Active table info bar (auto-save debounce 2s)
│   │       │   ├── OpenTableModal.tsx    # Initialize table session (guests, server)
│   │       │   └── TableOrderView.tsx    # Table payment/transfer/close modal
│   │       └── LeftMenuBar.tsx           # Sidebar icons (Home, Tables, Orders, etc.)
│   │
│   ├── admin/
│   │   ├── AdminContainer.tsx           # Admin layout: sidebar (278px) + content area
│   │   ├── index.tsx                    # Admin route definitions
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx            # KPI analytics (period filter, stats aggregation)
│   │   │   ├── TotalRevenueBox.tsx      # Revenue bar chart (Recharts)
│   │   │   ├── MostOrderedItemsBox.tsx  # Top 3 products
│   │   │   ├── OrderWaitTimeBox.tsx     # Wait time metrics
│   │   │   ├── PickupOrdersBox.tsx      # Pickup stats
│   │   │   ├── DeliveryOrdersBox.tsx    # Delivery stats
│   │   │   ├── InStoreOrdersBox.tsx     # In-store stats
│   │   │   ├── CustomersBox.tsx         # New customers count
│   │   │   ├── PeriodDropdown.tsx       # Period filter (Today/Week/Month/Year/All)
│   │   │   └── BarGraph.tsx             # Recharts bar chart component
│   │   ├── products/
│   │   │   ├── ProductsPage.tsx         # Product/category router
│   │   │   ├── ProductList.tsx          # Product CRUD grid with search + filter
│   │   │   ├── CategoryList.tsx         # Category CRUD list
│   │   │   ├── AddProductModal.tsx      # Full product editor (options, image, recipe)
│   │   │   ├── ProductOptionBox.tsx     # Product card with edit/delete
│   │   │   └── ProductBuilderView.tsx   # Product preview with option pricing
│   │   ├── inventory/
│   │   │   ├── InventoryPage.tsx        # Ingredients + Stock tabs
│   │   │   ├── IngredientsTab.tsx       # Ingredient CRUD
│   │   │   └── StockLevelsList.tsx      # Product stock levels
│   │   ├── reports/
│   │   │   ├── ReportsPage.tsx          # Reports router
│   │   │   ├── Invoices.tsx             # Transaction history (pagination, search, export)
│   │   │   ├── EmployeesList.tsx        # Employee list + add modal
│   │   │   ├── EditEmployee.tsx         # Employee details, hours, permissions
│   │   │   └── ActivityLog.tsx          # Employee action audit log
│   │   ├── settings/
│   │   │   ├── SettingsPage.tsx         # Settings router
│   │   │   ├── GeneralSettings.tsx      # Store name, address, tax, delivery config
│   │   │   ├── DeviceSettings.tsx       # Multi-device management + printer config
│   │   │   ├── OnlineStoreSettings.tsx  # Online store URL, Stripe keys, product sync
│   │   │   ├── WooCommerceSettings.tsx  # WooCommerce API credentials (Pro only)
│   │   │   ├── TableSettings.tsx        # Table definitions + sections (Pro only)
│   │   │   └── BillingSettings.tsx      # Plan selection, Stripe portal
│   │   └── help/HelpPage.tsx            # Help stub
│   │
│   └── online-store/
│       ├── OrderPage.tsx                # Storefront entry: loads public store data
│       ├── pages/
│       │   ├── StoreFront.tsx           # Landing: store branding + Pickup/Delivery buttons
│       │   ├── Pickup.tsx               # Customer name + phone form
│       │   ├── Delivery.tsx             # Address form + distance validation (Haversine)
│       │   ├── Order.tsx                # Menu browsing + cart (reuses POS components)
│       │   ├── Checkout.tsx             # Stripe Elements payment form
│       │   └── Completed.tsx            # Thank you confirmation
│       └── components/
│           ├── PickupDetails.tsx         # Pickup form fields
│           ├── DeliveryDetails.tsx       # Delivery form + Google Places + distance check
│           ├── CheckOutDetails.tsx       # Email + Stripe card elements → processPayment
│           └── FieldInput.tsx            # Flexible input wrapper (memo'd)
│
├── shared/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Modal.tsx               # Custom modal (slide/fade animations, backdrop)
│   │   │   ├── InputWithLabel.tsx       # Label + input pair
│   │   │   ├── Switch.tsx              # Toggle (isActive, toggleSwitch)
│   │   │   ├── DropdownArrayOptions.tsx # Select from {label,value,id} array
│   │   │   ├── DropdownStringOptions.tsx# Select from string array
│   │   │   ├── ProductImage.tsx         # Canvas-cached image with skeleton loading
│   │   │   ├── ComponentLoader.tsx      # Centered loading spinner overlay
│   │   │   └── Loader.tsx              # Fullscreen white loader
│   │   ├── header/
│   │   │   ├── Header.tsx              # 75px top bar (logo, Customer Display btn, logout)
│   │   │   └── LogoutDropdown.tsx      # User menu dropdown
│   │   ├── modals/
│   │   │   ├── AuthModal.tsx           # Manager code authorization
│   │   │   ├── CashPaymentModal.tsx    # Cash payment with change calculation
│   │   │   ├── CustomCashModal.tsx     # Custom cash payment (custom total)
│   │   │   ├── SettingsPasswordModal.tsx# Settings access authorization
│   │   │   ├── PhoneOrderModal.tsx     # Phone delivery order form + distance validation
│   │   │   ├── PendingOrdersModal/     # Pending orders list + details + kitchen view
│   │   │   ├── DiscountModal/          # Discount entry + percentage buttons
│   │   │   ├── ClockInModal/           # Employee clock-in list
│   │   │   └── SavedCustomersModal/    # Customer search + details
│   │   └── billing/
│   │       ├── NewUserPayment.tsx       # Onboarding Stripe payment
│   │       ├── TrialEnded.tsx          # Plan selection (Starter $49 / Pro $99)
│   │       └── PaymentUpdateNotification.tsx  # Canceled/failed payment screen
│   └── hooks/
│       ├── useWindowSize.ts            # {width, height} from window resize
│       └── useInterval.ts             # setInterval hook with cleanup
│
├── services/
│   ├── firebase/
│   │   ├── config.ts                   # Firebase init, auth/db/storage exports, OWNER_OVERRIDE_UID
│   │   └── functions.ts               # ALL Firebase CRUD operations (see below)
│   ├── printing/
│   │   └── receiptPrint.tsx           # ESC/POS receipt formatter
│   └── woocommerce/                    # WooCommerce API client
│
├── store/
│   ├── appState.ts                     # All global state entities (simpler-state)
│   └── posState.ts                    # POS UI state entity
│
├── types/
│   ├── index.ts                       # All TypeScript interfaces
│   └── global.ts                      # Legacy/ambient types
│
├── utils/
│   ├── cartCalculations.ts            # SINGLE SOURCE OF TRUTH for cart math
│   ├── dateFormatting.ts              # parseDate(Timestamp|Date|string) → Date|null
│   ├── generateId.ts                  # Random alphanumeric ID generator
│   ├── resolveOptionPrice.ts          # Size-linked option price resolution
│   ├── searchFilters.ts              # Date range filters for customers/transactions
│   ├── scrollToTop.ts               # Scroll restoration on route change
│   └── googlePlacesStyles.ts         # Google Places autocomplete CSS-in-JS styles
│
└── functions/
    └── index.mjs                      # Firebase Cloud Functions (7 functions)
```

## App Bootstrap Flow (Router.tsx)
1. `auth.onAuthStateChanged()` fires
2. If authenticated → parallel fetch: user doc + 7 subcollections (products, employees, subscriptions, customers, devices, wooOrders, ingredients)
3. Process products: sort by `rank`, prefetch images (async, non-blocking)
4. Process subscriptions: check role + status → set `activePlanState` (starter/professional/none)
   - Backward-compat role names: "Test Plan"→starter, "Pos Software Plan"→starter, "Premium Plan"→professional
   - Online store access: granted by Professional plan or standalone "Online Store" subscription
5. Process free trial: check `freeTrial` field, clear if subscription active
6. Resolve device ID from `deviceID` cookie (generate if missing, expires year 9999)
7. Set up 3 real-time listeners:
   - **Print listener**: watches `printRequests` subcollection → QZ Tray
   - **Pending orders listener**: watches `pendingOrders` → `ongoingListState`, auto-prints online orders
   - **WooCommerce polling**: every 10s via `useInterval` (if enabled + subscribed + <3 errors)
8. `NavigationContent.tsx` gates access: trial ended → `TrialEnded`, new user → `NewUserPayment`, canceled → `PaymentUpdateNotification`, else → `AuthRoute`

## 3 Main Routes + Public Routes
- `/pos` → POS interface (`PosScreen.tsx`)
- `/authed` → Admin panel (`AdminContainer.tsx`) — requires `localStorage.isAuthedBackend`
- `/customer-display` → Secondary display for customers
- `/order/:urlEnding` → Online storefront (`OrderPage.tsx`) — works both authed & public
- `/log-in`, `/sign-up`, `/reset-password` → Auth pages (public only)

## Admin Sidebar Routes
| Section | Route | Component |
|---------|-------|-----------|
| Dashboard | `/authed/dashboard` | Dashboard |
| Category Mgmt | `/authed/product/categorylist-product` | CategoryList |
| Product Mgmt | `/authed/product/productlist-product` | ProductList |
| Ingredients | `/authed/inventory/ingredients` | IngredientsTab |
| Product Stock | `/authed/inventory/stocklevels` | StockLevelsList |
| Invoices | `/authed/report/invoicereport` | Invoices |
| Employees | `/authed/report/employeesreport` | EmployeesList |
| Edit Employee | `/authed/report/editemployee/:id` | EditEmployee |
| Activity Log | `/authed/report/activitylog` | ActivityLog |
| General Settings | `/authed/settings/generalsettings` | GeneralSettings |
| Device Settings | `/authed/settings/devicesettings` | DeviceSettings |
| Online Store | `/authed/settings/onlinestoresettings` | OnlineStoreSettings |
| WooCommerce | `/authed/settings/woocommerce` | WooCommerceSettings |
| Tables | `/authed/settings/tablesettings` | TableSettings |
| Billing | `/authed/settings/billingsettings` | BillingSettings |
| Help | `/authed/help/{1-5}` | HelpPage |

## State Management (simpler-state)

### store/appState.ts — All Global Entities
```
cartState: CartItemProp[]                    — Shopping cart (deduped by name+price+options+extraDetails)
storeProductsState: {products, categories}   — Product catalog
storeDetailsState: StoreDetailsProps          — Store config (name, tax, delivery, address, etc.)
customersState: CustomerProp[]                — Saved customers
employeesState: Employee[]                    — Staff (name, pin, role, permissions)
deviceState: MyDeviceDetailsProps             — Current device (printer config)
deviceIdState: string|null                    — Browser cookie device ID
deviceTreeState: {devices: Device[]}          — All registered devices
trialDetailsState: {endDate, hasEnded}        — Free trial info
activePlanState: "none"|"trial"|"starter"|"professional"  — Current plan
wooCommerceState: {apiUrl, ck, cs, useWoocommerce}       — WooCommerce creds
onlineStoreState: OnlineStoreStateProps       — Online store config (URL, Stripe keys, active)
transListState: TransListStateItem[]          — Completed transactions
settingsAuthState: boolean                    — Manager auth status
productBuilderState: {product, itemIndex, imageUrl, isOnlineOrder, isOpen}
orderDetailsState: {date, total, method, customer, cart, page, delivery, address}
ingredientsState: Ingredient[]                — Inventory ingredients
tablesState: Table[]                          — Restaurant table definitions
tableSectionsState: string[]                  — Table section names (e.g. "Patio", "Bar")
```

### store/posState.ts — POS UI State
```
section: string                    — Active category filter ("__all__" = all)
deliveryModal, cashModal, customCashModal, saveCustomerModal, ongoingOrderListModal,
  settingsPasswordModalVis, authPasswordModal, discountModal, clockinModal,
  openTableModal, tableOrderViewModal  — Modal visibility flags
name, phone, address, buzzCode, unitNumber  — Delivery form fields
deliveryChecked: boolean            — Delivery checkbox state
changeDue: string                   — Cash change amount
cartSub: number                     — Cart subtotal
cartNote: string                    — Order note
discountAmount: string|null         — Applied discount ("5%" or "10")
savedCustomerDetails: CustomerProp|null
updatingOrder: OngoingListStateProp|null  — Order being modified
ongoingListState: TransListStateItem[]     — All pending orders
managerAuthorizedStatus: boolean
pendingAuthAction: string           — Action awaiting auth
pendingAuthPermission: string       — Required permission level
tableViewActive: boolean            — Table floor view shown
activeTableId: string|null          — Current table
activeTableSessionId: string|null   — Pending order ID for active table
openTableTarget: Table|null         — Table being opened
tableOrderTarget: TransListStateItem|null  — Table order being viewed
```

**Usage:** `posState.use()` to read, `updatePosState({...})` for partial merge, `resetPosState()` to clear (preserves section + tableViewActive)

## Firestore Structure
```
/users/{uid}
  ├── (root doc): storeDetails, categories[], wooCredentials, freeTrial,
  │               onlineStoreSetUp, onlineStoreActive, urlEnding,
  │               tables[], tableSections[], ownerDetails, deliveryPlatforms
  ├── products/{id}           — Product catalog (sorted by rank)
  ├── customers/{id}          — Saved customers (with orders[] history)
  ├── employees/{id}          — Staff (name, pin, role, permissions, clockedIn)
  │   └── hours/{id}          — Time clock entries
  ├── devices/{id}            — Registered POS devices
  │   └── printRequests/{id}  — Queued print jobs (picked up by target device)
  ├── subscriptions/{id}      — Stripe subscription records (role, status)
  ├── transList/{id}          — Completed transactions
  ├── pendingOrders/{id}      — In-progress orders (table, delivery, pickup, online)
  ├── deliveryOrders/{id}     — Delivery webhook audit trail
  ├── stats/monthly           — Aggregated analytics (days map with revenue/orders/etc.)
  ├── activityLog/{id}        — Employee action audit entries
  ├── wooOrders/{id}          — Synced WooCommerce orders
  ├── ingredients/{id}        — Inventory ingredients (stock tracking)
  │   └── stockHistory/{id}   — Stock change audit trail
  └── checkout_sessions/{id}  — Stripe checkout sessions (created by client, watched for redirect)

/public/{uid}
  ├── (root doc): urlEnding, storeDetails, categories, stripePublicKey,
  │               onlineStoreActive, onlineStoreSetUp
  └── products/{id}           — Public product data for online ordering
```

## Firebase Services (services/firebase/functions.ts)
**Auth:** `signIn(email, pw)`, `signUp(email, pw, name, phone)`, `logout()`
**Store:** `updateStoreDetails(partial)` — syncs to `/public/{uid}` if online store active
**Data:** `updateData(categories)`, `saveTables(tables)`, `saveTableSections(sections)`
**Transactions:** `updateTransList(receipt)` — adds to transList, timestamps, calls updateStats, deducts stock
**Stats:** `updateStats(uid, receipt)` — Firestore transaction on `/stats/monthly` with daily breakdowns
**Stock:** `deductStockForCart(uid, cart, txnId)` — batch: recipe→ingredients OR simple→product stock, creates stockHistory, syncs public
**Inventory:** `adjustStockManually()`, `fetchStockHistory()`, `addIngredient()`, `updateIngredient()`, `deleteIngredient()`, `adjustIngredientStockManually()`, `fetchIngredientStockHistory()`
**Customers:** `addCustomerDetailsToDb(customer)` — with createdAt timestamp
**Trial:** `updateFreeTrial(endDate)`
**Stripe:** `createCheckoutSession(priceId, successUrl, cancelUrl)` — writes to checkout_sessions, watches for sessionId redirect. `openStripePortal()` — calls Cloud Function for portal URL

## Cloud Functions (functions/index.mjs)
7 HTTPS Cloud Functions, all use CORS:
1. **sendCustomEmail** — Generic email via nodemailer (Office365 SMTP)
2. **sendPasswordResetEmail** — Firebase auth reset link, custom email template
3. **sendSettingsPass** — Sends settings password to email
4. **processPayment** — Stripe charge (reads store's secret key from Firestore), creates pendingOrder, sends confirmation email
5. **getLatLng** — Google Places → lat/lng for distance validation
6. **sendWelcomeEmail** — Welcome email (free trial vs paid templates)
7. **deliveryWebhook** — Webhook receiver for DoorDash/UberEats/SkipTheDishes/Grubhub:
   - URL: `/deliveryWebhook/{uid}/{platform}`
   - Validates: user exists, Professional plan active, platform enabled
   - HMAC-SHA256 signature verification (timingSafeEqual)
   - Normalizes payload per platform → standardized order
   - Deduplicates by platformOrderId
   - Creates pendingOrder + deliveryOrders audit doc
   - Platform prefixes: DD (DoorDash), UE (UberEats), SK (Skip), GH (Grubhub)

## Subscription & Billing
- **Plans:** Free (1 device), Starter $49/mo (3 devices), Professional $99/mo (5 devices)
- **Stripe Price IDs:** Starter=`price_1T8TIlCIw3L7DOwIDUpngIcI`, Professional=`price_1T8TJBCIw3L7DOwIlItWv4xo`
- **Owner override:** `OWNER_OVERRIDE_UID` = "J6rAf2opwnSKAhefbOZW6HJdx1h2" (+3 free devices)
- **Plan gating:** Tables + WooCommerce + delivery platforms = Professional only
- **Online store:** Professional plan OR standalone "Online Store" subscription
- **Trial:** 1 month free, freeTrial field is Firestore Timestamp
- **Stripe extension** locked to live API keys
- **NavigationContent** gates all access based on subscription lifecycle

## POS Order Lifecycle (print.ts)
1. **Validation** — Check cart not empty, required fields present
2. **Discount handling** — "X%" parsed as percentage, else flat $. Creates negative-price cart item
3. **Customer history** — If savedCustomerDetails: append order to customer.orders[]
4. **Per order type:**
   - **Table order:** Find session from ongoingListState → print receipt → delete pendingOrder → add to transList → clear cart → return to table view
   - **Delivery order:** Create pendingOrder in Firebase → print receipt → clear cart
   - **Pickup order:** Create pendingOrder → print receipt → clear cart
   - **In-store (Card/Cash):** Create pendingOrder → print receipt → clear cart
5. **sendTableOrder()** — Kitchen ticket: filters unsent items, marks `sent: true`, prints only new items, saves to Firebase

## Table Management System
- **Setup:** Admin → Settings → Table Settings (name, number, seats, section, shape)
- **Floor View:** Grid grouped by section, color-coded (green=available, blue=occupied)
- **Open table:** Select empty → enter guests + server → creates pendingOrder with `method: "tableOrder"`
- **Active table:** Cart auto-saves to Firestore (2s debounce), shows elapsed time
- **Kitchen tickets:** "Send Order" sends only unsent items (marks `sent: true`)
- **Payment:** Cash/Card through TableOrderView modal
- **Transfer:** Move table session to different table
- **Close:** Delete pendingOrder (with confirmation)

## Online Store Customer Flow
```
Page 1 (StoreFront) → Page 2 (Pickup) or Page 3 (Delivery) → Page 4 (Menu/Cart) → Page 5 (Checkout) → Page 6 (Completed)
```
- Loads store data from `/public/{uid}` by `urlEnding`
- Delivery: Google Places autocomplete → Cloud Function getLatLng → Haversine distance check against deliveryRange
- Checkout: Stripe Elements (CardNumber, CardExpiry, CardCvc) → createToken → Cloud Function processPayment
- Currency: CAD hardcoded
- Cart not persisted (lost on refresh)

## Printing System
1. `receiptPrint(order, storeDetails, reprint?)` → formats ESC/POS commands → returns `{data: string[], total: number}`
2. If `useDifferentDeviceToPrint`: writes to target device's `printRequests` collection
3. Target device's Router.tsx listener picks up print request → QZ Tray → deletes request
4. Receipt types: delivery (with address), pickup, table (with table info), in-store
5. WooCommerce orders: separate inline ESC/POS formatting in Router.tsx (doesn't use receiptPrint)
6. Delivery platform orders: auto-print when `printOnlineOrders` enabled

## Product Options System
Option types and their components:
- **"Dropdown"** → `DropdownOption.tsx` (single-select, portal-rendered for z-index)
- **"Quantity Dropdown"** → `MultiSelectOptionGroup.tsx` (multi-select with quantities, half&half support)
- **"Table View"** → `TableOption.tsx` (checkbox grid)
- **"Included Selections"** → `IncludedSelectionsGroup.tsx` (choose N included, extra $X each)
- **Default (Radio Buttons)** → `SingleSelectOptionGroup.tsx` (pill buttons)
- **Conditional display:** `selectedCaseList` on options, shows/hides based on other option selections
- **Size-linked pricing:** `sizeLinkedOptionLabel` + `priceBySize` map resolved by `resolveOptionPrice()`
- **Price calculation:** base price + sum of (selectedTimes * countsAs * resolvedPrice) per option

## Cart Math (utils/cartCalculations.ts) — SINGLE SOURCE OF TRUTH
```typescript
calculateCartTotals(cart, taxRate, deliveryPrice, includeDelivery, discountAmount?)
→ { itemsSubtotal, deliveryFee, discount, subtotal, tax, total }
```
- itemsSubtotal = sum of (price * quantity) per item
- discount supports "X%" (percentage) or flat $ amount
- tax = subtotal * (parseFloat(taxRate)/100), defaults to 13% if invalid
- **ALWAYS use this function** — never compute totals inline

## Key TypeScript Types (types/index.ts)
```typescript
ProductProp: { name, price, description, options: Option[], id, imageUrl?, category?, rank?,
  trackStock?, stockQuantity?, lowStockThreshold?, costPrice?, recipe?: RecipeItem[], ... }
Option: { label, optionType, optionsList: OptionsList[], isRequired?, numOfSelectable?,
  includedSelections?, extraSelectionPrice?, allowHalfAndHalf?, sizeLinkedOptionLabel?, selectedCaseList?, ... }
OptionsList: { label, selected?, selectedTimes?, countsAs?, priceIncrease?, priceBySize?, halfSide?, ... }
CartItemProp: { name, price, description, options: string[], extraDetails, quantity?, editableObj?, sent?, ... }
TransListStateItem: { id, date, method, cart, customer, total, transNum, paymentMethod?, changeDue?,
  online?, tableId?, tableName?, tableNumber?, guests?, server?, seatedAt?, deliveryPlatform?, ... }
OngoingListStateProp: { id, cart, cartNote, customer, date, method, online, isInStoreOrder, transNum, total,
  tableId?, tableName?, tableNumber?, guests?, server?, seatedAt?, ... }
StoreDetailsProps: { name, address?, phoneNumber, website, deliveryPrice, settingsPassword, taxRate,
  acceptDelivery, deliveryRange, hasLogo?, logoUrl?, stripePublicKey?, docID?, ... }
Employee: { name, pin, id, clockedIn?, role?, permissions?: EmployeePermissions }
EmployeePermissions: { accessBackend?, discount?, customPayment?, manageOrders? }
Table: { id, number, name, seats, section, shape: "square"|"round"|"rectangle", isActive }
Ingredient: { id, name, unit: IngredientUnit, stockQuantity, lowStockThreshold, costPerUnit, category? }
CustomerProp: { name, phone, address?, buzzCode?, unitNumber?, orders: CustomersOrdersProp[], id, createdAt? }
AddressType: { label?, value?: { description, place_id?, reference?, structured_formatting? } }
```

## Critical Rules
1. **Cart math**: ALWAYS use `calculateCartTotals()` — never compute totals inline
2. **taxRate is a string** (e.g. "13") — always `parseFloat()` before arithmetic
3. **Firebase compat API only** — `db.collection("users").doc(uid)` pattern, NOT modular
4. **Auth UID**: use `auth.currentUser?.uid` with null guards — never hardcode UIDs
5. **Timestamp types**: Client uses `firebase.firestore.Timestamp`, types/index.ts has compatible local type
6. **No window.location.reload()** in state functions
7. **Cart items have no ID** — matched by name + options + extraDetails
8. **Device ID** comes from browser cookie (`deviceID`), not Firebase auth
9. **React Router v5** — use `<Route>`, `<Switch>`, `useHistory()`, `withRouter()` — NOT v6
10. **Global CSS `div { display: flex; flex-direction: column; }`** — RNW migration default, affects all divs
11. **Third-party library CSS resets** in global.css (Stripe Elements, recharts, react-alert, react-tooltip)
12. **Products sorted by `rank` field** (numeric string, parseFloat)
13. **Online store syncs** — product/category changes must update both `/users/{uid}/products` and `/public/{uid}/products`

## Common Patterns
- **State read:** `const x = someState.use()` (React hook) or `someState.get()` (non-reactive)
- **State write:** `setSomeState(val)` (full replace) or `updateSomeState({...})` (partial merge)
- **Modals:** Always mounted, controlled by `isVisible` prop. Lazy-loaded via `React.lazy()`.
- **Portal dropdowns:** `DropdownOption` renders to `document.body` for z-index control
- **Auto-save:** TableCartHeader debounces cart saves by 2 seconds
- **Image caching:** `ProductImage` uses global `loadedImages` Set + Canvas prerendering
- **Employee auth:** Check settingsPassword OR `verifyEmployeePin(permission)` for gated actions
- **Settings access:** `localStorage.isAuthedBackend` + redirect guard in AuthRoute
- **Responsive breakpoints:** Desktop ≥ 1250px (3-column POS), Tablet 1000-1250px, Mobile < 1000px

## Owner Override
`OWNER_OVERRIDE_UID` in `services/firebase/config.ts` = "J6rAf2opwnSKAhefbOZW6HJdx1h2" (gets +3 free devices)

## Full Documentation
See `instructions.md` in project root for the complete developer guide.
