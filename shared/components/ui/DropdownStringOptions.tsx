import React, { useEffect, useRef, useState } from "react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { MdClear } from "react-icons/md";
import Modal from "./Modal";

interface DropdownStringOptionsProps {
  placeholder: string;
  value: string | null;
  setValue: (value: string | null, index?: number) => void;
  options: string[];
  scrollY: number;
}

// Define function overloads for setValue
function DropdownStringOptions(
  props: DropdownStringOptionsProps
): JSX.Element {
  const { placeholder, value, setValue, options, scrollY } = props;
  const dropdownRef = useRef<HTMLButtonElement>(null); // Reference to the original button
  const [dropdownLayout, setDropdownLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>();
  const [openDropdown, setopenDropdown] = useState(false);

  useEffect(() => {
    // Ensure this code runs in a web environment
    if (dropdownRef.current && typeof window !== "undefined") {
      const element = dropdownRef.current;
      const boundingRect = element.getBoundingClientRect();

      setDropdownLayout({
        x: boundingRect.left,
        y: boundingRect.top, // Adjust based on scroll position
        width: boundingRect.width,
        height: boundingRect.height,
      });
    }
  }, [scrollY]); // Recalculate when scroll position changes

  return (
    <div style={{ zIndex: 1000 }}>
      <button
        style={styles.dropdown}
        onClick={() => setopenDropdown((prev) => !prev)}
        ref={dropdownRef}
      >
        <span style={styles.placeholder}>{value ? value : placeholder}</span>
        {value ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setValue(null);
            }}
            style={{ marginTop: 5, marginRight: 5, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <MdClear size={24} color="red" />
          </button>
        ) : (
          openDropdown ? (
            <FiChevronUp style={styles.downIcon} />
          ) : (
            <FiChevronDown style={styles.downIcon} />
          )
        )}
      </button>
      <Modal
        isVisible={openDropdown}
        onBackdropPress={() => setopenDropdown(false)}
      >
        {dropdownLayout && (
          <div
            style={{
              position: "absolute",
              top: dropdownLayout.y,
              left: dropdownLayout.x,
              width: 190,
            }}
          >
            <button
              style={{
                ...styles.dropdown,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                borderBottomColor: "black",
              }}
              onClick={() => setopenDropdown((prev) => !prev)}
            >
              <span style={styles.placeholder}>
                {value ? value : placeholder}
              </span>
              {openDropdown ? (
                <FiChevronUp style={styles.downIcon} />
              ) : (
                <FiChevronDown style={styles.downIcon} />
              )}
            </button>
            {openDropdown && (
              <div
                style={{
                  width: 190,
                  position: "absolute",
                  backgroundColor: "white",
                  bottom: options.length > 3 ? -50 * 3 : -50 * options.length,
                  height: options.length > 3 ? 50 * 3 : 50 * options.length,
                  borderBottomLeftRadius: 5,
                  borderBottomRightRadius: 5,
                  border: "1px solid #9e9e9e",
                  borderTopWidth: 0,
                  overflow: "auto",
                }}
              >
                {options.map((option, listIndex) => {
                  return (
                    <button
                      key={listIndex}
                      onClick={() => {
                        setValue(option, listIndex);
                        setopenDropdown(false);
                      }}
                      style={{
                        width: "100%",
                        height: 50,
                        backgroundColor: "white",
                        padding: 10,
                        display: "flex",
                        justifyContent: "center",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        ...(listIndex < options.length - 1
                          ? { borderBottom: "1px solid #9e9e9e" }
                          : {}),
                      }}
                    >
                      <span style={styles.placeholder}>{option}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 5,
    border: "1px solid #9e9e9e",
  },
  dropdown: {
    width: 190,
    height: 50,
    backgroundColor: "rgba(255,255,255,1)",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 5,
    border: "1px solid #9e9e9e",
    paddingLeft: 10,
    paddingRight: 10,
    cursor: "pointer",
  },
  placeholder: {
    color: "grey",
    fontSize: 14,
  },
  downIcon: {
    color: "rgba(128,128,128,1)",
    fontSize: 30,
    margin: 0,
    marginTop: 2,
    marginRight: 2,
  },
};

export default DropdownStringOptions;
