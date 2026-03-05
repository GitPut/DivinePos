import React, { useEffect, useRef, useState } from "react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { MdClear } from "react-icons/md";
import ReactDOM from "react-dom";
import useWindowSize from "shared/hooks/useWindowSize";
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
  const { width } = useWindowSize();

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
            <span style={styles.placeholder}>
              {value
                ? `${value.label} (+$${
                    value.priceIncrease !== null ? value.priceIncrease : 0
                  })`
                : label}
            </span>
            {openDropdown === id ? (
              <FiChevronUp size={30} color="rgba(128,128,128,1)" style={{ marginTop: 2, marginRight: 2 }} />
            ) : (
              <FiChevronDown size={30} color="rgba(128,128,128,1)" style={{ marginTop: 2, marginRight: 2 }} />
            )}
          </button>
          {openDropdown === id && (
            <div
              style={{
                width: "100%",
                position: "absolute",
                backgroundColor: "white",
                bottom: options.length > 3 ? -44 * 3 : -44 * options.length,
                height: options.length > 3 ? 44 * 3 : 44 * options.length,
                borderRadius: 10,
                border: "1px solid #ccc",
                overflow: "auto",
              }}
            >
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
                  style={{
                    width: "100%",
                    height: 44,
                    backgroundColor: "white",
                    padding: 10,
                    borderBottom: "1px solid #ccc",
                    border: "none",
                    borderBottomStyle: "solid",
                    borderBottomWidth: 1,
                    borderBottomColor: "#ccc",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "block",
                  }}
                >
                  <span>{`${optionI.label}  (+$${
                    optionI.priceIncrease !== null ? optionI.priceIncrease : 0
                  })`}</span>
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
        ...(width > 800 ? styles.container : styles.containerMobile),
        ...(openDropdown === id && { zIndex: 1000 }),
      }}
    >
      <span style={width > 800 ? styles.lbl : styles.lblMobile}>
        {label} {isRequired ? "*" : ""}
      </span>
      <div
        ref={dropdownRef}
        style={width < 800 ? { width: "100%" } : { width: "70%" }}
      >
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
          <span style={styles.placeholder}>
            {value
              ? `${value.label} (+$${
                  value.priceIncrease !== null ? value.priceIncrease : 0
                })`
              : label}
          </span>
          {value ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setValue({ option: null, listIndex: null });
              }}
              style={{ marginTop: 5, marginRight: 5, background: "none", border: "none", cursor: "pointer" }}
            >
              <MdClear size={24} color="red" />
            </button>
          ) : openDropdown === id ? (
            <FiChevronUp size={30} color="rgba(128,128,128,1)" style={{ marginTop: 2, marginRight: 2 }} />
          ) : (
            <FiChevronDown size={30} color="rgba(128,128,128,1)" style={{ marginTop: 2, marginRight: 2 }} />
          )}
        </button>
      </div>
      {portalContent}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    alignSelf: "stretch",
    height: 44,
    display: "flex",
  },
  containerMobile: {
    marginBottom: 20,
    alignSelf: "stretch",
  },
  lbl: {
    display: "inline-block",
    fontWeight: "700",
    color: "#3e3f41",
    width: "25%",
  },
  lblMobile: {
    display: "inline-block",
    fontWeight: "700",
    color: "#3e3f41",
    width: "100%",
    marginBottom: 10,
  },
  dropdown: {
    width: "100%",
    height: 44,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    border: "2px solid #6987d3",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    display: "flex",
    cursor: "pointer",
    padding: 0,
  },
  placeholder: {
    fontWeight: "500",
    color: "#7f838c",
    fontSize: 12,
    margin: 10,
  },
  downIcon: {
    color: "rgba(128,128,128,1)",
    fontSize: 30,
    margin: 0,
    marginTop: 2,
    marginRight: 2,
  },
};

export default DropdownOption;
