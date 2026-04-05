import React, { useEffect, useRef, useState } from "react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { MdClear } from "react-icons/md";
import ReactDOM from "react-dom";
import { Option, OptionsList } from "types";
import { resolveOptionPrice } from "utils/resolveOptionPrice";

interface DropdownOptionProps {
  setopenDropdown: (val: string | null) => void;
  openDropdown: string | null;
  id: string;
  label: string;
  isRequired: boolean;
  value: OptionsList | null;
  setValue: ({
    option,
    listIndex,
  }: {
    option: OptionsList | null;
    listIndex: number | null;
  }) => void;
  options: OptionsList[];
  scrollY: number;
  optionGroup?: Option;
  allOptions?: Option[];
}

function DropdownOption({
  setopenDropdown,
  openDropdown,
  id,
  label,
  isRequired,
  value,
  setValue,
  options,
  scrollY,
  optionGroup,
  allOptions,
}: DropdownOptionProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownLayout, setDropdownLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>();

  const measureLayout = () => {
    if (dropdownRef.current && typeof window !== "undefined") {
      const boundingRect = dropdownRef.current.getBoundingClientRect();
      setDropdownLayout({
        x: boundingRect.left,
        y: boundingRect.top,
        width: boundingRect.width,
        height: boundingRect.height,
      });
    }
  };

  useEffect(() => {
    measureLayout();
  }, [scrollY]);

  const getDisplayPrice = (item: OptionsList) => {
    if (optionGroup && allOptions) {
      return resolveOptionPrice(item, optionGroup, allOptions);
    }
    return item.priceIncrease ?? "0";
  };

  const portalContent = openDropdown === id ? ReactDOM.createPortal(
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 9999 }}>
      <button
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
          border: "none",
          cursor: "default",
          position: "absolute",
          top: 0,
          left: 0,
        }}
        onClick={() => {
          setopenDropdown(null);
        }}
      />
      {dropdownLayout && (
        <div
          style={{
            position: "absolute",
            top: dropdownLayout.y,
            left: dropdownLayout.x,
            width: dropdownLayout.width,
          }}
        >
          <button
            style={styles.dropdown}
            onClick={() => {
              if (openDropdown === id) {
                setopenDropdown(null);
              } else {
                setopenDropdown(id);
              }
            }}
          >
            <span style={styles.dropdownText}>
              {value
                ? `${value.label}${parseFloat(getDisplayPrice(value)) > 0 ? ` (+$${parseFloat(getDisplayPrice(value)).toFixed(2)})` : ""}`
                : `Select ${label}`}
            </span>
            {openDropdown === id ? (
              <FiChevronUp size={20} color="#94a3b8" style={{ marginRight: 10 }} />
            ) : (
              <FiChevronDown size={20} color="#94a3b8" style={{ marginRight: 10 }} />
            )}
          </button>
          {openDropdown === id && (
            <div style={styles.optionsList}>
              {options.map((optionI, listIndex) => {
                const priceNum = parseFloat(getDisplayPrice(optionI));
                const isSelected = value?.id === optionI.id;
                return (
                  <button
                    key={listIndex}
                    id={optionI.id}
                    onClick={() => {
                      setValue({
                        option: {
                          label: optionI.label,
                          priceIncrease:
                            optionI.priceIncrease !== null
                              ? optionI.priceIncrease
                              : "0",
                          id: optionI.id,
                        },
                        listIndex: listIndex,
                      });
                      setopenDropdown(null);
                    }}
                    onMouseEnter={(ev) => {
                      if (!isSelected) ev.currentTarget.style.backgroundColor = "#f8fafc";
                    }}
                    onMouseLeave={(ev) => {
                      if (!isSelected) ev.currentTarget.style.backgroundColor = "#ffffff";
                    }}
                    style={{
                      ...styles.optionItem,
                      ...(isSelected ? { backgroundColor: "#eff6ff" } : {}),
                    }}
                  >
                    <span style={{
                      ...styles.optionItemText,
                      ...(isSelected ? { fontWeight: "600", color: "#1D294E" } : {}),
                    }}>
                      {optionI.label}
                    </span>
                    {priceNum > 0 && (
                      <span style={styles.optionItemPrice}>
                        +${priceNum.toFixed(2)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div
      style={{
        ...styles.container,
        ...(openDropdown === id && { zIndex: 1000 }),
      }}
    >
      <span style={styles.lbl}>
        {label} {isRequired ? "*" : ""}
      </span>
      <div ref={dropdownRef} style={{ width: "100%" }}>
        <button
          style={styles.dropdown}
          onClick={() => {
            if (openDropdown === id) {
              setopenDropdown(null);
            } else {
              measureLayout();
              setopenDropdown(id);
            }
          }}
        >
          <span style={{
            ...styles.dropdownText,
            ...(value ? { color: "#1a1a1a" } : {}),
          }}>
            {value
              ? `${value.label}${parseFloat(getDisplayPrice(value)) > 0 ? ` (+$${parseFloat(getDisplayPrice(value)).toFixed(2)})` : ""}`
              : `Select ${label}`}
          </span>
          {value ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setValue({ option: null, listIndex: null });
              }}
              style={{ marginRight: 8, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
            >
              <MdClear size={20} color="#94a3b8" />
            </button>
          ) : openDropdown === id ? (
            <FiChevronUp size={20} color="#94a3b8" style={{ marginRight: 10 }} />
          ) : (
            <FiChevronDown size={20} color="#94a3b8" style={{ marginRight: 10 }} />
          )}
        </button>
      </div>
      {portalContent}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: 20,
    alignSelf: "stretch",
  },
  lbl: {
    display: "inline-block",
    fontWeight: "700",
    color: "#1a1a1a",
    fontSize: 14,
    marginBottom: 10,
  },
  dropdown: {
    width: "100%",
    height: 44,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    cursor: "pointer",
    padding: 0,
  },
  dropdownText: {
    fontWeight: "500",
    color: "#94a3b8",
    fontSize: 14,
    marginLeft: 14,
  },
  optionsList: {
    width: "100%",
    position: "absolute",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    overflow: "auto",
    maxHeight: 260,
    boxShadow: "0 10px 30px rgba(15,23,42,0.12), 0 2px 6px rgba(15,23,42,0.06)",
    marginTop: 6,
    padding: 4,
    display: "flex",
    flexDirection: "column",
  },
  optionItem: {
    width: "100%",
    minHeight: 44,
    backgroundColor: "#ffffff",
    padding: "10px 14px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    transition: "background-color 0.12s ease",
  },
  optionItemText: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "500",
    flex: 1,
    textAlign: "left",
  },
  optionItemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6366f1",
    backgroundColor: "#eef2ff",
    padding: "3px 8px",
    borderRadius: 6,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
};

export default DropdownOption;
