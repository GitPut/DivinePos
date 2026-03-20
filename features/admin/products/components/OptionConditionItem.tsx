import React from "react";
import { FiTrash2 } from "react-icons/fi";
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
    <div style={styles.container}>
      <div style={styles.fieldGroup}>
        <span style={styles.fieldLabel}>If Option</span>
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
      <div style={styles.equalsIcon}>
        <span style={styles.equalsText}>=</span>
      </div>
      <div style={styles.fieldGroup}>
        <span style={styles.fieldLabel}>Value Of Option</span>
        <DropdownStringOptions
          placeholder="Choose Value"
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
        title="Remove condition"
      >
        <FiTrash2 size={14} color="#ef4444" />
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: "10px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  equalsIcon: {
    width: 30,
    height: 38,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  equalsText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#94a3b8",
  },
  deleteBtn: {
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
    flexShrink: 0,
  },
};

export default OptionConditionItem;
