import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

function PeriodDropdown({ value, setValue }: { value: string; setValue: (val: string) => void }) {
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const [dropdownLayout, setDropdownLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>();
  const [openDropdown, setopenDropdown] = useState<boolean>(false);
  const options = ["Today", "This Week", "This Month", "This Year", "All Time"];

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
    <div style={{ zIndex: 1000, position: "relative" }}>
      <button
        style={{
          ...styles.container,
          ...(openDropdown ? {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          } : {}),
        }}
        onClick={() => setopenDropdown((prev) => !prev)}
        ref={dropdownRef}
      >
        <span style={styles.dropdownPeriodLbl}>{value}</span>
        <FiChevronDown style={styles.chevronDownIcon} />
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
                width: 110,
                zIndex: 9999,
              }}
            >
              <button
                style={{
                  ...styles.container,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  borderBottomColor: "black",
                }}
                onClick={() => setopenDropdown((prev) => !prev)}
              >
                <span style={styles.dropdownPeriodLbl}>{value}</span>
                <FiChevronDown style={styles.chevronDownIcon} />
              </button>
              <div
                style={{
                  width: 110,
                  position: "absolute",
                  backgroundColor: "white",
                  top: 30,
                  border: "1px solid #9e9e9e",
                  borderTop: "none",
                }}
              >
                {options.map((option, listIndex) => (
                  <button
                    style={{
                      ...styles.container,
                      justifyContent: "flex-start",
                      paddingLeft: 5,
                      borderRadius: 0,
                      ...(listIndex < options.length - 1 ? {
                        borderBottom: "1px solid #9e9e9e",
                      } : {}),
                    }}
                    key={listIndex}
                    onClick={() => {
                      setValue(option);
                      setopenDropdown(false);
                    }}
                  >
                    <span style={styles.dropdownPeriodLbl}>{option}</span>
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
    border: "1px solid #9f9f9f",
    height: 30,
    width: 110,
    padding: 5,
    background: "white",
    cursor: "pointer",
  },
  dropdownPeriodLbl: {
    color: "#81838b",
    fontSize: 13,
    marginRight: 0,
  },
  chevronDownIcon: {
    color: "#808080",
    fontSize: 25,
  },
};

export default PeriodDropdown;
