import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiX, FiPlus, FiCheck } from "react-icons/fi";

interface DropdownStringOptionsProps {
  placeholder: string;
  value: string | null;
  setValue: (value: string | null, index?: number) => void;
  options: string[];
  scrollY: number;
  onCreateNew?: (name: string) => void;
  createPlaceholder?: string;
}

function DropdownStringOptions(
  props: DropdownStringOptionsProps
): JSX.Element {
  const { placeholder, value, setValue, options, scrollY, onCreateNew, createPlaceholder } = props;
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const [openDropdown, setopenDropdown] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 200,
  });

  useEffect(() => {
    if (openDropdown && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }, [openDropdown, scrollY]);

  const handleCreate = () => {
    if (newName.trim().length > 0 && onCreateNew) {
      onCreateNew(newName.trim());
      setValue(newName.trim());
      setNewName("");
      setCreating(false);
      setopenDropdown(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        style={styles.dropdown}
        onClick={() => {
          setopenDropdown((prev) => !prev);
          setCreating(false);
          setNewName("");
        }}
        ref={dropdownRef}
      >
        <span style={value ? styles.selectedText : styles.placeholder}>
          {value ? value : placeholder}
        </span>
        <div style={styles.rightIcons}>
          {value && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setValue(null);
              }}
              style={styles.clearBtn}
            >
              <FiX size={14} color="#94a3b8" />
            </div>
          )}
          <FiChevronDown
            size={16}
            color="#94a3b8"
            style={{
              transition: "transform 0.2s",
              transform: openDropdown ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </div>
      </button>
      {openDropdown && (
        <>
          <div
            style={styles.backdrop}
            onClick={() => {
              setopenDropdown(false);
              setCreating(false);
              setNewName("");
            }}
          />
          <div
            style={{
              ...styles.menu,
              top: pos.top,
              left: pos.left,
              width: pos.width,
            }}
          >
            {options.length === 0 && !onCreateNew ? (
              <div style={styles.emptyRow}>
                <span style={styles.emptyText}>No options</span>
              </div>
            ) : (
              options.map((option, listIndex) => {
                const isSelected = option === value;
                return (
                  <button
                    key={listIndex}
                    onClick={() => {
                      setValue(option, listIndex);
                      setopenDropdown(false);
                      setCreating(false);
                      setNewName("");
                    }}
                    style={{
                      ...styles.option,
                      ...(isSelected ? styles.optionSelected : {}),
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "#fff";
                    }}
                  >
                    <span style={{
                      ...styles.optionText,
                      ...(isSelected ? { color: "#1D294E", fontWeight: "600" } : {}),
                    }}>
                      {option}
                    </span>
                  </button>
                );
              })
            )}
            {onCreateNew && (
              <>
                {options.length > 0 && <div style={styles.divider} />}
                {creating ? (
                  <div style={styles.createInputRow}>
                    <input
                      autoFocus
                      style={styles.createInput}
                      placeholder={createPlaceholder ?? "Category name"}
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreate();
                        if (e.key === "Escape") {
                          setCreating(false);
                          setNewName("");
                        }
                      }}
                    />
                    <button
                      style={styles.createConfirmBtn}
                      onClick={handleCreate}
                    >
                      <FiCheck size={14} color="#fff" />
                    </button>
                  </div>
                ) : (
                  <button
                    style={styles.createNewBtn}
                    onClick={() => setCreating(true)}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; }}
                  >
                    <FiPlus size={14} color="#1D294E" />
                    <span style={styles.createNewText}>Create new</span>
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  dropdown: {
    width: "100%",
    height: 44,
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    paddingLeft: 14,
    paddingRight: 12,
    cursor: "pointer",
    outline: "none",
    boxSizing: "border-box" as const,
  },
  placeholder: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "400",
  },
  selectedText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "500",
  },
  rightIcons: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  backdrop: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100000,
  },
  menu: {
    position: "fixed" as const,
    zIndex: 100001,
    backgroundColor: "#fff",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    maxHeight: 260,
    overflowY: "auto" as const,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    padding: "4px 0",
  },
  option: {
    width: "100%",
    padding: "10px 14px",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
    textAlign: "left" as const,
  },
  optionSelected: {
    backgroundColor: "#f0f4ff",
  },
  optionText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "400",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    margin: "4px 0",
  },
  createNewBtn: {
    width: "100%",
    padding: "10px 14px",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    border: "none",
    cursor: "pointer",
    textAlign: "left" as const,
  },
  createNewText: {
    color: "#1D294E",
    fontSize: 14,
    fontWeight: "600",
  },
  createInputRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
  },
  createInput: {
    flex: 1,
    height: 34,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "0 10px",
    fontSize: 14,
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box" as const,
  },
  createConfirmBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#1D294E",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  emptyRow: {
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 13,
  },
};

export default DropdownStringOptions;
