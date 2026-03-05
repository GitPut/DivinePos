import React from "react";
import { MdDragHandle, MdDeleteOutline } from "react-icons/md";
import { Option, ProductProp } from "types";
import DropdownStringOptions from "shared/components/ui/DropdownStringOptions";

interface IfStatement {
  selectedCaseKey: string | null;
  selectedCaseValue: string | null;
}

interface OptionConditionItemProps {
  style?: React.CSSProperties;
  ifStatement: IfStatement;
  indexOfIf: number;
  scrollY: number;
  index: number;
  setnewProductOptions: (
    val: ((prev: Option[]) => Option[]) | Option[]
  ) => void;
  sete: (val: ((prev: Option) => Option) | Option) => void;
  ifOptionOptions: string[];
  newProduct: ProductProp;
}

function OptionConditionItem({
  style,
  ifStatement,
  indexOfIf,
  scrollY,
  index,
  setnewProductOptions,
  sete,
  ifOptionOptions,
  newProduct,
}: OptionConditionItemProps) {
  const local = newProduct.options.filter(
    (localE) => localE.label == ifStatement.selectedCaseKey
  );
  const optionLblsValuesLocal: string[] = [];

  if (local.length > 0) {
    local[0].optionsList.forEach((el) => {
      if (!el.label) return;
      optionLblsValuesLocal.push(el.label);
    });
  }

  return (
    <div style={{ ...styles.container, ...style }}>
      <div style={styles.optionSelectionNameInputGroup}>
        <span style={styles.selectionNameInputLbl}>If Option</span>
        <DropdownStringOptions
          placeholder="Choose Option"
          value={ifStatement.selectedCaseKey}
          setValue={(val) => {
            let clone: Option[] = [];
            setnewProductOptions((prev) => {
              clone = structuredClone(prev);
              const selectedCaseList = clone[index].selectedCaseList;
              if (selectedCaseList) {
                selectedCaseList[indexOfIf].selectedCaseKey = val;
              }
              return clone;
            });
            sete((prev) => ({
              ...prev,
              selectedCaseList: clone[index].selectedCaseList,
            }));
          }}
          options={ifOptionOptions.filter((ifOptionValue) =>
            !ifOptionValue || ifOptionValue === "" ? false : true
          )}
          scrollY={scrollY}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MdDragHandle color="black" size={30} />
      </div>
      <div style={styles.selectionPriceIncreaseInputGroup}>
        <span style={styles.selectionPriceIncreaseLbl}>Value Of Option</span>
        <DropdownStringOptions
          placeholder="Choose Option"
          value={ifStatement?.selectedCaseValue}
          setValue={(val) => {
            let clone: Option[] = [];
            setnewProductOptions((prev) => {
              clone = structuredClone(prev);
              const selectedCaseList = clone[index].selectedCaseList;
              if (selectedCaseList) {
                selectedCaseList[indexOfIf].selectedCaseValue = val;
              }
              return clone;
            });
            sete((prev) => ({
              ...prev,
              selectedCaseList: clone[index].selectedCaseList,
            }));
          }}
          options={optionLblsValuesLocal}
          scrollY={scrollY}
        />
      </div>
      <button
        style={styles.deleteBtn}
        onClick={() => {
          let clone: Option[] = [];
          setnewProductOptions((prev) => {
            clone = structuredClone(prev);
            clone[index].selectedCaseList?.splice(indexOfIf, 1);
            return clone;
          });
          sete((prev) => ({
            ...prev,
            selectedCaseList: clone[index].selectedCaseList,
          }));
        }}
      >
        <MdDeleteOutline style={styles.deleteIcon} />
      </button>
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
    height: 84,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  selectionNameInputLbl: {
    color: "#121212",
    fontSize: 17,
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

export default OptionConditionItem;
