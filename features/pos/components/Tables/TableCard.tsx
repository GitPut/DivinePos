import React, { useEffect, useState } from "react";
import { Table, TransListStateItem } from "types";
import { FiUsers, FiClock } from "react-icons/fi";
import { parseDate } from "utils/dateFormatting";

interface TableCardProps {
  table: Table;
  session: TransListStateItem | null;
  onPress: () => void;
}

const TableCard = ({ table, session, onPress }: TableCardProps) => {
  const isOccupied = !!session;
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!session?.seatedAt) return;
    const update = () => {
      const seatedDate = session.seatedAt ? parseDate(session.seatedAt) : null;
      if (!seatedDate) return;
      const diff = Math.floor((Date.now() - seatedDate.getTime()) / 60000);
      if (diff < 60) {
        setElapsed(`${diff}m`);
      } else {
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        setElapsed(`${h}h ${m}m`);
      }
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [session?.seatedAt]);

  const shapeStyle: React.CSSProperties =
    table.shape === "round"
      ? { borderRadius: "50%" }
      : table.shape === "rectangle"
      ? { borderRadius: 10 }
      : { borderRadius: 10 };

  return (
    <button
      style={{
        ...styles.card,
        ...shapeStyle,
        backgroundColor: isOccupied ? "#dbeafe" : "#dcfce7",
        borderColor: isOccupied ? "#2563eb" : "#16a34a",
      }}
      onClick={onPress}
    >
      <div style={styles.topRow}>
        <span style={{ ...styles.tableNumber, color: isOccupied ? "#1e40af" : "#15803d" }}>
          #{table.number}
        </span>
        <span style={{ ...styles.tableName, color: isOccupied ? "#1e40af" : "#15803d" }}>
          {table.name}
        </span>
      </div>
      {table.section && (
        <span style={styles.section}>{table.section}</span>
      )}
      {isOccupied ? (
        <div style={styles.infoArea}>
          <div style={styles.infoRow}>
            <FiUsers size={13} color="#1e40af" />
            <span style={styles.infoTxt}>
              {session.guests || "?"}/{table.seats}
            </span>
          </div>
          <div style={styles.infoRow}>
            <FiClock size={13} color="#1e40af" />
            <span style={styles.infoTxt}>{elapsed || "0m"}</span>
          </div>
          {session.total && parseFloat(session.total) > 0 && (
            <span style={styles.total}>${parseFloat(session.total).toFixed(2)}</span>
          )}
          {session.server && (
            <span style={styles.serverTxt}>{session.server}</span>
          )}
        </div>
      ) : (
        <div style={styles.infoArea}>
          <span style={styles.seats}>{table.seats} seats</span>
          <span style={styles.availableTxt}>Available</span>
        </div>
      )}
    </button>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: 150,
    height: 150,
    border: "2px solid",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 12,
    gap: 4,
    transition: "transform 0.15s, box-shadow 0.15s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    background: "none",
  },
  topRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  tableNumber: {
    fontSize: 20,
    fontWeight: "700",
  },
  tableName: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "500",
  },
  infoArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    marginTop: 4,
  },
  infoRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoTxt: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e40af",
  },
  total: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e40af",
  },
  serverTxt: {
    fontSize: 10,
    color: "#3b82f6",
    fontWeight: "500",
  },
  seats: {
    fontSize: 12,
    color: "#15803d",
    fontWeight: "500",
  },
  availableTxt: {
    fontSize: 11,
    color: "#16a34a",
    fontWeight: "600",
    textTransform: "uppercase",
  },
};

export default TableCard;
