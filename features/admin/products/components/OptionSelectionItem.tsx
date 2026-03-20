import React from "react";
import { FiChevronDown, FiChevronUp, FiTrash2 } from "react-icons/fi";
import { Option, OptionsList } from "types";

interface OptionSelectionItemProps {
  style?: React.CSSProperties;
  eInnerListStart: OptionsList;
  indexInnerList: number;
  testMap: OptionsList[];
  settestMap: (val: OptionsList[]) => void;
  setnewProductOptions: (val: ((prev: Option[]) => Option[]) | Option[]) => void;
  index: number;
  setmoveToOptionPos: (val: number) => void;
  highlightedOptionID: string | null;
  sethighlightedOptionID: (val: string | null) => void;
  scrollToPositionIncluding: (val: number) => void;
  sizeLinkedLabels?: string[];
}

function OptionSelectionItem({
  style,
  eInnerListStart,
  indexInnerList,
  testMap,
  settestMap,
  setnewProductOptions,
  index,
  setmoveToOptionPos,
  highlightedOptionID,
  sethighlightedOptionID,
  scrollToPositionIncluding,
  sizeLinkedLabels,
}: OptionSelectionItemProps) {
  const eInnerList = structuredClone(eInnerListStart);

  return (
    <div
      style={{
        ...styles.container,
        ...style,
        ...(highlightedOptionID === eInnerList.id
          ? { borderColor: "#1470ef" }
          : {}),
      }}
    >
      <div style={styles.fieldsRow}>
        <div style={styles.nameGroup}>
          <span style={styles.fieldLabel}>Selection Name</span>
          <input
            style={styles.input}
            onChange={(e) => {
              const val = e.target.value;
              const cloneOuter = structuredClone(testMap);
              cloneOuter[indexInnerList].label = val;
              setnewProductOptions((prev) => {
                const clone = structuredClone(prev);
                clone[index].optionsList = cloneOuter;
                return clone;
              });
              settestMap(cloneOuter);
            }}
            value={eInnerList?.label ?? ""}
            placeholder="e.g. Small, Pepperoni, Extra Cheese"
          />
        </div>
        {sizeLinkedLabels && sizeLinkedLabels.length > 0 ? (
          <div style={styles.sizePriceRow}>
            {sizeLinkedLabels.map((sizeLabel) => (
              <div key={sizeLabel} style={styles.sizePriceGroup}>
                <span style={styles.fieldLabel}>{sizeLabel}</span>
                <input
                  style={styles.input}
                  onChange={(e) => {
                    const val = e.target.value;
                    const re = /^-?\d*\.?\d*$/;
                    if (val === "" || re.test(val)) {
                      const cloneOuter = structuredClone(testMap);
                      if (!cloneOuter[indexInnerList].priceBySize) {
                        cloneOuter[indexInnerList].priceBySize = {};
                      }
                      cloneOuter[indexInnerList].priceBySize![sizeLabel] = val;
                      setnewProductOptions((prev) => {
                        const clone = structuredClone(prev);
                        clone[index].optionsList = cloneOuter;
                        return clone;
                      });
                      settestMap(cloneOuter);
                    }
                  }}
                  value={eInnerList?.priceBySize?.[sizeLabel] ?? ""}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.priceGroup}>
            <span style={styles.fieldLabel}>Price Increase</span>
            <input
              style={styles.input}
              onChange={(e) => {
                const val = e.target.value;
                const re = /^-?\d*\.?\d*$/;

                if (val === "" || re.test(val)) {
                  const cloneOuter = structuredClone(testMap);
                  cloneOuter[indexInnerList].priceIncrease = val;
                  setnewProductOptions((prev) => {
                    const clone = structuredClone(prev);
                    clone[index].optionsList = cloneOuter;
                    return clone;
                  });
                  settestMap(cloneOuter);
                }
              }}
              value={eInnerList?.priceIncrease ? eInnerList.priceIncrease.toString() : ""}
              placeholder="0.00"
            />
          </div>
        )}
      </div>
      <div style={styles.btnsRow}>
        <button
          style={styles.iconBtn}
          onClick={() => {
            if (testMap.length > 1 && indexInnerList !== testMap.length - 1) {
              setnewProductOptions((prev) => {
                const clone = structuredClone(prev);
                const f = clone[index].optionsList.splice(indexInnerList, 1)[0];
                clone[index].optionsList.splice(indexInnerList + 1, 0, f);
                settestMap(clone[index].optionsList);
                sethighlightedOptionID(eInnerList.id);
                scrollToPositionIncluding(135);
                return clone;
              });
            }
          }}
          title="Move down"
        >
          <FiChevronDown size={14} color="#64748b" />
        </button>
        <button
          style={styles.iconBtn}
          onClick={() => {
            if (testMap.length > 1 && indexInnerList !== 0) {
              setnewProductOptions((prev) => {
                const clone = structuredClone(prev);
                const f = clone[index].optionsList.splice(indexInnerList, 1)[0];
                clone[index].optionsList.splice(indexInnerList - 1, 0, f);
                settestMap(clone[index].optionsList);
                sethighlightedOptionID(eInnerList.id);
                scrollToPositionIncluding(-135);
                return clone;
              });
            }
          }}
          title="Move up"
        >
          <FiChevronUp size={14} color="#64748b" />
        </button>
        <button
          style={styles.deleteBtn}
          onClick={() => {
            const cloneOuter = structuredClone(testMap);
            cloneOuter.splice(indexInnerList, 1);
            setnewProductOptions((prev) => {
              const clone = structuredClone(prev);
              clone[index].optionsList = cloneOuter;
              return clone;
            });
            settestMap(cloneOuter);
            if (indexInnerList !== 0) {
              setmoveToOptionPos(indexInnerList - 1);
            }
            sethighlightedOptionID(eInnerList.id);
            scrollToPositionIncluding(0);
          }}
          title="Delete"
        >
          <FiTrash2 size={14} color="#ef4444" />
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "10px 0",
    borderBottom: "1px solid #f1f5f9",
    borderLeft: "2px solid transparent",
    paddingLeft: 2,
  },
  fieldsRow: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  nameGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: "1 1 140px",
    minWidth: 100,
  },
  priceGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: "0 1 160px",
    minWidth: 100,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  input: {
    height: 38,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "0 10px",
    fontSize: 13,
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
  },
  sizePriceRow: {
    display: "flex",
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap" as const,
    flex: "1 1 100%",
  },
  sizePriceGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: "1 1 60px",
    minWidth: 55,
    maxWidth: 90,
  },
  btnsRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    alignSelf: "flex-end",
  },
  iconBtn: {
    width: 26,
    height: 26,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  deleteBtn: {
    width: 26,
    height: 26,
    backgroundColor: "#fef2f2",
    border: "1px solid #fee2e2",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
};

export default OptionSelectionItem;
