import React, { useEffect, useRef, useState } from "react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { MdClear } from "react-icons/md";
import ReactDOM from "react-dom";
import { OptionsList } from "types";

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
                ? `${value.label}${parseFloat(value.priceIncrease ?? "0") > 0 ? ` (+$${value.priceIncrease})` : ""}`
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
              {options.map((optionI, listIndex) => (
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
                  style={styles.optionItem}
                >
                  <span style={styles.optionItemText}>
                    {optionI.label}
                    {parseFloat(optionI.priceIncrease ?? "0") > 0
                      ? ` (+$${optionI.priceIncrease})`
                      : ""}
                  </span>
                </button>
              ))}
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
              ? `${value.label}${parseFloat(value.priceIncrease ?? "0") > 0 ? ` (+$${value.priceIncrease})` : ""}`
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
    backgroundColor: "white",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    overflow: "auto",
    maxHeight: 44 * 4,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    marginTop: 4,
  },
  optionItem: {
    width: "100%",
    height: 44,
    backgroundColor: "white",
    padding: "0 14px",
    border: "none",
    borderBottom: "1px solid #f1f5f9",
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
  },
  optionItemText: {
    fontSize: 14,
    color: "#1a1a1a",
  },
};

export default DropdownOption;
