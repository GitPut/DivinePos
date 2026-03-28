import React, { useState } from "react";
import Modal from "shared/components/ui/Modal";
import { posState, updatePosState } from "store/posState";
import { tablesState, setCartState, storeDetailsState } from "store/appState";
import { auth, db } from "services/firebase/config";
import firebase from "firebase/compat/app";
import { useAlert } from "react-alert";
import { FiX, FiDollarSign, FiPlus, FiArrowRight, FiTrash2 } from "react-icons/fi";
import { TransListStateItem } from "types";

const TableOrderView = () => {
  const { tableOrderViewModal, tableOrderTarget, ongoingListState } = posState.use();
  const tables = tablesState.use();
  const storeDetails = storeDetailsState.use();
  const alertP = useAlert();
  const [showTransfer, setShowTransfer] = useState(false);
  const [cashMode, setCashMode] = useState(false);
  const [cashAmount, setCashAmount] = useState("");

  const close = () => {
    updatePosState({ tableOrderViewModal: false, tableOrderTarget: null });
    setShowTransfer(false);
    setCashMode(false);
    setCashAmount("");
  };

  if (!tableOrderTarget) return null;

  const total = parseFloat(tableOrderTarget.total || "0");
  const taxRate = parseFloat(storeDetails.taxRate || "13") / 100;
  const tax = total * taxRate;
  const grandTotal = total + tax;

  const handleAddItems = () => {
    setCartState(tableOrderTarget.cart || []);
    updatePosState({
      tableOrderViewModal: false,
      tableOrderTarget: null,
      tableViewActive: false,
      activeTableId: tableOrderTarget.tableId || null,
      activeTableSessionId: tableOrderTarget.id,
      cartNote: tableOrderTarget.cartNote || "",
    });
  };

  const completePayment = (paymentMethod: "Cash" | "Card") => {
    if (!auth.currentUser) return;

    if (paymentMethod === "Cash") {
      const cash = parseFloat(cashAmount);
      if (isNaN(cash) || cash < grandTotal) {
        alertP.error("Cash amount must be equal to or greater than the total");
        return;
      }
    }

    // Update pending order with payment details and free up the table
    db.collection("users")
      .doc(auth.currentUser?.uid)
      .collection("pendingOrders")
      .doc(tableOrderTarget.id)
      .update({
        total: grandTotal.toFixed(2),
        paymentMethod,
        tableId: firebase.firestore.FieldValue.delete(),
      })
      .catch(() => alertP.error("Failed to save order"));

    // Clear table state if this was the active table
    const { activeTableId } = posState.get();
    if (activeTableId === tableOrderTarget.tableId) {
      setCartState([]);
      updatePosState({
        activeTableId: null,
        activeTableSessionId: null,
        tableViewActive: true,
      });
    }

    alertP.success(
      `Table ${tableOrderTarget.tableName || ""} cashed out (${paymentMethod})`
    );
    close();
  };

  const handleTransfer = (targetTableId: string) => {
    if (!auth.currentUser) return;
    const targetTable = tables.find((t) => t.id === targetTableId);
    if (!targetTable) return;

    db.collection("users")
      .doc(auth.currentUser.uid)
      .collection("pendingOrders")
      .doc(tableOrderTarget.id)
      .update({
        tableId: targetTable.id,
        tableName: targetTable.name,
        tableNumber: targetTable.number,
      })
      .then(() => {
        alertP.success(`Transferred to ${targetTable.name}`);
        // If active table was the source, update
        const { activeTableId } = posState.get();
        if (activeTableId === tableOrderTarget.tableId) {
          updatePosState({
            activeTableId: targetTable.id,
          });
        }
        close();
      })
      .catch(() => alertP.error("Transfer failed"));
  };

  const handleCloseTable = () => {
    if (!auth.currentUser) return;
    if (!window.confirm("Close this table without payment? The order will be voided.")) return;

    db.collection("users")
      .doc(auth.currentUser.uid)
      .collection("pendingOrders")
      .doc(tableOrderTarget.id)
      .delete()
      .catch(() => {});

    const { activeTableId } = posState.get();
    if (activeTableId === tableOrderTarget.tableId) {
      setCartState([]);
      updatePosState({
        activeTableId: null,
        activeTableSessionId: null,
        tableViewActive: true,
      });
    }

    alertP.info("Table closed");
    close();
  };

  const availableTables = tables.filter(
    (t) =>
      t.isActive &&
      t.id !== tableOrderTarget.tableId &&
      !ongoingListState.find((o) => o.tableId === t.id && o.method === "tableOrder")
  );

  return (
    <Modal isVisible={tableOrderViewModal} onBackdropPress={close}>
      <div style={styles.container} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <span style={styles.title}>{tableOrderTarget.tableName || "Table"}</span>
            <span style={styles.subtitle}>
              {tableOrderTarget.guests || 0} guests
              {tableOrderTarget.server ? ` · ${tableOrderTarget.server}` : ""}
            </span>
          </div>
          <button style={styles.closeBtn} onClick={close}>
            <FiX size={22} color="#333" />
          </button>
        </div>

        {/* Order Items */}
        <div style={styles.itemsScroll}>
          {(tableOrderTarget.cart || []).length > 0 ? (
            (tableOrderTarget.cart || []).map((item, i) => (
              <div key={i} style={styles.itemRow}>
                <div style={styles.itemLeft}>
                  <span style={styles.itemQty}>{item.quantity || "1"}x</span>
                  <span style={styles.itemName}>{item.name}</span>
                </div>
                <span style={styles.itemPrice}>
                  ${(parseFloat(item.price) * parseFloat(item.quantity || "1")).toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <span style={styles.noItems}>No items ordered yet</span>
          )}
        </div>

        {/* Totals */}
        <div style={styles.totalsSection}>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Subtotal</span>
            <span style={styles.totalValue}>${total.toFixed(2)}</span>
          </div>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Tax ({(taxRate * 100).toFixed(0)}%)</span>
            <span style={styles.totalValue}>${tax.toFixed(2)}</span>
          </div>
          <div style={{ ...styles.totalRow, borderTop: "1px solid #e2e8f0", paddingTop: 8 }}>
            <span style={styles.grandTotalLabel}>Total</span>
            <span style={styles.grandTotalValue}>${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Cash Mode */}
        {cashMode && (
          <div style={styles.cashSection}>
            <input
              style={styles.cashInput}
              type="number"
              placeholder="Enter cash amount"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              autoFocus
            />
            {cashAmount && parseFloat(cashAmount) >= grandTotal && (
              <span style={styles.changeDue}>
                Change: ${(parseFloat(cashAmount) - grandTotal).toFixed(2)}
              </span>
            )}
            <div style={styles.cashBtnRow}>
              <button
                style={styles.confirmCashBtn}
                onClick={() => completePayment("Cash")}
              >
                <span style={styles.btnTxtWhite}>Complete Cash Payment</span>
              </button>
              <button style={styles.cancelCashBtn} onClick={() => { setCashMode(false); setCashAmount(""); }}>
                <span style={styles.btnTxtDark}>Cancel</span>
              </button>
            </div>
          </div>
        )}

        {/* Transfer Mode */}
        {showTransfer && (
          <div style={styles.transferSection}>
            <span style={styles.transferTitle}>Transfer to:</span>
            <div style={styles.transferGrid}>
              {availableTables.map((t) => (
                <button
                  key={t.id}
                  style={styles.transferTableBtn}
                  onClick={() => handleTransfer(t.id)}
                >
                  <span style={styles.transferTableTxt}>
                    #{t.number} {t.name}
                  </span>
                </button>
              ))}
              {availableTables.length === 0 && (
                <span style={styles.noTables}>No available tables</span>
              )}
            </div>
            <button style={styles.cancelCashBtn} onClick={() => setShowTransfer(false)}>
              <span style={styles.btnTxtDark}>Cancel</span>
            </button>
          </div>
        )}

        {/* Action Buttons */}
        {!cashMode && !showTransfer && (
          <div style={styles.actions}>
            <div style={styles.actionRow}>
              <button style={styles.cashOutBtn} onClick={() => setCashMode(true)}>
                <FiDollarSign size={16} color="#fff" />
                <span style={styles.btnTxtWhite}>Cash</span>
              </button>
              <button style={styles.cardBtn} onClick={() => completePayment("Card")}>
                <span style={styles.btnTxtWhite}>Card</span>
              </button>
            </div>
            <button style={styles.addItemsBtn} onClick={handleAddItems}>
              <FiPlus size={16} color="#1e293b" />
              <span style={styles.btnTxtDark}>Add Items</span>
            </button>
            <div style={styles.actionRow}>
              <button style={styles.secondaryBtn} onClick={() => setShowTransfer(true)}>
                <FiArrowRight size={14} color="#475569" />
                <span style={styles.secondaryBtnTxt}>Transfer</span>
              </button>
              <button style={styles.dangerBtn} onClick={handleCloseTable}>
                <FiTrash2 size={14} color="#ef4444" />
                <span style={{ ...styles.secondaryBtnTxt, color: "#ef4444" }}>Close Table</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 440,
    maxHeight: "85vh",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    display: "block",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
  },
  itemsScroll: {
    maxHeight: 200,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    borderTop: "1px solid #f1f5f9",
    borderBottom: "1px solid #f1f5f9",
    paddingTop: 10,
    paddingBottom: 10,
  },
  itemRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "4px 0",
  },
  itemLeft: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  itemQty: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6366f1",
    minWidth: 24,
  },
  itemName: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  noItems: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    padding: 20,
  },
  totalsSection: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 13,
    color: "#64748b",
  },
  totalValue: {
    fontSize: 13,
    color: "#1e293b",
    fontWeight: "500",
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  actionRow: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  cashOutBtn: {
    flex: 1,
    height: 44,
    backgroundColor: "#1e293b",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  cardBtn: {
    flex: 1,
    height: 44,
    backgroundColor: "#1e293b",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  addItemsBtn: {
    height: 40,
    backgroundColor: "#f1f5f9",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  secondaryBtn: {
    flex: 1,
    height: 36,
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  dangerBtn: {
    flex: 1,
    height: 36,
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  secondaryBtnTxt: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  btnTxtWhite: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  btnTxtDark: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  cashSection: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  cashInput: {
    height: 48,
    border: "2px solid #1e293b",
    borderRadius: 10,
    padding: "0 14px",
    fontSize: 18,
    fontWeight: "600",
    outline: "none",
    boxSizing: "border-box",
  },
  changeDue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#16a34a",
    textAlign: "center",
  },
  cashBtnRow: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  confirmCashBtn: {
    height: 44,
    backgroundColor: "#1e293b",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelCashBtn: {
    height: 36,
    backgroundColor: "#f1f5f9",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  transferSection: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  transferTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  transferGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    maxHeight: 150,
    overflowY: "auto",
  },
  transferTableBtn: {
    padding: "8px 16px",
    backgroundColor: "#dcfce7",
    border: "1px solid #16a34a",
    borderRadius: 8,
    cursor: "pointer",
  },
  transferTableTxt: {
    fontSize: 13,
    fontWeight: "600",
    color: "#15803d",
  },
  noTables: {
    fontSize: 13,
    color: "#94a3b8",
    padding: 10,
  },
};

export default TableOrderView;
