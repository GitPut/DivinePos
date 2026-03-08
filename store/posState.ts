import { entity } from "simpler-state";
import { AddressType, CustomerProp, OngoingListStateProp, Table, TransListStateItem } from "types";

interface PosState {
  section: string;
  deliveryModal: boolean;
  cashModal: boolean;
  ongoingDelivery: boolean;
  name: string;
  phone: string;
  address?: AddressType | null;
  buzzCode?: string | null;
  unitNumber?: string | null;
  deliveryChecked: boolean | null;
  changeDue: string;
  cartSub: number;
  saveCustomerModal: boolean;
  savedCustomerDetails: CustomerProp | null;
  ongoingOrderListModal: boolean;
  settingsPasswordModalVis: boolean;
  updatingOrder: OngoingListStateProp | null;
  ongoingListState: TransListStateItem[];
  clockinModal: boolean;
  discountModal: boolean;
  discountAmount: string | null;
  cartNote: string;
  customCashModal: boolean;
  authPasswordModal: boolean;
  managerAuthorizedStatus: boolean;
  pendingAuthAction: string;
  pendingAuthPermission: string;
  tableViewActive: boolean;
  activeTableId: string | null;
  activeTableSessionId: string | null;
  openTableModal: boolean;
  openTableTarget: Table | null;
  tableOrderViewModal: boolean;
  tableOrderTarget: TransListStateItem | null;
}

export const posState = entity<PosState>({
  section: "",
  deliveryModal: false,
  cashModal: false,
  ongoingDelivery: false,
  name: "",
  phone: "",
  address: null,
  buzzCode: "",
  unitNumber: "",
  deliveryChecked: false,
  changeDue: "",
  cartSub: 0,
  saveCustomerModal: false,
  savedCustomerDetails: null,
  ongoingOrderListModal: false,
  settingsPasswordModalVis: false,
  updatingOrder: null,
  ongoingListState: [],
  clockinModal: false,
  discountModal: false,
  discountAmount: null,
  cartNote: "",
  customCashModal: false,
  authPasswordModal: false,
  managerAuthorizedStatus: false,
  pendingAuthAction: "",
  pendingAuthPermission: "",
  tableViewActive: false,
  activeTableId: null,
  activeTableSessionId: null,
  openTableModal: false,
  openTableTarget: null,
  tableOrderViewModal: false,
  tableOrderTarget: null,
});

export const setPosState = (val: PosState): void => {
  posState.set(val);
};

export const resetPosState = (): void => {
  posState.set({
    ...posState.get(),
    deliveryModal: false,
    cashModal: false,
    ongoingDelivery: false,
    name: "",
    phone: "",
    address: null,
    buzzCode: "",
    unitNumber: "",
    deliveryChecked: false,
    changeDue: "",
    cartSub: 0,
    saveCustomerModal: false,
    savedCustomerDetails: null,
    ongoingOrderListModal: false,
    settingsPasswordModalVis: false,
    updatingOrder: null,
    clockinModal: false,
    discountModal: false,
    discountAmount: null,
    cartNote: "",
    customCashModal: false,
    authPasswordModal: false,
    managerAuthorizedStatus: false,
    pendingAuthAction: "",
    pendingAuthPermission: "",
    tableViewActive: false,
    activeTableId: null,
    activeTableSessionId: null,
    openTableModal: false,
    openTableTarget: null,
    tableOrderViewModal: false,
    tableOrderTarget: null,
  });
};

export const updatePosState = (val: Partial<PosState>): void => {
  posState.set({ ...posState.get(), ...val });
};
