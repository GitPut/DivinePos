import React from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
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
}: OptionSelectionItemProps) {
  const eInnerList = structuredClone(eInnerListStart);

  return (
    <div
      style={{
        ...styles.container,
        ...style,
        ...(highlightedOptionID === eInnerList.id
          ? {
              borderBottom: "2px solid #4CAF50",
              paddingBottom: 20,
              paddingTop: 20,
            }
          : {
              borderBottom: "2px solid #d3d3d3",
              paddingBottom: 20,
              paddingTop: 20,
            }),
      }}
    >
      <div style={styles.optionSelectionNameInputGroup}>
        <span style={styles.selectionNameInputLbl}>Option Selection Name</span>
        <input
          style={styles.selectionNameInput}
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
          value={eInnerList?.label ?? ''}
          placeholder="Enter Name (Ex: Small, Pepperoni, Extra Cheese) "
        />
      </div>
      <div style={styles.selectionPriceIncreaseInputGroup}>
        <span style={styles.selectionPriceIncreaseLbl}>Price Increase</span>
        <input
          style={styles.selectionPriceIncreaseInput}
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
          placeholder="Enter If Price Increases With Selection"
        />
      </div>
      <div style={styles.btnsRow}>
        <button
          style={styles.moveDownBtn}
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
        >
          <FiChevronDown style={styles.chevronDown} />
        </button>
        <button
          style={styles.moveUpBtn}
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
        >
          <FiChevronUp style={styles.chevronUp} />
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
        >
          <MdDeleteOutline style={styles.deleteIcon} />
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  optionSelectionNameInputGroup: {
    width: 290,
    height: 84,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  selectionNameInputLbl: {
    color: "#121212",
    fontSize: 17,
  },
  selectionNameInput: {
    width: "100%",
    height: 50,
    backgroundColor: "#ffffff",
    border: "1px solid #9b9b9b",
    borderRadius: 5,
    padding: 10,
    boxSizing: "border-box" as const,
  },
  selectionPriceIncreaseInputGroup: {
    width: 199,
    height: 84,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  selectionPriceIncreaseLbl: {
    color: "#121212",
    fontSize: 17,
  },
  selectionPriceIncreaseInput: {
    height: 50,
    backgroundColor: "#ffffff",
    border: "1px solid #9b9b9b",
    borderRadius: 5,
    alignSelf: "stretch",
    padding: 10,
    boxSizing: "border-box" as const,
  },
  btnsRow: {
    width: 180,
    height: 50,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 0,
    marginLeft: 0,
  },
  moveUpBtn: {
    width: 50,
    height: 50,
    backgroundColor: "#1c294e",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
  },
  chevronUp: {
    color: "rgba(255,255,255,1)",
    fontSize: 30,
  },
  moveDownBtn: {
    width: 50,
    height: 50,
    backgroundColor: "#1c294e",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
  },
  chevronDown: {
    color: "rgba(255,255,255,1)",
    fontSize: 30,
  },
  deleteBtn: {
    width: 50,
    height: 50,
    backgroundColor: "#1c294e",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
  },
  deleteIcon: {
    color: "rgba(255,255,255,1)",
    fontSize: 27,
  },
};

export default OptionSelectionItem;
