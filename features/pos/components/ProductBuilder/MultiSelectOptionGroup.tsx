import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { FiChevronUp, FiChevronDown, FiMinusSquare, FiPlusSquare } from "react-icons/fi";
import { MdClear } from "react-icons/md";
import useWindowSize from "shared/hooks/useWindowSize";
import { Option, OptionsList, ProductProp } from "types";

interface MultiSelectOptionGroupProps {
  setopenDropdown: (val: string | null) => void;
  openDropdown: string | null;
  id: string;
  label: string;
  isRequired: boolean;
  scrollY: number;
  e: Option;
  index: number;
  myObjProfile: ProductProp;
  setmyObjProfile: (val: ProductProp) => void;
  optionsSelectedLabel: string;
}

function MultiSelectOptionGroup({
  setopenDropdown,
  openDropdown,
  id,
  label,
  isRequired,
  myObjProfile,
  setmyObjProfile,
  index,
  e,
  optionsSelectedLabel,
  scrollY,
}: MultiSelectOptionGroupProps) {
  const options = e.optionsList;
  const [localMyObjProfile, setlocalMyObjProfile] =
    useState<ProductProp>(myObjProfile);
  const [localOptionsSelectedLabel, setlocalOptionsSelectedLabel] = useState<
    string[] | ""
  >("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownLayout, setDropdownLayout] = useState<
    | {
        x: number;
        y: number;
        width: number;
        height: number;
      }
    | undefined
  >();
  const { width } = useWindowSize();

  const onMinusPress = ({
    option,
    listIndex,
  }: {
    option: OptionsList;
    listIndex: number;
  }) => {
    const newMyObjProfile = structuredClone(localMyObjProfile);
    const thisItemCountsAs = parseFloat(option.countsAs ?? "1");
    const selectedTimes = parseFloat(
      newMyObjProfile.options[index].optionsList[listIndex].selectedTimes ?? "0"
    );

    if (selectedTimes > 0) {
      newMyObjProfile.options[index].optionsList[listIndex].selectedTimes = (
        selectedTimes -
        1 * thisItemCountsAs
      ).toString();
    }

    setlocalMyObjProfile(newMyObjProfile);
  };

  const onPlusPress = ({
    option,
    listIndex,
  }: {
    option: OptionsList;
    listIndex: number;
  }) => {
    const newMyObjProfile = structuredClone(localMyObjProfile);

    const selectedItems = newMyObjProfile.options[index].optionsList.filter(
      (op) => {
        const opSelectedTimes = parseFloat(op.selectedTimes ?? "0");
        return opSelectedTimes > 0;
      }
    );

    const thisItemCountsAs = parseFloat(option.countsAs ?? "1");

    let selectedTimesTotal = thisItemCountsAs;

    selectedItems.map((op) => {
      selectedTimesTotal +=
        op.countsAs ?? false
          ? parseFloat(op.selectedTimes ?? "0") * thisItemCountsAs
          : parseFloat(op.selectedTimes ?? "0");
    });

    if (
      parseFloat(e.numOfSelectable ?? "0") >= selectedTimesTotal ||
      !e.numOfSelectable ||
      e.numOfSelectable === "0"
    ) {
      const selectedTimes = parseFloat(
        newMyObjProfile.options[index].optionsList[listIndex].selectedTimes ??
          "0"
      );

      if (selectedTimes > 0) {
        newMyObjProfile.options[index].optionsList[listIndex].selectedTimes = (
          selectedTimes + 1
        ).toString();
      } else {
        newMyObjProfile.options[index].optionsList[listIndex].selectedTimes =
          "1";
      }
      setlocalMyObjProfile(newMyObjProfile);
    }
  };

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

  useEffect(() => {
    setlocalMyObjProfile(myObjProfile);
  }, [myObjProfile]);

  useEffect(() => {
    const optionsSelected = localMyObjProfile.options[index].optionsList.filter(
      (op) => parseFloat(op.selectedTimes ?? "0") > 0
    );
    setlocalOptionsSelectedLabel(
      optionsSelected.length > 0
        ? optionsSelected.map((op, index) => {
            if (index > 0) return `, ${op.label} (${op.selectedTimes})`;
            return `${op.label} (${op.selectedTimes})`;
          })
        : ""
    );
  }, [localMyObjProfile]);

  const clearOptions = () => {
    const newMyObjProfile = structuredClone(localMyObjProfile);
    newMyObjProfile.options[index].optionsList.map((op) => {
      op.selectedTimes = "0";
    });
    setlocalMyObjProfile(newMyObjProfile);
  };

  const clearOptionsMain = () => {
    const newMyObjProfile = structuredClone(localMyObjProfile);
    newMyObjProfile.options[index].optionsList.map((op) => {
      op.selectedTimes = "0";
    });
    setmyObjProfile(newMyObjProfile);
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
          setmyObjProfile(localMyObjProfile);
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
                setmyObjProfile(localMyObjProfile);
              } else {
                setopenDropdown(id);
              }
            }}
          >
            {localOptionsSelectedLabel !== "" ? (
              <span style={styles.placeholder}>{localOptionsSelectedLabel}</span>
            ) : (
              <span style={styles.placeholder}>Select {label}</span>
            )}
            {localOptionsSelectedLabel.length > 0 ? (
              <button
                style={{ marginTop: 5, marginRight: 5, background: "none", border: "none", cursor: "pointer" }}
                onClick={(e) => { e.stopPropagation(); clearOptions(); }}
              >
                <MdClear size={24} color="red" />
              </button>
            ) : openDropdown === id ? (
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
              {options.map((option, listIndex) => (
                <button
                  key={listIndex}
                  id={option.id}
                  style={{
                    width: "100%",
                    height: 44,
                    backgroundColor: "white",
                    padding: 10,
                    borderBottom: "1px solid #ccc",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: "row",
                    display: "flex",
                    border: "none",
                    borderBottomStyle: "solid" as const,
                    borderBottomWidth: 1,
                    borderBottomColor: "#ccc",
                    cursor: "pointer",
                  }}
                  onClick={() => onPlusPress({ option, listIndex })}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); onMinusPress({ option, listIndex }); }}
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    <FiMinusSquare size={24} color="black" />
                  </button>
                  <div
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "80%",
                      display: "flex",
                    }}
                  >
                    <span>
                      {`${option.label} ${
                        option.priceIncrease
                          ? `(+$${option.priceIncrease})`
                          : ""
                      }`}
                    </span>
                    <span
                      style={{
                        textAlign: "center",
                        justifyContent: "center",
                        alignItems: "center",
                        width: 40,
                        border: "1px solid black",
                        display: "inline-block",
                      }}
                    >
                      {localMyObjProfile.options[index].optionsList[listIndex]
                        .selectedTimes ?? 0 > 0
                        ? localMyObjProfile.options[index].optionsList[
                            listIndex
                          ].selectedTimes
                        : 0}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onPlusPress({ option, listIndex }); }}
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    <FiPlusSquare size={24} color="black" />
                  </button>
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
              setmyObjProfile(localMyObjProfile);
            } else {
              measureLayout();
              setopenDropdown(id);
            }
          }}
        >
          {optionsSelectedLabel !== "" ? (
            <span style={styles.placeholder}>{optionsSelectedLabel}</span>
          ) : (
            <span style={styles.placeholder}>Select {label}</span>
          )}
          {optionsSelectedLabel.length > 0 ? (
            <button
              style={{ marginTop: 5, marginRight: 5, background: "none", border: "none", cursor: "pointer" }}
              onClick={(e) => { e.stopPropagation(); clearOptionsMain(); }}
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

export default MultiSelectOptionGroup;
