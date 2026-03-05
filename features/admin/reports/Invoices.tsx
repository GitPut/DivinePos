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
      system: "POS",
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
      <div style={styles.header}>
        <span style={styles.title}>Invoices Report</span>
      </div>

      <div style={styles.filters}>
        <input
          style={styles.searchInput}
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <button style={styles.searchBtn} onClick={filterByDate}>
          <IoSearch size={20} color="#fff" />
        </button>
        <button
          style={styles.resetBtn}
          onClick={() => { setFilteredInvoices([]); setIsDateFiltered(false); }}
        >
          <IoClose size={20} color="#fff" />
        </button>

        <button style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }} onClick={handleExcelDownload}>
          <FiDownload size={22} />
        </button>
        <button style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }} onClick={handlePrint}>
          <FiPrinter size={22} />
        </button>
        <button
          style={styles.printTotalsBtn}
          onClick={() => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            printTotals(yesterday, "Yesterday");
          }}
        >
          <span>Print Yesterday</span>
        </button>
        <button
          style={styles.printTotalsBtn}
          onClick={() => {
            const today = new Date();
            printTotals(today, "Today");
          }}
        >
          <span>Print Today</span>
        </button>
      </div>

      <div style={{ overflow: "auto", flex: 1, width: "100%", minHeight: 0 }} onScroll={handleScroll}>
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
            <span style={{ color: "#888", fontSize: 14 }}>Loading more...</span>
          </div>
        )}
      </div>

      {!initialLoad && <ComponentLoader />}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: "flex", flex: 1, backgroundColor: "#fff", alignItems: "center", flexDirection: "column", overflow: "hidden", height: "100%" },
  header: { marginTop: 20, marginBottom: 20, width: "95%" },
  title: { fontWeight: "700", fontSize: 16, color: "#121212" },
  filters: {
    display: "flex",
    flexDirection: "row",
    width: "95%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchInput: {
    width: 200,
    height: 34,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingLeft: 10,
    paddingRight: 10,
    borderStyle: "solid",
  },
  searchBtn: {
    backgroundColor: "green",
    padding: 8,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
  resetBtn: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
  printTotalsBtn: {
    border: "none",
    background: "none",
    cursor: "pointer",
  },
};

export default Invoices;
