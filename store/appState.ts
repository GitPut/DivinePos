import { entity } from "simpler-state";
import {
  AddressType,
  CartItemProp,
  CustomerProp,
  Device,
  Employee,
  FranchiseConfig,
  FranchiseRole,
  Ingredient,
  MyDeviceDetailsProps,
  OptionTemplate,
  ProductProp,
  StoreDetailsProps,
  Table,
  TransListStateItem,
  TrialDetailsStateProps,
  UserStoreStateProps,
} from "types";

// ─── Cart ────────────────────────────────────────────────────────────────────

export const cartState = entity<CartItemProp[]>([]);

export const setCartState = (val: CartItemProp[]): void => {
  cartState.set(val);
};

export const addCartState = (
  val: CartItemProp,
  currentState: CartItemProp[]
): void => {
  const existingIndex = currentState.findIndex(
    (item) =>
      item.name === val.name &&
      item.price === val.price &&
      JSON.stringify(item.options) === JSON.stringify(val.options) &&
      item.extraDetails === val.extraDetails
  );

  if (existingIndex !== -1) {
    const updated = currentState.map((item, index) => {
      if (index === existingIndex) {
        return {
          ...item,
          quantity: item.quantity ? String(parseFloat(item.quantity) + 1) : "2",
        };
      }
      return item;
    });
    cartState.set(updated);
  } else {
    cartState.set([...currentState, val]);
  }
};

// ─── Store Products ───────────────────────────────────────────────────────────

export const storeProductsState = entity<UserStoreStateProps>({
  products: [],
  categories: [],
});

export const updateStoreProductsState = (val: Partial<UserStoreStateProps>) => {
  storeProductsState.set({ ...storeProductsState.get(), ...val });
};

export const setStoreProductsState = (val: UserStoreStateProps) => {
  storeProductsState.set(val);
};

// ─── WooCommerce ──────────────────────────────────────────────────────────────

interface WooCommerceStateProps {
  apiUrl: string;
  ck: string;
  cs: string;
  useWoocommerce: boolean;
}

export const wooCommerceState = entity<WooCommerceStateProps>({
  apiUrl: "",
  ck: "",
  cs: "",
  useWoocommerce: false,
});

export const setWooCommerceState = (val: WooCommerceStateProps): void => {
  wooCommerceState.set(val);
};


// ─── Store Details ────────────────────────────────────────────────────────────

export const storeDetailsState = entity<StoreDetailsProps>({
  name: "",
  phoneNumber: "",
  website: "",
  deliveryPrice: "",
  settingsPassword: "",
  taxRate: "",
  acceptDelivery: false,
  deliveryRange: "",
});

export const setStoreDetailsState = (val: StoreDetailsProps): void => {
  storeDetailsState.set(val);
};

// ─── Trial ────────────────────────────────────────────────────────────────────

export const trialDetailsState = entity<TrialDetailsStateProps>({
  endDate: null,
  hasEnded: null,
});

export const setTrialDetailsState = (val: TrialDetailsStateProps): void => {
  trialDetailsState.set(val);
};

// ─── Settings Auth ────────────────────────────────────────────────────────────

export const settingsAuthState = entity<boolean>(false);

export const setSettingsAuthState = (val: boolean): void => {
  settingsAuthState.set(val);
};

// ─── Customers ────────────────────────────────────────────────────────────────

export const customersState = entity<CustomerProp[]>([]);

export const setCustomersState = (val: CustomerProp[]): void => {
  customersState.set(val);
};

// ─── Device ───────────────────────────────────────────────────────────────────

export const deviceState = entity<MyDeviceDetailsProps>({
  name: null,
  id: null,
  docID: null,
  useDifferentDeviceToPrint: false,
  printToPrinter: null,
  sendPrintToUserID: null,
  printOnlineOrders: false,
});

export const setDeviceState = (val: MyDeviceDetailsProps): void => {
  deviceState.set(val);
};

export const resetDeviceState = (): void => {
  deviceState.set({
    name: null,
    id: null,
    docID: null,
    useDifferentDeviceToPrint: false,
    printToPrinter: null,
    sendPrintToUserID: null,
    printOnlineOrders: false,
  });
};

// ─── Employees ────────────────────────────────────────────────────────────────

export const employeesState = entity<Employee[]>([]);

export const setEmployeesState = (val: Employee[]): void => {
  employeesState.set(val);
};

// ─── Online Store ─────────────────────────────────────────────────────────────

export interface OnlineStoreStateProps {
  onlineStoreActive: boolean;
  onlineStoreSetUp: boolean;
  urlEnding: string;
  stripePublicKey: string | null;
  stripeSecretKey: string | null;
  paidStatus: string | null;
  brandColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  tagline?: string;
  headline?: string;
  subheadline?: string;
  heroImageUrl?: string;
  fontStyle?: "modern" | "classic" | "bold";
  socialLinks?: { facebook?: string; instagram?: string; twitter?: string };
  businessHours?: { [day: string]: { open: string; close: string; closed?: boolean } };
}

export const onlineStoreState = entity<OnlineStoreStateProps>({
  onlineStoreActive: false,
  onlineStoreSetUp: false,
  urlEnding: "",
  stripePublicKey: "",
  stripeSecretKey: "",
  paidStatus: null,
});

export const setOnlineStoreState = (val: OnlineStoreStateProps) => {
  onlineStoreState.set(val);
};

// ─── Device ID ────────────────────────────────────────────────────────────────

export const deviceIdState = entity<string | null>(null);

export const setDeviceIdState = (val: string | null): void => {
  deviceIdState.set(val);
};

// ─── Device Tree ──────────────────────────────────────────────────────────────

interface DeviceTreeProps {
  devices: Device[];
}

export const deviceTreeState = entity<DeviceTreeProps>({
  devices: [],
});

export const setDeviceTreeState = (val: DeviceTreeProps): void => {
  deviceTreeState.set(val);
};

// ─── Active Plan ──────────────────────────────────────────────────────────────

export type ActivePlan = "none" | "trial" | "starter" | "professional";
export const activePlanState = entity<ActivePlan>("none");
export const setActivePlanState = (val: ActivePlan): void => {
  activePlanState.set(val);
};

// ─── Transaction List ─────────────────────────────────────────────────────────

export const transListState = entity<TransListStateItem[]>([]);

export const setTransListState = (val: TransListStateItem[]): void => {
  transListState.set(val);
};

// ─── Product Builder ──────────────────────────────────────────────────────────

interface ProductBuilderStateProps {
  product: ProductProp | null;
  itemIndex?: number | null;
  imageUrl?: string | null;
  isOnlineOrder?: boolean | null;
  isOpen: boolean | null;
}

export const productBuilderState = entity<ProductBuilderStateProps>({
  product: null,
  itemIndex: null,
  imageUrl: "",
  isOnlineOrder: false,
  isOpen: false,
});

export const setProductBuilderState = (
  val: Partial<ProductBuilderStateProps>
): void => {
  productBuilderState.set({ ...productBuilderState.get(), ...val });
};

export const resetProductBuilderState = (): void => {
  const current = productBuilderState.get();
  productBuilderState.set({ ...current, isOpen: false });
  setTimeout(() => {
    productBuilderState.set({
      product: null,
      itemIndex: null,
      imageUrl: "",
      isOnlineOrder: current.isOnlineOrder,
      isOpen: false,
    });
  }, 200);
};

// ─── Order Details ────────────────────────────────────────────────────────────

interface OrderDetailsStateProps {
  date: Date | { seconds: number; nanoseconds: number; toDate: () => Date } | null;
  transNum: string | null;
  total: string | null;
  method: "deliveryOrder" | "pickupOrder" | null;
  online: boolean;
  delivery: boolean | null;
  address?: AddressType | null;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: AddressType | null;
    buzzCode?: string;
    unitNumber?: string;
  };
  cart: CartItemProp[];
  page: number;
  selectedLocationUid?: string | null;
}

export const orderDetailsState = entity<OrderDetailsStateProps>({
  date: null,
  transNum: null,
  total: null,
  method: null,
  online: true,
  delivery: null,
  address: null,
  customer: {
    name: "",
    phone: "",
    email: "",
    address: null,
    buzzCode: "",
    unitNumber: "",
  },
  cart: [],
  page: 1,
});

export const setOrderDetailsState = (
  val: Partial<OrderDetailsStateProps>
): void => {
  orderDetailsState.set({
    ...orderDetailsState.get(),
    ...val,
    customer: { ...orderDetailsState.get().customer, ...val.customer },
  });
};

// ─── Option Templates ────────────────────────────────────────────────────────

export const optionTemplatesState = entity<OptionTemplate[]>([]);

export const setOptionTemplatesState = (val: OptionTemplate[]): void => {
  optionTemplatesState.set(val);
};

// ─── Ingredients ─────────────────────────────────────────────────────────────

export const ingredientsState = entity<Ingredient[]>([]);

export const setIngredientsState = (val: Ingredient[]): void => {
  ingredientsState.set(val);
};

export const updateIngredientStock = (
  ingredientId: string,
  newQuantity: number
): void => {
  const current = ingredientsState.get();
  ingredientsState.set(
    current.map((ing) =>
      ing.id === ingredientId ? { ...ing, stockQuantity: newQuantity } : ing
    )
  );
};

// ─── Tables ──────────────────────────────────────────────────────────────────

export const tablesState = entity<Table[]>([]);

export const setTablesState = (val: Table[]): void => {
  tablesState.set(val);
};

export const tableSectionsState = entity<string[]>([]);

export const setTableSectionsState = (val: string[]): void => {
  tableSectionsState.set(val);
};

// ─── Ingredients (batch) ─────────────────────────────────────────────────────

export const updateIngredientsBatch = (
  updates: { ingredientId: string; newStock: number }[]
): void => {
  const current = ingredientsState.get();
  ingredientsState.set(
    current.map((ing) => {
      const update = updates.find((u) => u.ingredientId === ing.id);
      return update ? { ...ing, stockQuantity: update.newStock } : ing;
    })
  );
};

// ─── Franchise ──────────────────────────────────────────────────────────────

interface FranchiseStateProps {
  franchiseId: string | null;
  franchiseRole: FranchiseRole;
  config: FranchiseConfig | null;
}

export const franchiseState = entity<FranchiseStateProps>({
  franchiseId: null,
  franchiseRole: null,
  config: null,
});

export const setFranchiseState = (val: FranchiseStateProps): void => {
  franchiseState.set(val);
};

export const updateFranchiseState = (val: Partial<FranchiseStateProps>): void => {
  franchiseState.set({ ...franchiseState.get(), ...val });
};
