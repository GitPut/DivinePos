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
├── src/main.tsx                          # Vite entry → ErrorBoundary → React root
├── src/global.css                        # Global CSS, RNW defaults, animations, 3rd-party resets
├── index.html                            # HTML entry with #root mount
├── vite.config.ts                        # Aliases, node polyfills, port 3000
├── App.tsx                               # Root: AlertProvider (custom template) → AppRouter
│
├── router/
│   ├── Router.tsx                        # Bootstrap: auth, data loading, 3 listeners
│   ├── NavigationContent.tsx             # Subscription gating layer (superadmin bypass)
│   ├── AuthRoute.tsx                     # Protected routes (/pos, /authed, /customer-display, /superadmin)
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
│   │       │   ├── ProductsSection.tsx  # Filtered product grid (useMemo, search + category)
│   │       │   ├── CategorySection.tsx  # Category filter pills (horizontal scroll)
│   │       │   ├── ItemContainer.tsx    # Product card (stock-aware via recipe OR simple tracking)
│   │       │   └── LeftMenuBar.tsx      # Sidebar icons (Home, Tables, Orders, Clock, Delivery, Discount, Cash)
│   │       ├── Cart/
│   │       │   ├── Cart.tsx             # Desktop cart sidebar (totals, discount, checkout, customer display broadcast)
│   │       │   ├── CartItem.tsx         # Cart row (qty controls, edit via ProductBuilder, expandable options)
│   │       │   ├── CartAmountRow.tsx    # Label + amount display row
│   │       │   ├── CartMobile.tsx       # Mobile cart (modal drawer)
│   │       │   ├── CheckoutButton.tsx   # Context-aware: table/delivery/in-store/updating order modes
│   │       │   └── print.ts            # Order lifecycle: validate→discount→customer→persist→print→clear
│   │       ├── ProductBuilder/
│   │       │   ├── ProductBuilderModal.tsx  # Product customization (desktop 2-col, mobile single-col)
│   │       │   ├── OptionDisplay.tsx        # Routes to correct component + conditional display logic
│   │       │   ├── DropdownOption.tsx       # Single-select dropdown (portal to document.body)
│   │       │   ├── SingleSelectOptionGroup.tsx  # Pill button options
│   │       │   ├── MultiSelectOptionGroup.tsx   # Qty grid + half&half (left/right/whole)
│   │       │   ├── IncludedSelectionsGroup.tsx  # "Choose N included, $X each extra"
│   │       │   ├── TableOption.tsx              # Checkbox grid with qty + half&half
│   │       │   ├── SingleSelectButton.tsx       # Individual pill button
│   │       │   ├── AddToCartButton.tsx          # Add/Save button with calculated price
│   │       │   └── GoBackButton.tsx             # Back arrow button
│   │       └── Tables/
│   │           ├── TableFloorView.tsx    # Table grid by section (green=available, blue=occupied)
│   │           ├── TableCard.tsx         # Individual table (elapsed time, guests, total, server)
│   │           ├── TableCartHeader.tsx   # Active table info bar (auto-save debounce 2s)
│   │           ├── OpenTableModal.tsx    # Initialize table session (guests, server dropdown)
│   │           └── TableOrderView.tsx    # Table payment/transfer/close modal (tax calc at payment)
│   │
│   ├── admin/
│   │   ├── AdminContainer.tsx           # Admin layout: sidebar (240px) + content area
│   │   ├── index.tsx                    # Admin route definitions
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx            # KPI analytics (4 cards + chart + order types + wait times)
│   │   │   ├── TotalRevenueBox.tsx      # Revenue bar chart (Recharts)
│   │   │   ├── MostOrderedItemsBox.tsx  # Top 3 products (gold/silver/bronze badges)
│   │   │   ├── OrderWaitTimeBox.tsx     # Shortest/Longest/Average/Mean wait times
│   │   │   ├── PickupOrdersBox.tsx      # Pickup stats
│   │   │   ├── DeliveryOrdersBox.tsx    # Delivery stats
│   │   │   ├── InStoreOrdersBox.tsx     # In-store stats
│   │   │   ├── CustomersBox.tsx         # New customers count by period
│   │   │   ├── PeriodDropdown.tsx       # Period filter (Today/Week/Month/Year/All)
│   │   │   └── BarGraph.tsx             # Recharts bar chart component
│   │   ├── products/
│   │   │   ├── ProductsPage.tsx         # Product/category/templates router
│   │   │   ├── ProductList.tsx          # Product CRUD grid (search, filter, list/grid view)
│   │   │   ├── CategoryList.tsx         # Category CRUD list (drag-to-reorder)
│   │   │   ├── modals/
│   │   │   │   ├── AddProductModal.tsx  # Full product editor (options, image, recipe, stock)
│   │   │   │   └── AddCategoryModal.tsx # Category create/edit modal
│   │   │   ├── ProductOptionBox.tsx     # Product card with edit/delete
│   │   │   └── ProductBuilderView.tsx   # Product preview with option pricing
│   │   ├── inventory/
│   │   │   ├── InventoryPage.tsx        # Ingredients + Stock tabs
│   │   │   ├── IngredientsTab.tsx       # Ingredient CRUD (search, filter, status badges)
│   │   │   └── StockLevelsList.tsx      # Product stock levels (tracked/untracked)
│   │   ├── reports/
│   │   │   ├── ReportsPage.tsx          # Reports router
│   │   │   ├── Invoices.tsx             # Transaction history (pagination 100/page, search, date filter, Excel export)
│   │   │   ├── EmployeesList.tsx        # Employee list + add modal
│   │   │   ├── EditEmployee.tsx         # Employee details, hours, permissions toggles
│   │   │   ├── components/HoursItem.tsx # Individual time clock entry row
│   │   │   └── ActivityLog.tsx          # Employee action audit log (last 100)
│   │   ├── settings/
│   │   │   ├── SettingsPage.tsx         # Settings router
│   │   │   ├── GeneralSettings.tsx      # Store name, address, tax, delivery config
│   │   │   ├── DeviceSettings.tsx       # Multi-device management + printer config + QZ Tray
│   │   │   ├── OnlineStoreSettings.tsx  # URL slug, Stripe keys, brand color, tagline, logo, product sync
│   │   │   ├── WooCommerceSettings.tsx  # WooCommerce API credentials (Pro only)
│   │   │   ├── TableSettings.tsx        # Table definitions + sections (Pro only)
│   │   │   └── BillingSettings.tsx      # Plan cards ($29/$69), Stripe portal, plan switching
│   │   └── help/HelpPage.tsx            # 5 help pages with expandable FAQ sections
│   │
│   └── online-store/
│       ├── OrderPage.tsx                # Storefront entry: loads /public/{uid} data, filters products
│       ├── pages/
│       │   ├── StoreFront.tsx           # Landing: hero image, logo, tagline, Pickup/Delivery CTAs
│       │   ├── Pickup.tsx               # Customer name + phone form
│       │   ├── Delivery.tsx             # Address form + distance validation (Haversine)
│       │   ├── Order.tsx                # Menu browsing + cart (reuses POS ProductBuilder/Cart)
│       │   ├── Checkout.tsx             # Stripe Elements (loadStripe memoized) payment form
│       │   └── Completed.tsx            # Thank you confirmation + "Place Another Order"
│       └── components/
│           ├── PickupDetails.tsx         # Pickup form fields (name, phone)
│           ├── DeliveryDetails.tsx       # Google Places + getLatLng Cloud Function + Haversine
│           ├── CheckOutDetails.tsx       # Email + Stripe CardNumber/Expiry/CVC → processPayment
│           └── FieldInput.tsx            # Flexible input wrapper (memo'd, custom areEqual)
│
├── shared/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Modal.tsx               # Portal modal (slide/fade animations, transitionend cleanup)
│   │   │   ├── InputWithLabel.tsx       # Label + input pair
│   │   │   ├── Switch.tsx              # Toggle (isActive, toggleSwitch, 0.3s transition)
│   │   │   ├── DropdownArrayOptions.tsx # Portal select from {label,value,id} array (z:100001)
│   │   │   ├── DropdownStringOptions.tsx# Portal select from string array
│   │   │   ├── ProductImage.tsx         # Canvas-cached image (prefetch, loadedImages Set, ResizeObserver)
│   │   │   ├── ComponentLoader.tsx      # Centered loading spinner overlay
│   │   │   ├── Loader.tsx              # Fullscreen white loader
│   │   │   └── ErrorBoundary.tsx       # React Error Boundary → logs to /systemErrors
│   │   ├── header/
│   │   │   ├── Header.tsx              # 75px top bar (logo, Customer Display btn, logout)
│   │   │   └── LogoutDropdown.tsx      # User avatar + name + logout dropdown
│   │   ├── modals/
│   │   │   ├── AuthModal.tsx           # Manager code OR employee PIN authorization
│   │   │   ├── CashPaymentModal.tsx    # Cash payment with auto change calculation
│   │   │   ├── CustomCashModal.tsx     # Custom payment (arbitrary total) + Open Register
│   │   │   ├── SettingsPasswordModal.tsx# Settings auth (password OR PIN) + "Forgot Password" email
│   │   │   ├── PhoneOrderModal/        # Phone order form (name, phone, address, distance check)
│   │   │   ├── PendingOrdersModal/     # Pending orders list + details + kitchen view + complete/cancel
│   │   │   ├── DiscountModal/          # Discount entry + 5%/10%/15% presets + manager code
│   │   │   ├── ClockInModal/           # Employee clock-in/out list (PIN verification)
│   │   │   └── SavedCustomersModal/    # Customer search + details + order history + reorder
│   │   ├── billing/
│   │   │   ├── NewUserPayment/         # Onboarding Stripe payment (Starter/Professional)
│   │   │   ├── TrialEnded.tsx          # Plan selection (Starter $29 / Pro $69)
│   │   │   └── PaymentUpdateNotification.tsx  # Canceled/failed payment screen
│   │   └── Walkthrough.tsx             # 20+ step interactive onboarding (spotlight overlay, data-walkthrough attrs)
│   └── hooks/
│       ├── useWindowSize.ts            # {width, height} from window resize
│       └── useInterval.ts             # setInterval hook with ref-based cleanup
│
├── services/
│   ├── firebase/
│   │   ├── config.ts                   # Firebase init, auth/db/storage exports, OWNER_OVERRIDE_UID, STRIPE_PUBLIC_KEY
│   │   ├── functions.ts               # ALL Firebase CRUD (auth, store, products, stock, customers, stripe, templates, superadmin)
│   │   ├── errorLogging.ts            # Global error handlers (window.onerror, unhandledrejection) → /systemErrors
│   │   └── systemLogging.ts           # System event logging (login/logout/signup) → /systemLogs
│   ├── printing/
│   │   └── receiptPrint.tsx           # ESC/POS receipt formatter (4 order types, drawer kick)
│   └── woocommerce/                    # WooCommerce API client
│
├── store/
│   ├── appState.ts                     # All global state entities (simpler-state) — 18 entities
│   └── posState.ts                    # POS UI state entity (38 fields)
│
├── types/
│   ├── index.ts                       # All TypeScript interfaces (31 types)
│   └── global.ts                      # Legacy/outdated subset (missing inventory, recipes, table fields)
│
├── utils/
│   ├── cartCalculations.ts            # SINGLE SOURCE OF TRUTH for cart math
│   ├── dateFormatting.ts              # parseDate(Timestamp|Date|string) → Date|null
│   ├── generateId.ts                  # Random alphanumeric ID generator
│   ├── resolveOptionPrice.ts          # Size-linked option price resolution
│   ├── employeeAuth.ts               # verifyEmployeePin(pin, permission) + logEmployeeActivity()
│   ├── customerDisplayBroadcast.ts    # localStorage-based POS ↔ Customer Display sync (500ms poll)
│   ├── searchFilters.ts              # Date range filters for customers/transactions
│   ├── scrollToTop.ts               # Scroll restoration on route change
│   └── googlePlacesStyles.ts         # Google Places CSS-in-JS (light + dark themes)
│
└── functions/
    └── index.mjs                      # Firebase Cloud Functions (9+ functions)
```

## App Bootstrap Flow (Router.tsx)
1. `src/main.tsx` installs global error handlers → wraps App in ErrorBoundary → renders
2. `App.tsx` wraps in AlertProvider (timeout 5s, TOP_CENTER, z-index 100000, custom SVG template)
3. `auth.onAuthStateChanged()` fires
4. If authenticated → pre-fetch chunks (NavigationContent, AuthRoute, PosScreen) + parallel fetch: user doc + 9 subcollections (products, employees, subscriptions, customers, devices, wooOrders, ingredients, optionTemplates)
5. Process products: sort by `rank` (parseFloat), prefetch images (async, non-blocking via `prefetchImage()`)
6. Process subscriptions: check role + status → set `activePlanState` (starter/professional/none)
   - Backward-compat role names: "Test Plan"→starter, "Pos Software Plan"→starter, "Premium Plan"→professional
   - Online store access: granted by Professional plan or standalone "Online Store" subscription
   - If no online store subscription: deactivates online store (batch update users + public docs)
7. Process option templates: load existing or auto-import `standardOptionTemplates` for new accounts
8. Process free trial: check `freeTrial` field (Firestore Timestamp), clear if subscription active
9. Resolve device ID from `deviceID` cookie (generate if missing, expires year 9999)
10. Log login event (once per session via `sessionStorage.loginLogged`)
11. Set up 3 real-time listeners:
    - **Print listener**: watches `devices/{docID}/printRequests` → QZ Tray → deletes after printing
    - **Pending orders listener**: watches `pendingOrders` → `ongoingListState`, auto-prints online orders (if `printOnlineOrders` enabled, marks `printed: true`)
    - **WooCommerce polling**: every 10s via `useInterval` (if enabled + subscribed + <3 errors)
12. `NavigationContent.tsx` gates access:
    - Superadmin (OWNER_OVERRIDE_UID) → bypasses ALL gating → AuthRoute
    - Trial ended → `TrialEnded`, new user → `NewUserPayment`, canceled → `PaymentUpdateNotification`, else → `AuthRoute`

## Routes
**Authenticated (AuthRoute.tsx):**
- `/pos` → POS interface (`PosScreen.tsx`) — default redirect for unmatched routes
- `/authed` → Admin panel (`AdminContainer.tsx`) — requires `localStorage.isAuthedBackend`
- `/customer-display` → Secondary display for customers (localStorage broadcast sync)
- `/order/:urlEnding` → Online storefront (`OrderPage.tsx`) — works both authed & public
- `/superadmin` → SuperAdmin console — OWNER_OVERRIDE_UID only, lazy-loaded

**Public (PublicRoute.tsx):**
- `/log-in`, `/sign-up`, `/reset-password` → Auth pages
- `/order/:urlEnding` → Online storefront (public ordering)

**Walkthrough:** Auto-shows on first login per user (`localStorage.walkthroughCompleted_{uid}`), 20+ guided steps with spotlight overlay. Sidebar can trigger via exported `triggerWalkthrough` function.

## Admin Sidebar (240px fixed, collapsible sections)
| Section | Route | Component |
|---------|-------|-----------|
| Dashboard | `/authed/dashboard` | Dashboard |
| Menu > Categories | `/authed/product/categorylist-product` | CategoryList (drag-to-reorder) |
| Menu > Products | `/authed/product/productlist-product` | ProductList (search, filter, list/grid) |
| Menu > Templates | `/authed/product/option-templates` | OptionTemplatesList |
| Inventory > Ingredients | `/authed/inventory/ingredients` | IngredientsTab |
| Inventory > Stock | `/authed/inventory/stocklevels` | StockLevelsList |
| Reports > Invoices | `/authed/report/invoicereport` | Invoices (pagination, Excel export) |
| Reports > Employees | `/authed/report/employeesreport` | EmployeesList |
| Reports > Edit Employee | `/authed/report/editemployee/:id` | EditEmployee |
| Reports > Activity Log | `/authed/report/activitylog` | ActivityLog |
| Settings > General | `/authed/settings/generalsettings` | GeneralSettings |
| Settings > Devices | `/authed/settings/devicesettings` | DeviceSettings |
| Settings > Online Store | `/authed/settings/onlinestoresettings` | OnlineStoreSettings |
| Settings > WooCommerce | `/authed/settings/woocommerce` | WooCommerceSettings |
| Settings > Tables | `/authed/settings/tablesettings` | TableSettings |
| Settings > Billing | `/authed/settings/billingsettings` | BillingSettings |
| Help | `/authed/help/{1-5}` | HelpPage (5 pages, expandable FAQ) |
| Walkthrough | (triggers overlay) | Walkthrough.tsx via triggerWalkthrough() |

## State Management (simpler-state)

### store/appState.ts — All Global Entities
```
cartState: CartItemProp[]                    — Shopping cart (deduped by name+price+JSON(options)+extraDetails)
storeProductsState: {products, categories}   — Product catalog (sorted by rank)
storeDetailsState: StoreDetailsProps          — Store config (name, tax, delivery, address, etc.)
customersState: CustomerProp[]                — Saved customers (with orders[] history)
employeesState: Employee[]                    — Staff (name, pin, role, permissions)
deviceState: MyDeviceDetailsProps             — Current device (printer config)
deviceIdState: string|null                    — Browser cookie device ID
deviceTreeState: {devices: Device[]}          — All registered devices
trialDetailsState: {endDate, hasEnded}        — Free trial info
activePlanState: "none"|"trial"|"starter"|"professional"  — Current plan (type: ActivePlan)
wooCommerceState: {apiUrl, ck, cs, useWoocommerce}       — WooCommerce creds
onlineStoreState: OnlineStoreStateProps       — Online store config (URL, Stripe keys, active, brandColor, tagline)
transListState: TransListStateItem[]          — Completed transactions
settingsAuthState: boolean                    — Manager auth status
productBuilderState: {product, itemIndex, imageUrl, isOnlineOrder, isOpen}
orderDetailsState: {date, total, method, customer, cart, page, delivery, address}  — Online store flow state
ingredientsState: Ingredient[]                — Inventory ingredients
optionTemplatesState: OptionTemplate[]        — Reusable option templates (auto-imported for new accounts)
tablesState: Table[]                          — Restaurant table definitions
tableSectionsState: string[]                  — Table section names (e.g. "Patio", "Bar")
```

**Key functions:** `addCartState(val, currentState)` deduplicates by name+price+options+extraDetails, increments qty if match. `resetPosState()` preserves `section` + `tableViewActive`. `setOrderDetailsState()` does shallow merge + nested customer merge. `resetProductBuilderState()` closes modal first (200ms delay) then resets.

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
  │   └── stockHistory/{id}   — Product stock change audit trail
  ├── customers/{id}          — Saved customers (with orders[] history, createdAt)
  ├── employees/{id}          — Staff (name, pin, role, permissions, clockedIn)
  │   └── hours/{id}          — Time clock entries (date, startTime, endTime, paid)
  ├── devices/{id}            — Registered POS devices
  │   └── printRequests/{id}  — Queued print jobs (picked up by target device, deleted after)
  ├── subscriptions/{id}      — Stripe subscription records (role, status) — READ ONLY from client
  ├── payments/{id}           — Stripe payment records — READ ONLY from client
  ├── transList/{id}          — Completed transactions (dateCompleted added on write)
  ├── pendingOrders/{id}      — In-progress orders (table, delivery, pickup, online, deliveryPlatform)
  ├── deliveryOrders/{id}     — Delivery webhook audit trail (platformOrderId, platform, status)
  ├── stats/monthly           — Aggregated analytics (days map with revenue/orders/productCounts/waitTime)
  ├── activityLog/{id}        — Employee action audit entries (employeeName, action, timestamp)
  ├── wooOrders/{id}          — Synced WooCommerce orders (printed flag)
  ├── ingredients/{id}        — Inventory ingredients (stock tracking)
  │   └── stockHistory/{id}   — Ingredient stock change audit trail
  ├── optionTemplates/{id}    — Reusable option templates (name, option, updatedAt)
  └── checkout_sessions/{id}  — Stripe checkout sessions (watched for sessionId → redirect)

/public/{uid}
  ├── (root doc): urlEnding, storeDetails, categories, stripePublicKey,
  │               onlineStoreActive, onlineStoreSetUp, brandColor, tagline
  └── products/{id}           — Public product data for online ordering

/systemLogs/{id}              — System event logging (login, logout, signup, subscription_change)
/systemErrors/{id}            — Error logging (rate-limited 10/60s, from ErrorBoundary + global handlers)
```

## Firebase Services (services/firebase/functions.ts)
**Auth:** `signIn(email, pw)`, `signUp(email, pw, name, phone)` (creates initial doc with categories, wooCredentials, storeDetails), `logout()` (clears localStorage/sessionStorage, logs event, redirects to divinepos.com)
**Store:** `updateStoreDetails(partial)` — syncs to `/public/{uid}` if online store active
**Data:** `updateData(categories)`, `saveTables(tables)`, `saveTableSections(sections)`
**Transactions:** `updateTransList(receipt)` — adds dateCompleted, strips undefined, calls updateStats + deductStockForCart
**Stats:** `updateStats(uid, receipt)` — Firestore transaction on `/stats/monthly` with daily breakdowns (revenue, orders, inStore, delivery, pickup, productCounts, waitTime)
**Stock:** `deductStockForCart(uid, cart, txnId)` — dual path: recipe→ingredients OR simple→product stock. Batch writes: updates stock, creates stockHistory, syncs public
**Inventory:** `adjustStockManually()`, `fetchStockHistory(limit=50)`, `addIngredient()`, `updateIngredient()`, `deleteIngredient()`, `adjustIngredientStockManually()`, `fetchIngredientStockHistory()`
**Customers:** `addCustomerDetailsToDb(customer)` — with createdAt timestamp
**Trial:** `updateFreeTrial(endDate)` — null deletes field via FieldValue.delete()
**Stripe:** `createCheckoutSession(priceId, successUrl, cancelUrl, onError?, quantity?)` — writes to checkout_sessions, watches for sessionId redirect. `openStripePortal(onError?)` — calls Cloud Function for portal URL
**Templates:** `saveOptionTemplate(template)` — saves to optionTemplates, updates local state. `deleteOptionTemplate(id)`. `syncOptionTemplateToProducts(template)` — batch updates all products using that template
**Superadmin:** `setUserAccountPlan(uid, plan)` — cancels existing subs, creates new. `deleteUserAccount(uid)` — recursively deletes user + public + auth
**Logging:** `services/firebase/systemLogging.ts` — `logSystemEvent(type, metadata?)` writes to /systemLogs. `services/firebase/errorLogging.ts` — global handlers + `logErrorToFirestore()` writes to /systemErrors (rate-limited 10/60s)

## Cloud Functions (functions/index.mjs)
Cloud Functions using Firebase Functions v2, Firestore admin SDK, Nodemailer (Office365 SMTP), Stripe, Axios:

**Auth Triggers:**
- **onUserCreated** — Auth trigger on signup: writes to /systemLogs with type "signup", uid, email, metadata

**Callable Functions (require auth):**
- **deleteAccount(data, context)** — Superadmin only (verifies SUPERADMIN_UID). Recursively deletes user doc + public doc + Firebase Auth user
- **setAccountPlan(data, context)** — Superadmin only. Cancels existing subs, sets trial or active subscription

**HTTPS Functions (CORS-enabled):**
1. **sendCustomEmail** — Generic email via nodemailer (Office365 SMTP, support@divinepos.com)
2. **sendPasswordResetEmail** — Firebase auth reset link, custom email template (replaces posmate domain → auth.divinepos)
3. **sendSettingsPass** — Sends settings password to email
4. **processPayment** — Stripe charge (reads store's secret key from Firestore), creates pendingOrder, sends confirmation email. Amount in cents, currency CAD
5. **getLatLng** — Google Places API → lat/lng for distance validation (v2 function)
6. **sendWelcomeEmail** — Welcome email (free trial vs paid templates)
7. **deliveryWebhook** — Webhook receiver for DoorDash/UberEats/SkipTheDishes/Grubhub:
   - URL: `/deliveryWebhook/{uid}/{platform}` (v2, POST only)
   - Validates: user exists, Professional plan active, platform enabled
   - HMAC-SHA256 signature verification (timingSafeEqual) — headers: x-doordash-signature, x-uber-signature, x-skip-signature, x-grubhub-signature
   - Normalizes payload per platform → standardized order (cart, customer, total)
   - Deduplicates by platformOrderId in deliveryOrders collection
   - Creates pendingOrder (method: "deliveryOrder", online: true, printed: false) + deliveryOrders audit doc
   - Platform prefixes: DD (DoorDash), UE (UberEats), SK (Skip), GH (Grubhub)

## Subscription & Billing
- **Plans:** Free (1 device), Starter $29/mo (1 device), Professional $69/mo (unlimited devices)
- **Stripe Price IDs:** Starter=`price_1T8TIlCIw3L7DOwIDUpngIcI`, Professional=`price_1T8s0hCIw3L7DOwIuHk36Ly3`
- **Owner override:** `OWNER_OVERRIDE_UID` = "0IV6GKQazUcp8hqoTsDG9dXIqrA3" (+3 free devices, bypasses all subscription gating, superadmin access)
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
- **Portal dropdowns:** `DropdownOption` + `DropdownArrayOptions` render to `document.body` (z-index: 9999/100001)
- **Auto-save:** TableCartHeader debounces cart saves by 2 seconds
- **Image caching:** `ProductImage` uses global `loadedImages` Set + Canvas prerendering + ResizeObserver
- **Employee auth:** Check settingsPassword OR `verifyEmployeePin(pin, permission)` from `utils/employeeAuth.ts`. `logEmployeeActivity()` writes to activityLog
- **Settings access:** `localStorage.isAuthedBackend` + redirect guard in AuthRoute
- **Customer Display:** `broadcastCartUpdate()` / `onCartUpdate()` from `utils/customerDisplayBroadcast.ts` — localStorage-based POS ↔ customer display sync (500ms poll)
- **Responsive breakpoints:** Desktop ≥ 1250px (3-column POS), Tablet 1000-1250px, Mobile < 1000px
- **Error handling:** ErrorBoundary at root + global window.onerror/unhandledrejection → /systemErrors (rate-limited)
- **Delete confirmations:** SweetAlert2 for all destructive actions (two-step: confirm + success)
- **Google Places:** `menuPortalTarget: document.body`, region "CA", debounce 800ms. Light + Dark theme styles in `googlePlacesStyles.ts`
- **Numeric strings:** All prices, quantities, taxes, percentages stored as strings, parsed with `parseFloat()` before arithmetic

## localStorage / sessionStorage Keys
- `savedUserState` — "true" when logged in (cleared on logout)
- `isAuthedBackend` — "true" when settings password entered (gates /authed routes)
- `walkthroughCompleted_{uid}` — per-user walkthrough completion flag
- `sessionStorage.loginLogged` — prevents duplicate login event logging per session
- `deviceID` cookie — browser device identifier (expires year 9999)
- `divine-pos-cart-sync` — customer display cart broadcast data

## Firestore Security Rules
- User-scoped: owner read/write on all subcollections
- Superadmin (OWNER_OVERRIDE_UID) has read access to all user data
- `/public/{uid}` — fully readable by anyone (online store data)
- `/systemLogs`, `/systemErrors` — anyone can create, only superadmin can read
- `/subscriptions`, `/payments` — read-only from client (Stripe extension manages writes)
- `/deliveryOrders` — anyone can write (Cloud Function), owner/superadmin read
- **Storage rules: OPEN** (all files readable/writable by anyone — security risk)
- **RTDB rules: DISABLED** (all reads/writes blocked, not used)

## Owner Override
`OWNER_OVERRIDE_UID` in `services/firebase/config.ts` = "0IV6GKQazUcp8hqoTsDG9dXIqrA3" (gets +3 free devices, bypasses subscription gating, superadmin console access)
