import React, { useState, useEffect, useRef, useCallback } from "react";
import { IoSearch, IoClose } from "react-icons/io5";
import { FiDownload, FiPrinter } from "react-icons/fi";
import InvoiceItem from "./components/InvoiceItem";
import { deviceState, storeDetailsState } from "store/appState";
import { Excel as ExcelDownload } from "antd-table-saveas-excel";
import { auth, db } from "services/firebase/config";
import { receiptPrint } from "services/printing/receiptPrint";
import { useAlert } from "react-alert";
import qz from "qz-tray";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { ExcelTransListStateItem, TransListStateItem } from "types";
import ComponentLoader from "shared/components/ui/ComponentLoader";

const PAGE_SIZE = 100;

const Invoices = () => {
  const [invoices, setInvoices] = useState<TransListStateItem[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<
    TransListStateItem[]
  >([]);
  const [isDateFiltered, setIsDateFiltered] = useState(false);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);

  const alertP = useAlert();
  const storeDetails = storeDetailsState.use();
  const myDeviceDetails = deviceState.use();
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const lastVisibleDoc = useRef<firebase.firestore.DocumentSnapshot | null>(
    null
  );

  const formatInvoiceDoc = (
    doc: firebase.firestore.DocumentSnapshot
  ): TransListStateItem => {
    const data = doc.data() as TransListStateItem;
    const orderType =
      data.method === "deliveryOrder"
        ? "Delivery"
        : data.method === "pickupOrder"
        ? "Pickup"
        : data.method === "inStoreOrder"
        ? "In Store"
        : "Other";

    return {
      ...data,
      id: data.transNum?.toUpperCase() ?? doc.id,
      name: data.customer?.name || "N/A",
      date: data.date,
      amount: data.total,
      system: data.online ? "Online" : (data as any).deliveryPlatform ? (data as any).deliveryPlatform : "POS",
      type: orderType,
      method: data.method,
      originalData: {
        ...data,
        cart: data.cart ?? [],
        cartNote: data.cartNote ?? "",
        customer: data.customer ?? { name: "", phone: "" },
        method: data.method ?? "",
        online: data.online ?? false,
        isInStoreOrder: data.isInStoreOrder ?? false,
        transNum: data.transNum ?? "",
        total: data.total ?? "",
        date: data.date,
        id: data.id,
      },
      docID: doc.id,
    };
  };

  const fetchInvoices = async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      let query = db
        .collection("users")
        .doc(auth.currentUser?.uid)
        .collection("transList")
        .orderBy("date", "desc")
        .limit(PAGE_SIZE);

      if (lastVisibleDoc.current) {
        query = query.startAfter(lastVisibleDoc.current);
      }

      const snapshot = await query.get();
      const newInvoices = snapshot.docs.map(formatInvoiceDoc);

      if (snapshot.docs.length > 0) {
        lastVisibleDoc.current = snapshot.docs[snapshot.docs.length - 1];
      }
      if (snapshot.docs.length < PAGE_SIZE) {
        hasMoreRef.current = false;
      }

      setInvoices((prev) => [...prev, ...newInvoices]);
    } catch (err) {
      alertP.error("Failed to load invoices");
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setInitialLoad(true);
    }
  };

  useEffect(() => {
    fetchInvoices();
    return () => {
      lastVisibleDoc.current = null;
    };
  }, []);

  const filterByDate = useCallback(async () => {
    if (!startDate || !endDate) {
      alertP.error("Please select both start and end dates.");
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    try {
      const start = new Date(startDate + "T00:00:00");
      const end = new Date(endDate + "T23:59:59.999");

      const snapshot = await db
        .collection("users")
        .doc(auth.currentUser?.uid)
        .collection("transList")
        .where("date", ">=", start)
        .where("date", "<=", end)
        .orderBy("date", "desc")
        .get();

      setFilteredInvoices(snapshot.docs.map(formatInvoiceDoc));
      setIsDateFiltered(true);
    } catch (err) {
      alertP.error("Failed to filter invoices");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [startDate, endDate]);

  const printTotals = (date: Date, dateName: string) => {
    const todayStart = new Date(date);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(date);
    todayEnd.setHours(23, 59, 59, 999);

    db.collection("users")
      .doc(auth.currentUser?.uid)
      .collection("transList")
      .where("date", ">=", todayStart)
      .where("date", "<=", todayEnd)
      .get()
      .then((querySnapshot) => {
        let totalRevenue = 0;
        const totalSales = querySnapshot.size;

        querySnapshot.forEach((doc) => {
          const docData = doc.data() as TransListStateItem;
          totalRevenue += parseFloat(docData.total ?? "0");
        });

        if (totalSales === 0) {
          alertP.error(`No sales ${dateName}`);
          return;
        }

        const data = [
          "\x1B" + "\x40",
          "                                                                              ",
          "\x0A",
          "\x1B" + "\x61" + "\x31",
          storeDetails.name,
          "\x0A",
          storeDetails.address?.label + "\x0A",
          storeDetails.website + "\x0A",
          storeDetails.phoneNumber + "\x0A",
          date.toDateString() + "\x0A",
          "\x0A",
          `${dateName}s Report` + "\x0A",
          "\x0A",
          "\x0A",
          "\x0A",
          "\x1B" + "\x61" + "\x30",
          `${dateName}s Total Revenue: $${totalRevenue.toFixed(2)}`,
          "\x0A",
          `${dateName}s Total Sales: ${totalSales}`,
          "\x0A",
          "\x0A",
          "\x0A",
          "------------------------------------------" + "\x0A",
          "\x0A",
          "\x0A",
          "\x0A",
          "\x0A",
          "\x0A",
          "\x0A",
          "\x0A",
          "\x1D" + "\x56" + "\x00",
        ];

        if (
          myDeviceDetails.sendPrintToUserID &&
          myDeviceDetails.useDifferentDeviceToPrint
        ) {
          db.collection("users")
            .doc(auth.currentUser?.uid)
            .collection("devices")
            .doc(myDeviceDetails.sendPrintToUserID.value)
            .collection("printRequests")
            .add({ printData: data });
        } else {
          if (!myDeviceDetails.printToPrinter) {
            alertP.error("You must specify a printer in device settings");
            return;
          }
          const printer = myDeviceDetails.printToPrinter;
          qz.websocket
            .connect()
            .then(() => {
              const config = qz.configs.create(printer);
              return qz.print(config, data);
            })
            .finally(() => qz.websocket.disconnect());
        }
      })
      .catch((error) => {
        alertP.error("An error occurred while fetching invoices.");
      });
  };

  const handlePrint = useCallback(async () => {
    if (selectedRows.length === 0) {
      alertP.error("Select one or more receipts to print.");
      return;
    }

    try {
      let printData: string[] = [];
      const list = isDateFiltered ? filteredInvoices : invoices;

      selectedRows.forEach((id) => {
        const item = list.find((inv) => inv.id === id);
        if (item) {
          const data = receiptPrint(item, storeDetails, true);
          printData = printData.concat(data.data);
        }
      });

      if (
        myDeviceDetails.sendPrintToUserID &&
        myDeviceDetails.useDifferentDeviceToPrint
      ) {
        await db
          .collection("users")
          .doc(auth.currentUser?.uid)
          .collection("devices")
          .doc(myDeviceDetails.sendPrintToUserID.value)
          .collection("printRequests")
          .add({ printData });
      } else {
        await qz.websocket.connect();
        if (!myDeviceDetails.printToPrinter) {
          alertP.error("You must specify a printer in device settings");
          return;
        }
        const config = qz.configs.create(myDeviceDetails.printToPrinter);
        await qz.print(config, printData);
        await qz.websocket.disconnect();
      }
    } catch (err: any) {
      alertP.error("Printing failed. Check printer connection or settings.");
    } finally {
      setSelectedRows([]);
    }
  }, [selectedRows, invoices, filteredInvoices, isDateFiltered]);

  const handleExcelDownload = useCallback(() => {
    if (selectedRows.length === 0) {
      alertP.error("No rows selected for export");
      return;
    }

    const dataSource: ExcelTransListStateItem[] = selectedRows
      .map((id) => {
        const list = isDateFiltered ? filteredInvoices : invoices;
        const invoice = list.find((inv) => inv.id === id);
        return invoice ? { ...invoice, date: invoice.date.toDate() } : null;
      })
      .filter(Boolean) as ExcelTransListStateItem[];

    const excel = new ExcelDownload();
    excel
      .addSheet("Receipts")
      .addColumns([
        { title: "Order ID", dataIndex: "id" },
        { title: "Customer", dataIndex: "name" },
        { title: "Date", dataIndex: "date" },
        { title: "Total", dataIndex: "amount" },
        { title: "System", dataIndex: "system" },
        { title: "Type", dataIndex: "type" },
      ])
      .addDataSource(dataSource)
      .saveAs("Receipts.xlsx");
  }, [selectedRows, invoices, filteredInvoices, isDateFiltered]);

  const handleDelete = async (item: TransListStateItem) => {
    try {
      await db
        .collection("users")
        .doc(auth.currentUser?.uid)
        .collection("transList")
        .doc(item.docID)
        .delete();

      setInvoices((prev) => prev.filter((e) => e.id !== item.id));
      setFilteredInvoices((prev) => prev.filter((e) => e.id !== item.id));
    } catch (err) {
    }
  };

  const baseList = isDateFiltered ? filteredInvoices : invoices;
  const listToRender = search
    ? baseList.filter((inv) => {
        const q = search.toLowerCase();
        return (
          inv.id?.toLowerCase().includes(q) ||
          inv.name?.toLowerCase().includes(q) ||
          inv.type?.toLowerCase().includes(q)
        );
      })
    : baseList;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isDateFiltered) return;
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) {
      fetchInvoices();
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <span style={styles.title}>Invoices</span>
          <span style={styles.subtitle}>
            {listToRender.length} transaction{listToRender.length !== 1 ? "s" : ""}
            {selectedRows.length > 0 && ` \u00B7 ${selectedRows.length} selected`}
          </span>
        </div>
        <div style={styles.actionBtns}>
          <button style={styles.actionBtn} onClick={handleExcelDownload} title="Export to Excel">
            <FiDownload size={18} color="#475569" />
            <span style={styles.actionBtnText}>Export</span>
          </button>
          <button style={styles.actionBtn} onClick={handlePrint} title="Print selected">
            <FiPrinter size={18} color="#475569" />
            <span style={styles.actionBtnText}>Print</span>
          </button>
          <button
            style={styles.actionBtn}
            onClick={() => {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              printTotals(yesterday, "Yesterday");
            }}
          >
            <span style={styles.actionBtnText}>Print Yesterday</span>
          </button>
          <button
            style={styles.actionBtn}
            onClick={() => printTotals(new Date(), "Today")}
          >
            <span style={styles.actionBtnText}>Print Today</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filtersRow}>
        <div style={styles.searchBox}>
          <IoSearch size={16} color="#94a3b8" />
          <input
            style={styles.searchInput}
            placeholder="Search by ID, customer, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={styles.dateFilters}>
          <input
            type="date"
            style={styles.dateInput}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span style={styles.dateSeparator}>to</span>
          <input
            type="date"
            style={styles.dateInput}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button style={styles.filterBtn} onClick={filterByDate}>
            Filter
          </button>
          {isDateFiltered && (
            <button
              style={styles.clearFilterBtn}
              onClick={() => { setFilteredInvoices([]); setIsDateFiltered(false); }}
            >
              <IoClose size={16} color="#64748b" />
              <span style={{ fontSize: 13, color: "#64748b" }}>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <div style={styles.tableHeader}>
          <div style={{ width: 40 }} />
          <span style={{ ...styles.headerCell, flex: 1.2 }}>Order ID</span>
          <span style={{ ...styles.headerCell, flex: 1.5 }}>Customer</span>
          <span style={{ ...styles.headerCell, flex: 1.8 }}>Date</span>
          <span style={{ ...styles.headerCell, flex: 0.8 }}>Total</span>
          <span style={{ ...styles.headerCell, flex: 0.7 }}>System</span>
          <span style={{ ...styles.headerCell, flex: 0.8 }}>Type</span>
          <div style={{ width: 40 }} />
        </div>

        <div style={styles.tableBody} onScroll={handleScroll}>
          {listToRender.map((item) => (
            <InvoiceItem
              key={item.id}
              item={item}
              setbaseSelectedRows={setSelectedRows}
              baseSelectedRows={selectedRows}
              deleteTransaction={() => handleDelete(item)}
            />
          ))}
          {loading && initialLoad && (
            <div style={{ padding: 20, textAlign: "center", width: "100%" }}>
              <span style={{ color: "#94a3b8", fontSize: 13 }}>Loading more...</span>
            </div>
          )}
          {initialLoad && listToRender.length === 0 && (
            <div style={{ padding: 48, textAlign: "center", width: "100%" }}>
              <span style={{ color: "#94a3b8", fontSize: 14 }}>No invoices found.</span>
            </div>
          )}
        </div>
      </div>

      {!initialLoad && <ComponentLoader />}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
    padding: 30,
    boxSizing: "border-box",
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontWeight: "700",
    fontSize: 24,
    color: "#0f172a",
    display: "block",
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 4,
    display: "block",
  },
  actionBtns: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  actionBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: "500",
    color: "#475569",
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#475569",
  },
  filtersRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  searchBox: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "8px 12px",
    flex: 1,
    maxWidth: 320,
  },
  searchInput: {
    flex: 1,
    border: "none",
    backgroundColor: "transparent",
    fontSize: 14,
    color: "#334155",
    outline: "none",
  },
  dateFilters: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateInput: {
    padding: "8px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 13,
    color: "#334155",
    backgroundColor: "#f8fafc",
  },
  dateSeparator: {
    fontSize: 13,
    color: "#94a3b8",
  },
  filterBtn: {
    padding: "8px 16px",
    backgroundColor: "#1D294E",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: "600",
    cursor: "pointer",
  },
  clearFilterBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: "8px 12px",
    backgroundColor: "#f1f5f9",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  tableWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    minHeight: 0,
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "0 16px",
    height: 42,
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  headerCell: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableBody: {
    flex: 1,
    overflow: "auto",
  },
};

export default Invoices;
