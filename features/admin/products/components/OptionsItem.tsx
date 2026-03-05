/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { RefObject, useState } from "react";
import { FiClipboard, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { MdContentCopy, MdDeleteOutline } from "react-icons/md";
import OptionsItemExpanded from "./OptionsItemExpanded";
import { Tooltip } from "react-tooltip";
import { useAlert } from "react-alert";
import { Option, ProductProp } from "types";

interface OptionsItemProps {
  item: Option;
  index: number;
  setnewProduct: (
    val: ((prev: ProductProp) => ProductProp) | ProductProp
  ) => void;
  newProduct: ProductProp;
  newProductOptions: Option[];
  setnewProductOptions: (
    val: ((prev: Option[]) => Option[]) | Option[]
  ) => void;
  indexOn: number | null;
  setindexOn: (val: number | null) => void;
  style?: React.CSSProperties;
  scrollY: number;
  scrollViewRef: RefObject<any>;
  selectedID: string | null;
  setselectedID: (val: string | null) => void;
}

function OptionsItem({
  item,
  index,
  setnewProduct,
  newProduct,
  newProductOptions,
  setnewProductOptions,
  indexOn,
  setindexOn,
  style,
  scrollY,
  scrollViewRef,
  selectedID,
  setselectedID,
}: OptionsItemProps) {
  const [e, sete] = useState(structuredClone(item));
  const [addOptionClicked, setaddOptionClicked] = useState(true);
  const [moveToOptionPos, setmoveToOptionPos] = useState<number | null>(null);
  const alertP = useAlert();

  const isValidOption = (obj: any): boolean => {
    return (
      obj &&
      typeof obj === "object" &&
      "label" in obj &&
      Array.isArray(obj.optionsList) &&
      "id" in obj &&
      "optionType" in obj &&
      Array.isArray(obj.selectedCaseList) &&
      "isRequired" in obj
    );
  };

  const scrollToPositionIncluding = (position: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTop = scrollY + position;
    }
  };

  const copyEToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(e));
  };

  return (
    <>
      <div
        style={{
          ...styles.container,
          ...style,
          ...(indexOn === index ? { paddingBottom: 20 } : {}),
          ...(selectedID === item.id
            ? { borderColor: "#4CAF50", border: "2px solid #4CAF50" }
            : { borderColor: "#000000" }),
        }}
      >
        <button
          style={{
            ...styles.closedOptionContainer,
            ...(index === indexOn
              ? { borderBottom: "1px solid #000000" }
              : {}),
          }}
          onClick={() => {
            if (indexOn !== index) {
              setindexOn(index);
              setselectedID(null);
            } else {
              setindexOn(null);
            }
          }}
        >
          <span style={styles.optionNameLbl}>
            {e.label ? e.label : "New Option"}
          </span>
          <div style={styles.btnsRow}>
            <button
              style={styles.moveDownBtn}
              onClick={(ev) => {
                ev.stopPropagation();
                copyEToClipboard();
              }}
              id="copyToClipboardBtn"
            >
              <FiClipboard size={20} color="white" />
            </button>
            <Tooltip
              anchorSelect="#copyToClipboardBtn"
              place="top"
              style={{
                backgroundColor: "black",
              }}
            >
              <span
                style={{
                  color: "white",
                  fontSize: 16,
                  padding: 10,
                }}
              >
                Copy to clipboard
              </span>
            </Tooltip>
            <button
              style={styles.moveDownBtn}
              onClick={(ev) => {
                ev.stopPropagation();
                if (
                  newProductOptions.length > 1 &&
                  index !== newProductOptions.length - 1
                ) {
                  setnewProductOptions((prev) => {
                    const clone = structuredClone(prev);
                    const f = clone.splice(index, 1)[0];
                    clone.splice(index + 1, 0, f);
                    return clone;
                  });

                  setnewProduct((prevState) => ({
                    ...prevState,
                    options: newProductOptions,
                  }));
                  setindexOn(null);
                  scrollToPositionIncluding(100);
                  setselectedID(item.id ?? "");
                }
              }}
              id="moveDownBtn"
            >
              <FiChevronDown size={30} color="white" />
            </button>
            <Tooltip
              anchorSelect="#moveDownBtn"
              place="top"
              style={{
                backgroundColor: "black",
              }}
            >
              <span
                style={{
                  color: "white",
                  fontSize: 16,
                  padding: 10,
                }}
              >
                Move down
              </span>
            </Tooltip>
            <button
              style={styles.moveUpBtn}
              onClick={(ev) => {
                ev.stopPropagation();
                if (newProductOptions.length > 1 && index !== 0) {
                  setnewProductOptions((prev) => {
                    const clone = structuredClone(prev);
                    const f = clone.splice(index, 1)[0];
                    clone.splice(index - 1, 0, f);
                    return clone;
                  });

                  setnewProduct((prevState) => ({
                    ...prevState,
                    options: newProductOptions,
                  }));
                  setindexOn(null);
                  scrollToPositionIncluding(-100);
                  setselectedID(item.id ?? "");
                }
              }}
              id="moveUpBtn"
            >
              <FiChevronUp size={30} color="white" />
            </button>
            <Tooltip
              anchorSelect="#moveUpBtn"
              place="top"
              style={{
                backgroundColor: "black",
              }}
            >
              <span
                style={{
                  color: "white",
                  fontSize: 16,
                  padding: 10,
                }}
              >
                Move up
              </span>
            </Tooltip>
            <button
              style={styles.duplicateBtn}
              onClick={(ev) => {
                ev.stopPropagation();
                setnewProductOptions((prev) => {
                  const clone = structuredClone(prev);
                  clone.push({
                    ...item,
                    label: item.label + " Copy",
                    id: Math.random().toString(36).substr(2, 9),
                  });
                  return clone;
                });

                setnewProduct((prevState) => ({
                  ...prevState,
                  options: newProductOptions,
                }));
                setindexOn(newProductOptions.length);
                setselectedID(null);
              }}
              id="duplicateBtn"
            >
              <MdContentCopy size={26} color="white" />
            </button>
            <Tooltip
              anchorSelect="#duplicateBtn"
              place="top"
              style={{
                backgroundColor: "black",
              }}
            >
              <span
                style={{
                  color: "white",
                  fontSize: 16,
                  padding: 10,
                }}
              >
                Duplicate
              </span>
            </Tooltip>
            <button
              style={styles.deleteBtn}
              onClick={(ev) => {
                ev.stopPropagation();
                const newProductOptionsUpdated = newProduct.options.filter(
                  (e, filterIndex) => filterIndex !== index && e.id !== item.id
                );
                setnewProductOptions((prev) => {
                  const clone = structuredClone(prev);
                  clone.splice(index, 1);
                  return clone;
                });

                setnewProduct((prevState) => ({
                  ...prevState,
                  options: newProductOptionsUpdated,
                }));
                setindexOn(null);
                setselectedID(null);
              }}
              id="deleteBtn"
            >
              <MdDeleteOutline size={26} color="white" />
            </button>
            <Tooltip
              anchorSelect="#deleteBtn"
              place="top"
              style={{
                backgroundColor: "black",
              }}
            >
              <span
                style={{
                  color: "white",
                  fontSize: 16,
                  padding: 10,
                }}
              >
                Delete
              </span>
            </Tooltip>
          </div>
        </button>
        {indexOn === index && (
          <OptionsItemExpanded
            item={item}
            newProduct={newProduct}
            newProductOptions={newProductOptions}
            setnewProductOptions={setnewProductOptions}
            index={index}
            e={e}
            sete={sete}
            scrollY={scrollY}
            setaddOptionClicked={setaddOptionClicked}
            setmoveToOptionPos={setmoveToOptionPos}
            scrollToPositionIncluding={scrollToPositionIncluding}
          />
        )}
      </div>
      {index === newProduct.options.length - 1 && (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <button
            onClick={() => {
              setnewProductOptions((prev) => {
                const clone = structuredClone(prev);
                clone.push({
                  label: null,
                  optionsList: [],
                  numOfSelectable: null,
                  id: Math.random().toString(36).substr(2, 9),
                  optionType: null,
                  selectedCaseList: [],
                  isRequired: false,
                });
                return clone;
              });
              setindexOn(newProductOptions.length);
            }}
            disabled={e.label === null}
            style={styles.createOptionBtn}
          >
            <span style={styles.createOptionTxt}>Create Option</span>
          </button>
          <button
            style={{ ...styles.createOptionBtn, marginLeft: 20 }}
            onClick={async () => {
              try {
                const text = await navigator.clipboard.readText();
                const parsed = JSON.parse(text);

                if (!isValidOption(parsed)) {
                  alertP.error("Clipboard data is not a valid option");
                  return;
                }

                setnewProductOptions((prev) => {
                  const clone = structuredClone(prev);
                  const existingIndex = prev.findIndex(
                    (e) => e.id === parsed.id
                  );

                  if (existingIndex > -1) {
                    const newCopy = {
                      ...parsed,
                      id: Math.random().toString(36).substr(2, 9),
                      label: (parsed.label || "Untitled") + " Copy",
                    };
                    clone.push(newCopy);
                  } else {
                    clone.push(parsed);
                  }
                  return clone;
                });

                setindexOn(newProductOptions.length);
              } catch (err) {
                if (
                  err instanceof DOMException &&
                  err.name === "NotAllowedError"
                ) {
                  alertP.error(
                    "Clipboard access denied. Try copying again and clicking Paste right after."
                  );
                } else {
                  alertP.error("Invalid or blocked clipboard content.");
                }
              }
            }}
          >
            <span style={styles.createOptionTxt}>Paste Option</span>
          </button>
        </div>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,1)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    marginBottom: 30,
  },
  innerOptionContainer1: {
    width: 808,
    height: 389,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginTop: 20,
    marginLeft: 20,
  },
  optionMainInfoRow1: {
    width: 808,
    height: 84,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionNameInputGroup1: {
    width: 239,
    height: 84,
    display: "flex",
    justifyContent: "space-between",
  },
  optionNameInputLbl1: {
    color: "#121212",
    fontSize: 17,
  },
  optionNameInput2: {
    width: 239,
    height: 50,
    backgroundColor: "#ffffff",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#9b9b9b",
    borderRadius: 5,
  },
  optionTypeGroup1: {
    width: 197,
    height: 77,
    display: "flex",
    justifyContent: "space-between",
  },
  optionTypeDropdownLbl1: {
    color: "#121212",
    fontSize: 17,
  },
  optionTypeDropdown2: {
    width: 195,
    height: 50,
    backgroundColor: "#ffffff",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#9b9b9b",
    borderRadius: 5,
  },
  selectionLimitInputGroup1: {
    width: 195,
    height: 77,
    display: "flex",
    justifyContent: "space-between",
  },
  selectionLimitInputLbl1: {
    color: "#121212",
    fontSize: 17,
  },
  selectionLimitInput2: {
    width: 195,
    height: 50,
    backgroundColor: "#ffffff",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#9b9b9b",
    borderRadius: 5,
  },
  spacer5: {
    width: 808,
    height: 40,
  },
  optionRequiredRow1: {
    width: 216,
    height: 20,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  isOptionTxt1: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 17,
  },
  isRequiredBtn1: {
    width: 44,
    height: 20,
    backgroundColor: "#E6E6E6",
  },
  spacer6: {
    width: 808,
    height: 53,
  },
  optionSelectionItem1: {
    height: 84,
    width: 808,
  },
  spacer7: {
    width: 808,
    height: 61,
  },
  addAnotherSelectionBtnRow1: {
    height: 47,
    alignSelf: "stretch",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  addAnotherSelectionBtn2: {
    width: 173,
    height: 47,
    backgroundColor: "#1c294e",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
  },
  addAnotherSelectionBtnLbl1: {
    color: "rgba(255,255,255,1)",
    fontSize: 15,
  },
  createOptionBtn: {
    width: 173,
    height: 47,
    backgroundColor: "#1c294e",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
  },
  createOptionTxt: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 20,
  },
  closedOptionContainer: {
    backgroundColor: "rgba(255,255,255,1)",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 67,
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  optionNameLbl: {
    color: "#121212",
    fontSize: 17,
    marginRight: 20,
    marginLeft: 20,
  },
  btnsRow: {
    width: 224,
    height: 35,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 20,
    marginLeft: 20,
  },
  moveUpBtn: {
    width: 35,
    height: 35,
    backgroundColor: "#1c294e",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  chevronUp: {
    color: "rgba(255,255,255,1)",
    fontSize: 30,
  },
  moveDownBtn: {
    width: 35,
    height: 35,
    backgroundColor: "#1c294e",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  chevronDown: {
    color: "rgba(255,255,255,1)",
    fontSize: 30,
  },
  duplicateBtn: {
    width: 35,
    height: 35,
    backgroundColor: "#1c294e",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  duplicateIcon: {
    color: "rgba(255,255,255,1)",
    fontSize: 26,
  },
  deleteBtn: {
    width: 35,
    height: 35,
    backgroundColor: "#1c294e",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  deleteIcon: {
    color: "rgba(255,255,255,1)",
    fontSize: 26,
  },
};

export default OptionsItem;
