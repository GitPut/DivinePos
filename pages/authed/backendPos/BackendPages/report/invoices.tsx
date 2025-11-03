import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import InvoiceItem from "./components/InvoiceItem";
import { myDeviceDetailsState, storeDetailState } from "state/state";
import { Excel as ExcelDownload } from "antd-table-saveas-excel";
import { auth, db } from "state/firebaseConfig";
import ReceiptPrint from "components/functional/ReceiptPrint";
import { useAlert } from "react-alert";
import qz from "qz-tray";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { ExcelTransListStateItem, TransListStateItem } from "types/global";
import ComponentLoader from "components/ComponentLoader";

const PAGE_SIZE = 100;

const InvoiceReport = () => {
  const [invoices, setInvoices] = useState<TransListStateItem[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<
    TransListStateItem[]
  >([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);

  const alertP = useAlert();
  const storeDetails = storeDetailState.use();
  const myDeviceDetails = myDeviceDetailsState.use();
  const lastVisibleDoc = useRef<firebase.firestore.DocumentSnapshot | null>(
    null
  );

  // 🔧 Utility: Format a single Firestore doc into invoice object
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
      },
      docID: doc.id,
    };
  };

  // 🔹 Fetch invoices (pagination)
  const fetchInvoices = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      const query = db
        .collection("users")
        .doc(auth.currentUser?.uid)
        .collection("transList")
        .orderBy("date", "desc")
        .limit(PAGE_SIZE);

      const snapshot = lastVisibleDoc.current
        ? await query.startAfter(lastVisibleDoc.current).get()
        : await query.get();

      const newInvoices = snapshot.docs.map(formatInvoiceDoc);

      if (snapshot.docs.length > 0) {
        lastVisibleDoc.current = snapshot.docs[snapshot.docs.length - 1];
      }

      setInvoices((prev) => [...prev, ...newInvoices]);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      alertP.error("Failed to load invoices");
    } finally {
      setLoading(false);
      if (!initialLoad) setInitialLoad(true);
    }
  }, [loading, initialLoad]);

  // 🔹 Fetch on mount
  useEffect(() => {
    fetchInvoices();
    return () => {
      lastVisibleDoc.current = null;
    };
  }, []);

  const filterByDate = useCallback(() => {
    if (!startDate || !endDate) {
      alertP.error("Please select both start and end dates.");
      return;
    }

    // Convert input dates to strings for comparison
    const startStr = startDate; // "YYYY-MM-DD"
    const endStr = endDate;

    const filtered = invoices.filter((inv) => {
      const invDateObj =
        inv.date instanceof Date ? inv.date : inv.date.toDate?.();
      if (!invDateObj) return false;

      const invStr = invDateObj.toISOString().slice(0, 10); // "YYYY-MM-DD"
      return invStr >= startStr && invStr <= endStr;
    });

    setFilteredInvoices(filtered);
  }, [startDate, endDate, invoices]);

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
          "\x1B" + "\x40", // init
          "                                                                              ", // line break
          "\x0A",
          "\x1B" + "\x61" + "\x31", // center align
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
          "\x1B" + "\x61" + "\x30", // left align
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
          qz.websocket
            .connect()
            .then(() => {
              const config = qz.configs.create(myDeviceDetails.printToPrinter);
              return qz.print(config, data);
            })
            .finally(() => qz.websocket.disconnect());
        }
      })
      .catch((error) => {
        console.error("Error fetching documents: ", error);
        alertP.error("An error occurred while fetching invoices.");
      });
  };

  // 🔹 Handle print
  const handlePrint = useCallback(async () => {
    if (selectedRows.length === 0) {
      alertP.error("Select one or more receipts to print.");
      return;
    }

    try {
      let printData: string[] = [];
      const list = filteredInvoices.length > 0 ? filteredInvoices : invoices;

      selectedRows.forEach((id) => {
        const item = list.find((inv) => inv.id === id);
        if (item) {
          const data = ReceiptPrint(item, storeDetails, true);
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
      console.error("Print error:", err);
      alertP.error("Printing failed. Check printer connection or settings.");
    } finally {
      setSelectedRows([]);
    }
  }, [selectedRows, invoices, filteredInvoices]);

  // 🔹 Download Excel
  const handleExcelDownload = useCallback(() => {
    if (selectedRows.length === 0) {
      alertP.error("No rows selected for export");
      return;
    }

    const dataSource: ExcelTransListStateItem[] = selectedRows
      .map((id) => {
        const list = filteredInvoices.length > 0 ? filteredInvoices : invoices;
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
  }, [selectedRows, invoices, filteredInvoices]);

  // 🔹 Delete Transaction
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
      console.error("Error deleting invoice:", err);
    }
  };

  // 🔹 Render
  const listToRender =
    filteredInvoices.length > 0 ? filteredInvoices : invoices;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoices Report</Text>
      </View>

      <View style={styles.filters}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search invoices..."
          value={search}
          onChangeText={setSearch}
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

        <Pressable style={styles.searchBtn} onPress={filterByDate}>
          <Ionicons name="search" size={20} color="#fff" />
        </Pressable>
        <Pressable
          style={styles.resetBtn}
          onPress={() => setFilteredInvoices([])}
        >
          <Ionicons name="close" size={20} color="#fff" />
        </Pressable>

        <Pressable onPress={handleExcelDownload}>
          <Feather name="download" size={22} />
        </Pressable>
        <Pressable onPress={handlePrint}>
          <Feather name="printer" size={22} />
        </Pressable>
        <Pressable
          style={styles.printTotalsBtn}
          onPress={() => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            printTotals(yesterday, "Yesterday");
          }}
        >
          <Text>Print Yesterday</Text>
        </Pressable>
        <Pressable
          style={styles.printTotalsBtn}
          onPress={() => {
            const today = new Date();
            printTotals(today, "Today");
          }}
        >
          <Text>Print Today</Text>
        </Pressable>
      </View>

      <FlatList
        data={listToRender}
        keyExtractor={(item) => item.id}
        onEndReached={fetchInvoices}
        onEndReachedThreshold={0.1}
        renderItem={({ item }) => (
          <InvoiceItem
            item={item}
            setbaseSelectedRows={setSelectedRows}
            baseSelectedRows={selectedRows}
            deleteTransaction={() => handleDelete(item)}
          />
        )}
      />

      {!initialLoad && <ComponentLoader />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center" },
  header: { marginVertical: 20, width: "95%" },
  title: { fontWeight: "700", fontSize: 16, color: "#121212" },
  filters: {
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
    paddingHorizontal: 10,
  },
  searchBtn: {
    backgroundColor: "green",
    padding: 8,
    borderRadius: 8,
  },
  resetBtn: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 8,
  },
});

export default InvoiceReport;
