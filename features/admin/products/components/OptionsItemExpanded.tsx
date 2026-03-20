import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";
import OptionSelectionItem from "./OptionSelectionItem";
import OptionConditionItem from "./OptionConditionItem";
import generateId from "utils/generateId";
import Switch from "shared/components/ui/Switch";
import { Option, ProductProp } from "types";
import DropdownStringOptions from "shared/components/ui/DropdownStringOptions";
import DropdownArrayOptions from "shared/components/ui/DropdownArrayOptions";

interface OptionsItemExpandedProps {
  item: Option;
  newProduct: ProductProp;
  newProductOptions: Option[];
  setnewProductOptions: (
    val: ((prev: Option[]) => Option[]) | Option[]
  ) => void;
  index: number;
  e: Option;
  sete: (val: ((prev: Option) => Option) | Option) => void;
  scrollY: number;
  setaddOptionClicked: (val: boolean) => void;
  setmoveToOptionPos: (val: number) => void;
  scrollToPositionIncluding: (val: number) => void;
}

function OptionsItemExpanded({
  item,
  newProduct,
  newProductOptions,
  setnewProductOptions,
  index,
  e,
  sete,
  scrollY,
  setaddOptionClicked,
  setmoveToOptionPos,
  scrollToPositionIncluding,
}: OptionsItemExpandedProps) {
  const [testMap, settestMap] = useState(structuredClone(item.optionsList));
  const [highlightedOptionID, sethighlightedOptionID] = useState<string | null>(
    null
  );
  const caseList = e.selectedCaseList ?? [];
  const DropdownOptions: { label: string; value?: string; id?: string }[] = [];

  testMap.forEach((testOption) =>
    DropdownOptions.push({
      ...testOption,
      label: testOption.label ?? "",
      id: testOption.id,
    })
  );

  const optionLbls: string[] = [];
  if (newProduct.options.length > 1) {
    newProduct.options.forEach((element) => {
      if (element.label !== e.label && element.label) {
        optionLbls.push(element.label);
      }
    });
  }

  const sizeLinkedLabels: string[] = e.sizeLinkedOptionLabel
    ? (newProduct.options
        .find((op) => op.label === e.sizeLinkedOptionLabel)
        ?.optionsList.map((op) => op.label)
        .filter(Boolean) as string[]) ?? []
    : [];

  return (
    <div style={styles.body}>
      {/* Row 1: Option Name, Option Type, Selection Limit */}
      <div style={styles.fieldRow}>
        <div style={styles.fieldGroup}>
          <span style={styles.fieldLabel}>Option Name</span>
          <input
            style={styles.input}
            onChange={(ev) => {
              const val = ev.target.value;
              sete((prevState) => ({
                ...prevState,
                label: val,
              }));
              setnewProductOptions((prev) => {
                const clone = structuredClone(prev);
                clone[index].label = val;
                return clone;
              });
            }}
            value={e.label ? e.label : ""}
            placeholder="e.g. Size, Toppings, Cheese"
          />
        </div>
        <div style={styles.fieldGroup}>
          <span style={styles.fieldLabel}>Option Type</span>
          <DropdownStringOptions
            placeholder="Choose Type"
            value={e.optionType}
            setValue={(val) => {
              if (e.optionType) {
                setnewProductOptions((prev) => {
                  const clone = structuredClone(prev);
                  clone[index].optionType = val;
                  return clone;
                });
              } else {
                setnewProductOptions((prev) => {
                  const clone = structuredClone(prev);
                  clone[index] = {
                    ...prev[index],
                    optionType: val,
                  };
                  return clone;
                });
              }
              sete((prevState) => ({
                ...prevState,
                optionType: val,
              }));
            }}
            options={["Dropdown", "Quantity Dropdown", "Table View", "Row", "Included Selections"]}
            scrollY={scrollY}
          />
        </div>
        <div style={styles.fieldGroup}>
          <span style={styles.fieldLabel}>Selection Limit</span>
          <input
            style={styles.input}
            onChange={(ev) => {
              const val = ev.target.value;
              sete((prevState) => ({
                ...prevState,
                numOfSelectable: val,
              }));
              setnewProductOptions((prev) => {
                const clone = structuredClone(prev);
                clone[index].numOfSelectable = val;
                return clone;
              });
            }}
            value={e.numOfSelectable ? e.numOfSelectable.toString() : ""}
            placeholder="No limit"
          />
        </div>
      </div>

      {/* Row 2: Toggles + Default Value + Included Selections fields */}
      <div style={styles.fieldRow}>
        <div style={styles.toggleRow}>
          <span style={styles.toggleLabel}>Required</span>
          <Switch
            isActive={e.isRequired ? true : false}
            toggleSwitch={() => {
              sete((prevState) => ({
                ...prevState,
                isRequired: !e.isRequired,
              }));
              setnewProductOptions((prev) => {
                const clone = structuredClone(prev);
                clone[index].isRequired = !e.isRequired;
                return clone;
              });
            }}
          />
        </div>
        {(e.optionType === "Table View" || e.optionType === "Quantity Dropdown" || e.optionType === "Included Selections") && (
          <div style={styles.toggleRow}>
            <span style={styles.toggleLabel}>Half & Half</span>
            <Switch
              isActive={e.allowHalfAndHalf ?? false}
              toggleSwitch={() => {
                sete((prevState) => ({
                  ...prevState,
                  allowHalfAndHalf: !e.allowHalfAndHalf,
                }));
                setnewProductOptions((prev) => {
                  const clone = structuredClone(prev);
                  clone[index].allowHalfAndHalf = !e.allowHalfAndHalf;
                  return clone;
                });
              }}
            />
          </div>
        )}
        {(e.optionType === "Dropdown" || e.optionType === "Row") && (
          <div style={styles.fieldGroup}>
            <span style={styles.fieldLabel}>Default Value</span>
            <DropdownArrayOptions
              placeholder="Default Value"
              value={e.defaultValue ? e.defaultValue.label : null}
              setValue={(val, valIndex) => {
                if (typeof valIndex !== "number" && valIndex === undefined)
                  return;
                settestMap((prev) => {
                  const clone = structuredClone(prev);
                  clone.forEach((element, indexOfOl) => {
                    if (element.selected) {
                      clone[indexOfOl].selected = false;
                    }
                  });
                  if (val) {
                    clone[valIndex].selected = true;
                  }
                  return clone;
                });
                if (typeof val !== "object") return;
                setnewProductOptions((prev) => {
                  const clone = structuredClone(prev);
                  clone[index].defaultValue = {
                    ...val,
                    label: val.label,
                    id: val.id ?? "",
                  };

                  clone[index].optionsList.forEach((element, indexOfOl) => {
                    if (element.selected) {
                      clone[index].optionsList[indexOfOl].selected = false;
                    }
                  });
                  if (val) {
                    clone[index].optionsList[valIndex].selected = true;
                  }

                  return clone;
                });
                sete((prevState) => {
                  const clone = structuredClone(prevState);
                  clone.defaultValue = {
                    ...val,
                    label: val.label,
                    id: val.id ?? "",
                  };
                  return clone;
                });
              }}
              options={DropdownOptions}
              scrollY={scrollY}
            />
          </div>
        )}
        {e.optionType === "Included Selections" && (
          <>
            <div style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>Included Selections</span>
              <input
                style={styles.input}
                onChange={(ev) => {
                  const val = ev.target.value;
                  sete((prevState) => ({
                    ...prevState,
                    includedSelections: val,
                  }));
                  setnewProductOptions((prev) => {
                    const clone = structuredClone(prev);
                    clone[index].includedSelections = val;
                    return clone;
                  });
                }}
                value={e.includedSelections ?? ""}
                placeholder="e.g. 3"
              />
            </div>
            <div style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>Extra Selection Price</span>
              <input
                style={styles.input}
                onChange={(ev) => {
                  const val = ev.target.value;
                  sete((prevState) => ({
                    ...prevState,
                    extraSelectionPrice: val,
                  }));
                  setnewProductOptions((prev) => {
                    const clone = structuredClone(prev);
                    clone[index].extraSelectionPrice = val;
                    return clone;
                  });
                }}
                value={e.extraSelectionPrice ?? ""}
                placeholder="e.g. 1.50"
              />
            </div>
          </>
        )}
      </div>

      {/* Included Selections: Display Style */}
      {e.optionType === "Included Selections" && (
        <div style={styles.fieldRow}>
          <div style={styles.fieldGroup}>
            <span style={styles.fieldLabel}>Display Style</span>
            <DropdownStringOptions
              placeholder="Choose Style"
              value={e.includedDisplayStyle ?? null}
              setValue={(val) => {
                sete((prevState) => ({
                  ...prevState,
                  includedDisplayStyle: val ?? undefined,
                }));
                setnewProductOptions((prev) => {
                  const clone = structuredClone(prev);
                  clone[index].includedDisplayStyle = val ?? undefined;
                  return clone;
                });
              }}
              options={["Quantity Dropdown", "Table View"]}
              scrollY={scrollY}
            />
          </div>
        </div>
      )}

      {/* Link Pricing To */}
      {optionLbls.length >= 1 && (
        <div style={styles.fieldRow}>
          <div style={styles.fieldGroup}>
            <span style={styles.fieldLabel}>Link Pricing To</span>
            <DropdownStringOptions
              placeholder="None"
              value={e.sizeLinkedOptionLabel ?? null}
              setValue={(val) => {
                sete((prevState) => ({
                  ...prevState,
                  sizeLinkedOptionLabel: val ?? undefined,
                }));
                setnewProductOptions((prev) => {
                  const clone = structuredClone(prev);
                  clone[index].sizeLinkedOptionLabel = val ?? undefined;
                  return clone;
                });
              }}
              options={optionLbls}
              scrollY={scrollY}
            />
          </div>
        </div>
      )}

      {/* Selections Section */}
      {testMap.length > 0 && (
        <div style={styles.sectionDivider}>
          <span style={styles.sectionTitle}>Selections</span>
        </div>
      )}
      {testMap.map((e, indexInnerList) => (
        <OptionSelectionItem
          key={e.id}
          eInnerListStart={e}
          indexInnerList={indexInnerList}
          testMap={testMap}
          settestMap={settestMap}
          setnewProductOptions={setnewProductOptions}
          index={index}
          setmoveToOptionPos={(pos) => {
            setmoveToOptionPos(pos);
            setaddOptionClicked(true);
          }}
          highlightedOptionID={highlightedOptionID}
          sethighlightedOptionID={sethighlightedOptionID}
          scrollToPositionIncluding={scrollToPositionIncluding}
          sizeLinkedLabels={sizeLinkedLabels}
        />
      ))}
      <div style={styles.addBtnRow}>
        <button
          style={styles.addSelectionBtn}
          onClick={() => {
            const cloneOuter = structuredClone(testMap);
            cloneOuter.push({
              label: null,
              priceIncrease: null,
              id: generateId(10),
            });
            setnewProductOptions((prev) => {
              const clone = structuredClone(prev);
              clone[index].optionsList = cloneOuter;
              return clone;
            });
            settestMap(cloneOuter);
            setaddOptionClicked(true);
          }}
          disabled={
            testMap.length > 0 && testMap[testMap.length - 1].label === null
          }
        >
          <FiPlus size={14} color="#1470ef" />
          <span style={styles.addSelectionTxt}>
            {testMap.length > 0 ? "Add Another Selection" : "Add Selection"}
          </span>
        </button>
      </div>

      {/* Conditions Section */}
      {caseList.length > 0 && (
        <div style={styles.sectionDivider}>
          <span style={styles.sectionTitle}>Conditions</span>
        </div>
      )}
      {caseList.length > 0 &&
        caseList.map((ifStatement, indexOfIf) => (
          <OptionConditionItem
            key={indexOfIf}
            ifStatement={ifStatement}
            indexOfIf={indexOfIf}
            scrollY={scrollY}
            index={index}
            setnewProductOptions={setnewProductOptions}
            sete={sete}
            ifOptionOptions={optionLbls}
            newProduct={newProduct}
          />
        ))}
      {optionLbls.length >= 1 && (
        <div style={styles.addBtnRow}>
          <button
            style={styles.addSelectionBtn}
            onClick={() => {
              const id = generateId(10);
              if (!newProductOptions[index].selectedCaseList) {
                setnewProductOptions((prev) => {
                  const clone = structuredClone(prev);
                  clone[index].selectedCaseList = [
                    {
                      selectedCaseKey: null,
                      selectedCaseValue: null,
                      id: id,
                    },
                  ];
                  return clone;
                });
                sete((prev) => ({
                  ...prev,
                  selectedCaseList: [
                    {
                      selectedCaseKey: null,
                      selectedCaseValue: null,
                      id: id,
                    },
                  ],
                }));
              } else {
                let clone: Option[] = [];
                setnewProductOptions((prev) => {
                  clone = structuredClone(prev);
                  const cloneCaseList = clone[index].selectedCaseList ?? [];
                  cloneCaseList.push({
                    selectedCaseKey: null,
                    selectedCaseValue: null,
                    id: id,
                  } as never);

                  clone[index].selectedCaseList = cloneCaseList;

                  return clone;
                });
                sete((prev) => ({
                  ...prev,
                  selectedCaseList: clone[index].selectedCaseList,
                }));
              }
            }}
          >
            <FiPlus size={14} color="#1470ef" />
            <span style={styles.addSelectionTxt}>Add Condition</span>
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    display: "flex",
    flexDirection: "column",
    padding: "20px 20px 8px",
    gap: 16,
  },
  fieldRow: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: "1 1 180px",
    minWidth: 140,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
  },
  input: {
    height: 42,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "0 12px",
    fontSize: 14,
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
  },
  toggleRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 42,
    padding: "0 14px",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    border: "1px solid #f1f5f9",
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
    whiteSpace: "nowrap",
  },
  sectionDivider: {
    borderTop: "1px solid #e2e8f0",
    paddingTop: 16,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  addBtnRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
    paddingBottom: 8,
  },
  addSelectionBtn: {
    height: 36,
    backgroundColor: "#fff",
    border: "1px dashed #cbd5e1",
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
  addSelectionTxt: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1470ef",
  },
};

export default OptionsItemExpanded;
