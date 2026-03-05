import React from "react";
import { IoClose } from "react-icons/io5";
import { TransListStateItem } from "types";

interface InvoiceItemProps {
  style?: React.CSSProperties;
  item: TransListStateItem;
  setbaseSelectedRows: (val: ((prev: string[]) => string[]) | string[]) => void;
  baseSelectedRows: string[];
  deleteTransaction: () => void;
}

const InvoiceItem = React.memo(
  ({
    style,
    item,
    setbaseSelectedRows,
    baseSelectedRows,
    deleteTransaction,
  }: InvoiceItemProps) => {
    const options = { hour12: true };
    const date = item.date.toDate().toLocaleString("en-US", options);

    return (
      <div style={{ ...styles.container, ...style }}>
        <div style={styles.checkboxCont1}>
          <button
            style={styles.checkbox2}
            onClick={() => {
              setbaseSelectedRows((prev) => {
                if (prev.includes(item.id!)) {
                  return prev.filter((id) => id !== item.id);
                } else {
                  return [...prev, item.id];
                }
              });
            }}
          >
            {baseSelectedRows?.includes(item.id) && "X"}
          </button>
        </div>
        <div style={styles.orderIdCont1}>
          <span style={styles.orderId3}>{item.id}</span>
        </div>
        <div style={styles.customerNameCont1}>
          <span style={styles.peterPutros}>
            {item.name ? item.name : "N/A"}
          </span>
        </div>
        <div style={styles.dateCont1}>
          <span style={styles.may252025}>{date?.toLocaleString()}</span>
        </div>
        <div style={styles.totalCont1}>
          <span style={styles.total3}>${item.amount}</span>
        </div>
        <div style={styles.systemTypeCont1}>
          <span style={styles.pos}>{item.system}</span>
        </div>
        <div style={styles.orderTypeCont1}>
          <span style={styles.pickUp}>{item.type}</span>
        </div>
        <button
          onClick={deleteTransaction}
          style={{
            height: 30,
            width: 30,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "red",
            borderRadius: 5,
            position: "absolute",
            right: 10,
            border: "none",
            cursor: "pointer",
          }}
        >
          <IoClose size={24} color="white" />
        </button>
      </div>
    );
  }
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderColor: "rgba(133,127,127,1)",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    height: 40,
    position: "relative",
  },
  checkboxCont1: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    alignSelf: "stretch",
    marginBottom: 5,
  },
  checkbox2: {
    width: 20,
    height: 20,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 5,
    border: "1px solid #000000",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    padding: 0,
  },
  orderIdCont1: {
    width: 120,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    alignSelf: "stretch",
    marginBottom: 5,
  },
  orderId3: {
    color: "#121212",
    fontSize: 15,
  },
  customerNameCont1: {
    width: 180,
    display: "flex",
    justifyContent: "center",
    alignSelf: "stretch",
    marginBottom: 5,
  },
  peterPutros: {
    color: "#121212",
    fontSize: 15,
  },
  dateCont1: {
    width: 180,
    display: "flex",
    justifyContent: "center",
    alignSelf: "stretch",
    marginBottom: 5,
  },
  may252025: {
    color: "#121212",
    fontSize: 15,
  },
  totalCont1: {
    width: 120,
    display: "flex",
    justifyContent: "center",
    alignSelf: "stretch",
    marginBottom: 5,
  },
  total3: {
    color: "#121212",
    fontSize: 15,
  },
  systemTypeCont1: {
    width: 120,
    display: "flex",
    justifyContent: "center",
    alignSelf: "stretch",
    marginBottom: 5,
  },
  pos: {
    color: "#121212",
    fontSize: 15,
  },
  orderTypeCont1: {
    width: 120,
    display: "flex",
    justifyContent: "center",
    alignSelf: "stretch",
    marginBottom: 5,
  },
  pickUp: {
    color: "#121212",
    fontSize: 15,
  },
};

InvoiceItem.displayName = "InvoiceItem";

export default InvoiceItem;
