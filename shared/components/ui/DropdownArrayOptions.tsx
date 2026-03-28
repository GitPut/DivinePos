import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiX } from "react-icons/fi";

interface DropdownArrayOptionsProps {
  placeholder: string;
  value: string | null;
  setValue: (
    val?: { label: string; value?: string; id?: string },
    index?: number
  ) => void;
  options: { label: string; value?: string; id?: string }[];
  scrollY: number;
}

function DropdownArrayOptions(
  props: DropdownArrayOptionsProps
): JSX.Element {
  const { placeholder, value, setValue, options, scrollY } = props;
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const [openDropdown, setopenDropdown] = useState(false);
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

  return (
    <div style={{ position: "relative" }}>
      <button
        style={styles.dropdown}
        onClick={() => setopenDropdown((prev) => !prev)}
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
                setValue();
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
            onClick={() => setopenDropdown(false)}
          />
          <div
            style={{
              ...styles.menu,
              top: pos.top,
              left: pos.left,
              width: pos.width,
            }}
          >
            {options.length === 0 ? (
              <div style={styles.emptyRow}>
                <span style={styles.emptyText}>No options</span>
              </div>
            ) : (
              options.map((option, listIndex) => {
                const isSelected = option.label === value;
                return (
                  <button
                    key={option.id ?? listIndex}
                    onClick={() => {
                      setValue(option, listIndex);
                      setopenDropdown(false);
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
                      {option.label}
                    </span>
                  </button>
                );
              })
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

export default DropdownArrayOptions;
