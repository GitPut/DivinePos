import React, { useState } from "react";
import {
  activePlanState,
  tablesState,
  tableSectionsState,
  setTablesState,
  setTableSectionsState,
} from "store/appState";
import { saveTables, saveTableSections } from "services/firebase/functions";
import { useAlert } from "react-alert";
import { Table, TableShape } from "types";
import { FiPlus, FiTrash2, FiX, FiGrid } from "react-icons/fi";
import { useHistory } from "react-router-dom";

const TableSettings = () => {
  const activePlan = activePlanState.use();
  const tables = tablesState.use();
  const sections = tableSectionsState.use();
  const alertP = useAlert();
  const history = useHistory();

  const [localTables, setLocalTables] = useState<Table[]>(tables);
  const [localSections, setLocalSections] = useState<string[]>(sections);
  const [newSection, setNewSection] = useState("");
  const [saving, setSaving] = useState(false);

  const addSection = () => {
    const trimmed = newSection.trim();
    if (!trimmed) return;
    if (localSections.includes(trimmed)) {
      alertP.error("Section already exists");
      return;
    }
    setLocalSections([...localSections, trimmed]);
    setNewSection("");
  };

  const removeSection = (section: string) => {
    setLocalSections(localSections.filter((s) => s !== section));
    setLocalTables(
      localTables.map((t) =>
        t.section === section ? { ...t, section: "" } : t,
      ),
    );
  };

  const addTable = () => {
    const maxNum = localTables.reduce((max, t) => Math.max(max, t.number), 0);
    const newTable: Table = {
      id: Math.random().toString(36).substr(2, 9),
      number: maxNum + 1,
      name: `Table ${maxNum + 1}`,
      seats: 4,
      section: localSections[0] || "",
      shape: "square",
      isActive: true,
    };
    setLocalTables([...localTables, newTable]);
  };

  const updateTable = (id: string, updates: Partial<Table>) => {
    setLocalTables(
      localTables.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );
  };

  const removeTable = (id: string) => {
    setLocalTables(localTables.filter((t) => t.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveTables(localTables);
      await saveTableSections(localSections);
      setTablesState(localTables);
      setTableSectionsState(localSections);
      alertP.success("Tables saved successfully");
    } catch {
      alertP.error("Failed to save tables");
    }
    setSaving(false);
  };

  if (activePlan !== "professional") {
    return (
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <span style={styles.title}>Table Settings</span>
            <span style={styles.subtitle}>
              Configure your restaurant floor plan and table layout
            </span>
          </div>
        </div>
        <div style={styles.scrollArea}>
          <div style={styles.upgradeCard}>
            <div style={styles.upgradeIconWrap}>
              <FiGrid size={32} color="#1D294E" />
            </div>
            <span style={styles.upgradeTitle}>
              Table Management is a Professional Feature
            </span>
            <span style={styles.upgradeText}>
              Upgrade to the Professional plan to set up table sections, manage
              your floor plan, and track table orders in real time.
            </span>
            <button
              style={styles.upgradeBtn}
              onClick={() =>
                history.push("/authed/settings/billingsettings")
              }
            >
              Upgrade to Professional
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <span style={styles.title}>Table Settings</span>
          <span style={styles.subtitle}>
            {localTables.length} table{localTables.length !== 1 ? "s" : ""},{" "}
            {localSections.length} section{localSections.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          style={{
            ...styles.saveBtn,
            opacity: saving ? 0.5 : 1,
          }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div style={styles.scrollArea}>
        {/* Sections Card */}
        <div style={styles.card}>
          <div>
            <span style={styles.cardTitle}>Table Sections / Zones</span>
            <span style={styles.cardDescription}>
              Group your tables by area (e.g. Main Floor, Patio, Bar)
            </span>
          </div>
          <div style={styles.chipsRow}>
            {localSections.map((section) => (
              <div key={section} style={styles.chip}>
                <span style={styles.chipTxt}>{section}</span>
                <button
                  style={styles.chipRemove}
                  onClick={() => removeSection(section)}
                >
                  <FiX size={14} color="#64748b" />
                </button>
              </div>
            ))}
          </div>
          <div style={styles.addSectionRow}>
            <input
              style={styles.addSectionInput}
              placeholder="New section name..."
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSection()}
            />
            <button style={styles.addSectionBtn} onClick={addSection}>
              <FiPlus size={16} color="#fff" />
              <span style={styles.addSectionBtnText}>Add Section</span>
            </button>
          </div>
        </div>

        {/* Tables Card */}
        <div style={styles.card}>
          <div style={styles.tablesHeaderRow}>
            <div>
              <span style={styles.cardTitle}>Tables</span>
              <span style={styles.cardDescription}>
                {localTables.length} table
                {localTables.length !== 1 ? "s" : ""} configured
              </span>
            </div>
            <button style={styles.addTableBtn} onClick={addTable}>
              <FiPlus size={16} color="#fff" />
              <span style={styles.addTableBtnText}>Add Table</span>
            </button>
          </div>

          {localTables.length > 0 ? (
            <div style={styles.tableList}>
              {/* Table header */}
              <div style={styles.tableHeaderRow}>
                <span style={{ ...styles.colHeader, width: 50 }}>#</span>
                <span style={{ ...styles.colHeader, flex: 1 }}>Name</span>
                <span style={{ ...styles.colHeader, width: 60 }}>Seats</span>
                <span style={{ ...styles.colHeader, flex: 1 }}>Section</span>
                <span style={{ ...styles.colHeader, width: 110 }}>Shape</span>
                <span style={{ ...styles.colHeader, width: 50 }}>Active</span>
                <span style={{ ...styles.colHeader, width: 40 }} />
              </div>
              {localTables.map((table) => (
                <div key={table.id} style={styles.tableRow}>
                  <input
                    style={{ ...styles.tableInput, width: 50 }}
                    type="number"
                    value={table.number}
                    onChange={(e) =>
                      updateTable(table.id, {
                        number: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <input
                    style={{ ...styles.tableInput, flex: 1 }}
                    value={table.name}
                    onChange={(e) =>
                      updateTable(table.id, { name: e.target.value })
                    }
                  />
                  <input
                    style={{ ...styles.tableInput, width: 60 }}
                    type="number"
                    value={table.seats}
                    onChange={(e) =>
                      updateTable(table.id, {
                        seats: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                  <select
                    style={{ ...styles.tableInput, flex: 1 }}
                    value={table.section}
                    onChange={(e) =>
                      updateTable(table.id, { section: e.target.value })
                    }
                  >
                    <option value="">None</option>
                    {localSections.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <select
                    style={{ ...styles.tableInput, width: 110 }}
                    value={table.shape}
                    onChange={(e) =>
                      updateTable(table.id, {
                        shape: e.target.value as TableShape,
                      })
                    }
                  >
                    <option value="square">Square</option>
                    <option value="round">Round</option>
                    <option value="rectangle">Rectangle</option>
                  </select>
                  <div style={styles.activeCell}>
                    <button
                      style={{
                        ...styles.toggleBtn,
                        backgroundColor: table.isActive
                          ? "#1D294E"
                          : "#cbd5e1",
                      }}
                      onClick={() =>
                        updateTable(table.id, { isActive: !table.isActive })
                      }
                    >
                      <div
                        style={{
                          ...styles.toggleKnob,
                          transform: table.isActive
                            ? "translateX(16px)"
                            : "translateX(0)",
                        }}
                      />
                    </button>
                  </div>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => removeTable(table.id)}
                  >
                    <FiTrash2 size={15} color="#94a3b8" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <FiGrid size={32} color="#cbd5e1" />
              <span style={styles.emptyTitle}>No Tables Yet</span>
              <span style={styles.emptyText}>
                Click "Add Table" to get started
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: 30,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    flexShrink: 0,
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
  saveBtn: {
    padding: "10px 24px",
    backgroundColor: "#1D294E",
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
  },
  scrollArea: {
    flex: 1,
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    display: "block",
  },
  cardDescription: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 2,
    display: "block",
  },
  // Sections
  chipsRow: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  chip: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    padding: "6px 12px",
  },
  chipTxt: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  chipRemove: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    display: "flex",
  },
  addSectionRow: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  addSectionInput: {
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 14,
    width: 200,
    outline: "none",
    height: 38,
    boxSizing: "border-box",
  },
  addSectionBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1D294E",
    border: "none",
    borderRadius: 8,
    padding: "8px 14px",
    cursor: "pointer",
    height: 38,
  },
  addSectionBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  // Tables
  tablesHeaderRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  addTableBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1D294E",
    border: "none",
    borderRadius: 8,
    padding: "8px 16px",
    cursor: "pointer",
  },
  addTableBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  tableList: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeaderRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  colHeader: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    borderBottom: "1px solid #f1f5f9",
  },
  tableInput: {
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    padding: "6px 8px",
    fontSize: 14,
    color: "#0f172a",
    outline: "none",
    backgroundColor: "#fff",
    height: 34,
    boxSizing: "border-box",
  },
  activeCell: {
    width: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleBtn: {
    width: 36,
    height: 20,
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    position: "relative",
    padding: 2,
    display: "flex",
    alignItems: "center",
    transition: "background-color 0.2s",
  },
  toggleKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    transition: "transform 0.2s",
  },
  deleteBtn: {
    width: 40,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    gap: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    border: "1px dashed #cbd5e1",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },
  emptyText: {
    fontSize: 13,
    color: "#94a3b8",
  },
  // Upgrade prompt
  upgradeCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    padding: 48,
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    maxWidth: 480,
  },
  upgradeIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  upgradeText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: "1.6",
    maxWidth: 360,
  },
  upgradeBtn: {
    padding: "12px 28px",
    backgroundColor: "#1D294E",
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    marginTop: 8,
  },
};

export default TableSettings;
