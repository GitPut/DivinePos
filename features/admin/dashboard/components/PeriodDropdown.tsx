import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

function PeriodDropdown({
  value,
  setValue,
}: {
  value: string;
  setValue: (val: string) => void;
}) {
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const [dropdownLayout, setDropdownLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>();
  const [openDropdown, setopenDropdown] = useState<boolean>(false);
  const options = [
    "Today",
    "This Week",
    "This Month",
    "This Year",
    "All Time",
  ];

  useEffect(() => {
    if (dropdownRef.current) {
      const boundingRect = dropdownRef.current.getBoundingClientRect();
      setDropdownLayout({
        x: boundingRect.left,
        y: boundingRect.top,
        width: boundingRect.width,
        height: boundingRect.height,
      });
    }
  }, []);

  return (
    <div style={{ zIndex: 10, position: "relative" }}>
      <button
        style={{
          ...styles.container,
          ...(openDropdown
            ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
            : {}),
        }}
        onClick={() => setopenDropdown((prev) => !prev)}
        ref={dropdownRef}
      >
        <span style={styles.label}>{value}</span>
        <FiChevronDown size={14} color="#64748b" />
      </button>
      {openDropdown && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 9998,
            }}
            onClick={() => setopenDropdown(false)}
          />
          {dropdownLayout && (
            <div
              style={{
                position: "fixed",
                top: dropdownLayout.y,
                left: dropdownLayout.x,
                width: 120,
                zIndex: 9999,
              }}
            >
              <button
                style={{
                  ...styles.container,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  borderBottomColor: "#1D294E",
                }}
                onClick={() => setopenDropdown((prev) => !prev)}
              >
                <span style={styles.label}>{value}</span>
                <FiChevronDown size={14} color="#64748b" />
              </button>
              <div style={styles.optionsList}>
                {options.map((option, listIndex) => (
                  <button
                    style={{
                      ...styles.option,
                      ...(option === value
                        ? { backgroundColor: "#eff6ff", color: "#1D294E" }
                        : {}),
                      ...(listIndex < options.length - 1
                        ? { borderBottom: "1px solid #f1f5f9" }
                        : {}),
                    }}
                    key={listIndex}
                    onClick={() => {
                      setValue(option);
                      setopenDropdown(false);
                    }}
                  >
                    <span style={{ fontSize: 12 }}>{option}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    height: 32,
    width: 120,
    padding: "0 10px",
    background: "white",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  label: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "500",
  },
  optionsList: {
    width: 120,
    position: "absolute",
    backgroundColor: "white",
    top: 32,
    border: "1px solid #e2e8f0",
    borderTop: "none",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  option: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "8px 10px",
    border: "none",
    background: "white",
    cursor: "pointer",
    color: "#475569",
    boxSizing: "border-box",
  },
};

export default PeriodDropdown;
