import React, { useState } from "react";
import { tablesState, tableSectionsState, setTablesState, setTableSectionsState } from "store/appState";
import { saveTables, saveTableSections } from "services/firebase/functions";
import { useAlert } from "react-alert";
import { Table, TableShape } from "types";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";

const TableSettings = () => {
  const tables = tablesState.use();
  const sections = tableSectionsState.use();
  const alertP = useAlert();

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
    setLocalTables(localTables.map((t) => t.section === section ? { ...t, section: "" } : t));
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
    setLocalTables(localTables.map((t) => t.id === id ? { ...t, ...updates } : t));
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Table Settings</span>
        <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
          <span style={styles.saveBtnTxt}>{saving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      {/* Sections */}
      <div style={styles.sectionBlock}>
        <span style={styles.sectionTitle}>Table Sections / Zones</span>
        <span style={styles.sectionDesc}>
          Group your tables by area (e.g. Main Floor, Patio, Bar)
        </span>
        <div style={styles.chipsRow}>
          {localSections.map((section) => (
            <div key={section} style={styles.chip}>
              <span style={styles.chipTxt}>{section}</span>
              <button style={styles.chipRemove} onClick={() => removeSection(section)}>
                <FiX size={14} color="#64748b" />
              </button>
            </div>
          ))}
          <div style={styles.addChipRow}>
            <input
              style={styles.addChipInput}
              placeholder="New section..."
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSection()}
            />
            <button style={styles.addChipBtn} onClick={addSection}>
              <FiPlus size={16} color="#fff" />
            </button>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div style={styles.sectionBlock}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={styles.sectionTitle}>Tables ({localTables.length})</span>
          <button style={styles.addTableBtn} onClick={addTable}>
            <FiPlus size={16} color="#fff" />
            <span style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>Add Table</span>
          </button>
        </div>
        <div style={styles.tableGrid}>
          {localTables.map((table) => (
            <div key={table.id} style={styles.tableRow}>
              <div style={styles.tableFieldsRow}>
                <div style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>#</span>
                  <input
                    style={{ ...styles.fieldInput, width: 50 }}
                    type="number"
                    value={table.number}
                    onChange={(e) => updateTable(table.id, { number: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Name</span>
                  <input
                    style={{ ...styles.fieldInput, width: 140 }}
                    value={table.name}
                    onChange={(e) => updateTable(table.id, { name: e.target.value })}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Seats</span>
                  <input
                    style={{ ...styles.fieldInput, width: 60 }}
                    type="number"
                    value={table.seats}
                    onChange={(e) => updateTable(table.id, { seats: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Section</span>
                  <select
                    style={{ ...styles.fieldInput, width: 140 }}
                    value={table.section}
                    onChange={(e) => updateTable(table.id, { section: e.target.value })}
                  >
                    <option value="">None</option>
                    {localSections.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Shape</span>
                  <select
                    style={{ ...styles.fieldInput, width: 110 }}
                    value={table.shape}
                    onChange={(e) => updateTable(table.id, { shape: e.target.value as TableShape })}
                  >
                    <option value="square">Square</option>
                    <option value="round">Round</option>
                    <option value="rectangle">Rectangle</option>
                  </select>
                </div>
                <div style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Active</span>
                  <button
                    style={{
                      ...styles.toggleBtn,
                      backgroundColor: table.isActive ? "#1e293b" : "#cbd5e1",
                    }}
                    onClick={() => updateTable(table.id, { isActive: !table.isActive })}
                  >
                    <div
                      style={{
                        ...styles.toggleKnob,
                        transform: table.isActive ? "translateX(16px)" : "translateX(0)",
                      }}
                    />
                  </button>
                </div>
              </div>
              <button style={styles.deleteBtn} onClick={() => removeTable(table.id)}>
                <FiTrash2 size={16} color="#ef4444" />
              </button>
            </div>
          ))}
          {localTables.length === 0 && (
            <div style={styles.emptyState}>
              <span style={{ color: "#94a3b8", fontSize: 15 }}>
                No tables yet. Click "Add Table" to get started.
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
    padding: 30,
    display: "flex",
    flexDirection: "column",
    gap: 24,
    overflowY: "auto",
    height: "100%",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
  },
  saveBtn: {
    backgroundColor: "#1e293b",
    border: "none",
    borderRadius: 8,
    padding: "10px 24px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  saveBtnTxt: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  sectionBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1e293b",
  },
  sectionDesc: {
    fontSize: 13,
    color: "#64748b",
  },
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
  addChipRow: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  addChipInput: {
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    padding: "6px 10px",
    fontSize: 13,
    width: 120,
    outline: "none",
  },
  addChipBtn: {
    backgroundColor: "#1e293b",
    border: "none",
    borderRadius: 6,
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  addTableBtn: {
    backgroundColor: "#1e293b",
    border: "none",
    borderRadius: 8,
    padding: "8px 16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  tableGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: "12px 16px",
    border: "1px solid #e2e8f0",
  },
  tableFieldsRow: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
  },
  fieldInput: {
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    padding: "6px 8px",
    fontSize: 14,
    outline: "none",
    backgroundColor: "#fff",
    height: 34,
    boxSizing: "border-box",
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
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 8,
    display: "flex",
  },
  emptyState: {
    padding: 40,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    border: "1px dashed #cbd5e1",
  },
};

export default TableSettings;
