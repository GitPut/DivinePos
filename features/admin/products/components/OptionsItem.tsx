import React, { RefObject, useState } from "react";
import {
  FiClipboard,
  FiChevronDown,
  FiChevronUp,
  FiCopy,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import OptionsItemExpanded from "./OptionsItemExpanded";
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
  onDragStart?: (index: number) => void;
  onDragOver?: (index: number) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
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
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  isDragOver,
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
      typeof obj.label === "string" &&
      obj.label.trim().length > 0 &&
      Array.isArray(obj.optionsList) &&
      "id" in obj &&
      "optionType" in obj &&
      typeof obj.optionType === "string" &&
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

  const isExpanded = indexOn === index;

  return (
    <>
      <div
        style={{
          ...styles.container,
          ...style,
          ...(isExpanded ? { paddingBottom: 20 } : {}),
          ...(selectedID === item.id
            ? { borderColor: "#1D294E", boxShadow: "0 0 0 1px #1D294E" }
            : {}),
          ...(isDragging ? { opacity: 0.4 } : {}),
          ...(isDragOver ? { borderColor: "#1D294E", borderStyle: "dashed", boxShadow: "none" } : {}),
        }}
        onDragOver={(ev) => {
          ev.preventDefault();
          onDragOver?.(index);
        }}
        onDrop={(ev) => {
          ev.preventDefault();
          onDragEnd?.();
        }}
      >
        <button
          style={{
            ...styles.header,
            ...(isExpanded ? { borderBottom: "1px solid #e2e8f0" } : {}),
          }}
          onClick={() => {
            if (!isExpanded) {
              setindexOn(index);
              setselectedID(null);
            } else {
              setindexOn(null);
            }
          }}
        >
          <div style={styles.headerLeft}>
            <div
              draggable
              onDragStart={(ev) => {
                ev.stopPropagation();
                onDragStart?.(index);
              }}
              onDragEnd={(ev) => {
                // Only clean up if onDrop didn't already handle it
                ev.preventDefault();
                onDragEnd?.();
              }}
              style={styles.dragHandle}
              title="Drag to reorder"
              onClick={(ev) => ev.stopPropagation()}
            >
              <MdDragIndicator size={18} color="#94a3b8" />
            </div>
            <span style={styles.optionIndex}>{index + 1}</span>
            <span style={styles.optionName}>
              {e.label ? e.label : "New Option"}
            </span>
            {e.optionType && (
              <span style={styles.typeBadge}>{e.optionType}</span>
            )}
          </div>
          <div style={styles.btnsRow}>
            <button
              style={styles.iconBtn}
              onClick={(ev) => {
                ev.stopPropagation();
                copyEToClipboard();
              }}
              title="Copy to clipboard"
            >
              <FiClipboard size={14} color="#64748b" />
            </button>
            <button
              style={styles.iconBtn}
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
              title="Move down"
            >
              <FiChevronDown size={15} color="#64748b" />
            </button>
            <button
              style={styles.iconBtn}
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
              title="Move up"
            >
              <FiChevronUp size={15} color="#64748b" />
            </button>
            <button
              style={styles.iconBtn}
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
              title="Duplicate"
            >
              <FiCopy size={14} color="#64748b" />
            </button>
            <button
              style={styles.deleteIconBtn}
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
              title="Delete"
            >
              <FiTrash2 size={14} color="#ef4444" />
            </button>
          </div>
        </button>
        {isExpanded && (
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
        <div style={styles.bottomBtns}>
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
            <FiPlus size={15} color="#fff" />
            <span style={styles.createOptionTxt}>Create Option</span>
          </button>
          <button
            style={styles.pasteOptionBtn}
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
            <FiClipboard size={15} color="#475569" />
            <span style={styles.pasteOptionTxt}>Paste Option</span>
          </button>
        </div>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    marginBottom: 12,
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    minHeight: 52,
    border: "none",
    cursor: "pointer",
    padding: "0 16px",
    boxSizing: "border-box",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  dragHandle: {
    cursor: "grab",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
    borderRadius: 4,
    flexShrink: 0,
  },
  optionIndex: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    flexShrink: 0,
  },
  optionName: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "600",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  typeBadge: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    padding: "3px 8px",
    borderRadius: 4,
    whiteSpace: "nowrap",
  },
  btnsRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  iconBtn: {
    width: 30,
    height: 30,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  deleteIconBtn: {
    width: 30,
    height: 30,
    backgroundColor: "#fef2f2",
    border: "1px solid #fee2e2",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  bottomBtns: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  createOptionBtn: {
    height: 38,
    backgroundColor: "#1D294E",
    borderRadius: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingLeft: 16,
    paddingRight: 16,
    border: "none",
    cursor: "pointer",
  },
  createOptionTxt: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 13,
  },
  pasteOptionBtn: {
    height: 38,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingLeft: 16,
    paddingRight: 16,
    cursor: "pointer",
  },
  pasteOptionTxt: {
    fontWeight: "500",
    color: "#475569",
    fontSize: 13,
  },
};

export default OptionsItem;
