import React, { useState } from "react";
import { FiPlus, FiChevronDown, FiChevronUp } from "react-icons/fi";
import OptionSelectionItem from "./OptionSelectionItem";
import OptionConditionItem from "./OptionConditionItem";
import generateId from "utils/generateId";
import Switch from "shared/components/ui/Switch";
import { Option, ProductProp } from "types";
import DropdownStringOptions from "shared/components/ui/DropdownStringOptions";
import DropdownArrayOptions from "shared/components/ui/DropdownArrayOptions";

const OPTION_TYPE_DESCRIPTIONS: Record<string, string> = {
  "Dropdown": "Customer picks one from a dropdown menu",
  "Quantity Dropdown": "Customer can pick multiple with quantities",
  "Table View": "Shows choices in a grid layout",
  "Row": "Shows choices as buttons in a row",
  "Included Selections": "N included free, charge extra after",
};

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
  const [highlightedOptionID, sethighlightedOptionID] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
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

  const hasAdvancedSettings =
    e.optionType === "Included Selections" ||
    (e.optionType === "Dropdown" || e.optionType === "Row") ||
    (e.optionType === "Table View" || e.optionType === "Quantity Dropdown" || e.optionType === "Included Selections") ||
    optionLbls.length >= 1;

  return (
    <div style={styles.body}>
      {/* Core Fields */}
      <div style={styles.fieldRow}>
        <div style={{ ...styles.fieldGroup, flex: 2 }}>
          <span style={styles.fieldLabel}>Option Name</span>
          <input
            style={styles.input}
            onChange={(ev) => {
              const val = ev.target.value;
              sete((prevState) => ({ ...prevState, label: val }));
              setnewProductOptions((prev) => {
                const clone = structuredClone(prev);
                clone[index].label = val;
                return clone;
              });
            }}
            value={e.label ? e.label : ""}
            placeholder='e.g. "Size", "Toppings", "Crust Type"'
          />
        </div>
        <div style={styles.fieldGroup}>
          <span style={styles.fieldLabel}>How customers choose</span>
          <DropdownStringOptions
            placeholder="Choose type"
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
                  clone[index] = { ...prev[index], optionType: val };
                  return clone;
                });
              }
              sete((prevState) => ({ ...prevState, optionType: val }));
            }}
            options={["Dropdown", "Quantity Dropdown", "Table View", "Row", "Included Selections"]}
            scrollY={scrollY}
          />
        </div>
      </div>

      {/* Type description hint */}
      {e.optionType && OPTION_TYPE_DESCRIPTIONS[e.optionType] && (
        <div style={styles.typeHint}>
          <span style={styles.typeHintText}>{OPTION_TYPE_DESCRIPTIONS[e.optionType]}</span>
        </div>
      )}

      {/* Required toggle — always visible, most important setting */}
      <div style={styles.inlineToggle}>
        <span style={styles.inlineToggleLabel}>Required</span>
        <span style={styles.inlineToggleHint}>Customer must select a choice</span>
        <div style={{ marginLeft: "auto" }}>
          <Switch
            isActive={e.isRequired ? true : false}
            toggleSwitch={() => {
              sete((prevState) => ({ ...prevState, isRequired: !e.isRequired }));
              setnewProductOptions((prev) => {
                const clone = structuredClone(prev);
                clone[index].isRequired = !e.isRequired;
                return clone;
              });
            }}
          />
        </div>
      </div>

      {/* Selections Section — always visible */}
      <div style={styles.sectionDivider}>
        <span style={styles.sectionTitle}>Choices</span>
        <span style={styles.sectionHint}>Add the options customers can pick from</span>
      </div>
      {/* Bulk price setter */}
      {testMap.length > 1 && (
        <div style={styles.bulkPriceRow}>
          <span style={styles.bulkPriceLabel}>Set all prices</span>
          <div style={styles.bulkPriceFields}>
            {sizeLinkedLabels.length > 0 ? (
              sizeLinkedLabels.map((sizeLabel) => (
                <div key={sizeLabel} style={styles.bulkPriceItem}>
                  <span style={styles.bulkPriceSizeLabel}>{sizeLabel}</span>
                  <input
                    style={styles.bulkPriceInput}
                    placeholder="$"
                    id={`bulk-${index}-${sizeLabel}`}
                  />
                </div>
              ))
            ) : (
              <div style={styles.bulkPriceItem}>
                <span style={styles.bulkPriceSizeLabel}>Price</span>
                <input
                  style={styles.bulkPriceInput}
                  placeholder="$"
                  id={`bulk-${index}-all`}
                />
              </div>
            )}
          </div>
          <button
            style={styles.bulkApplyBtn}
            onClick={() => {
              const cloneOuter = structuredClone(testMap);
              if (sizeLinkedLabels.length > 0) {
                sizeLinkedLabels.forEach((sizeLabel) => {
                  const input = document.getElementById(`bulk-${index}-${sizeLabel}`) as HTMLInputElement;
                  if (!input || input.value === "") return;
                  const re = /^-?\d*\.?\d*$/;
                  if (!re.test(input.value)) return;
                  cloneOuter.forEach((item) => {
                    if (!item.priceBySize) item.priceBySize = {};
                    item.priceBySize![sizeLabel] = input.value;
                  });
                  input.value = "";
                });
              } else {
                const input = document.getElementById(`bulk-${index}-all`) as HTMLInputElement;
                if (!input || input.value === "") return;
                const re = /^-?\d*\.?\d*$/;
                if (!re.test(input.value)) return;
                cloneOuter.forEach((item) => { item.priceIncrease = input.value; });
                input.value = "";
              }
              setnewProductOptions((prev) => {
                const clone = structuredClone(prev);
                clone[index].optionsList = cloneOuter;
                return clone;
              });
              settestMap(cloneOuter);
            }}
          >
            <span style={styles.bulkApplyTxt}>Apply to All</span>
          </button>
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
            cloneOuter.push({ label: null, priceIncrease: null, id: generateId(10) });
            setnewProductOptions((prev) => {
              const clone = structuredClone(prev);
              clone[index].optionsList = cloneOuter;
              return clone;
            });
            settestMap(cloneOuter);
            setaddOptionClicked(true);
          }}
          disabled={testMap.length > 0 && testMap[testMap.length - 1].label === null}
        >
          <FiPlus size={14} color="#1D294E" />
          <span style={styles.addSelectionTxt}>
            {testMap.length > 0 ? "Add Another Choice" : "Add Choice"}
          </span>
        </button>
      </div>

      {/* Advanced Settings — collapsed by default */}
      {hasAdvancedSettings && (
        <>
          <button style={styles.advancedToggle} onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? <FiChevronUp size={14} color="#64748b" /> : <FiChevronDown size={14} color="#64748b" />}
            <span style={styles.advancedToggleTxt}>Advanced Settings</span>
          </button>

          {showAdvanced && (
            <div style={styles.advancedSection}>
              {/* Selection Limit */}
              <div style={styles.fieldRow}>
                <div style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Max Selections <span style={styles.fieldHint}>Leave empty for no limit</span></span>
                  <input
                    style={styles.input}
                    onChange={(ev) => {
                      const val = ev.target.value;
                      sete((prevState) => ({ ...prevState, numOfSelectable: val }));
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

                {/* Half & Half */}
                {(e.optionType === "Table View" || e.optionType === "Quantity Dropdown" || e.optionType === "Included Selections") && (
                  <div style={styles.inlineToggleSm}>
                    <span style={styles.fieldLabel}>Allow Half & Half</span>
                    <Switch
                      isActive={e.allowHalfAndHalf ?? false}
                      toggleSwitch={() => {
                        sete((prevState) => ({ ...prevState, allowHalfAndHalf: !e.allowHalfAndHalf }));
                        setnewProductOptions((prev) => {
                          const clone = structuredClone(prev);
                          clone[index].allowHalfAndHalf = !e.allowHalfAndHalf;
                          return clone;
                        });
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Default Value */}
              {(e.optionType === "Dropdown" || e.optionType === "Row") && (
                <div style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Default Selection <span style={styles.fieldHint}>Pre-selected when product opens</span></span>
                  <DropdownArrayOptions
                    placeholder="None"
                    value={e.defaultValue ? e.defaultValue.label : null}
                    setValue={(val, valIndex) => {
                      if (typeof valIndex !== "number" && valIndex === undefined) return;
                      settestMap((prev) => {
                        const clone = structuredClone(prev);
                        clone.forEach((element, indexOfOl) => { if (element.selected) clone[indexOfOl].selected = false; });
                        if (val) clone[valIndex].selected = true;
                        return clone;
                      });
                      if (typeof val !== "object") return;
                      setnewProductOptions((prev) => {
                        const clone = structuredClone(prev);
                        clone[index].defaultValue = { ...val, label: val.label, id: val.id ?? "" };
                        clone[index].optionsList.forEach((element, indexOfOl) => { if (element.selected) clone[index].optionsList[indexOfOl].selected = false; });
                        if (val) clone[index].optionsList[valIndex].selected = true;
                        return clone;
                      });
                      sete((prevState) => {
                        const clone = structuredClone(prevState);
                        clone.defaultValue = { ...val, label: val.label, id: val.id ?? "" };
                        return clone;
                      });
                    }}
                    options={DropdownOptions}
                    scrollY={scrollY}
                  />
                </div>
              )}

              {/* Included Selections fields */}
              {e.optionType === "Included Selections" && (
                <div style={styles.fieldRow}>
                  <div style={styles.fieldGroup}>
                    <span style={styles.fieldLabel}>Free Included <span style={styles.fieldHint}>How many are free</span></span>
                    <input
                      style={styles.input}
                      onChange={(ev) => {
                        const val = ev.target.value;
                        sete((prevState) => ({ ...prevState, includedSelections: val }));
                        setnewProductOptions((prev) => { const clone = structuredClone(prev); clone[index].includedSelections = val; return clone; });
                      }}
                      value={e.includedSelections ?? ""}
                      placeholder="e.g. 3"
                    />
                  </div>
                  <div style={styles.fieldGroup}>
                    <span style={styles.fieldLabel}>Extra Price <span style={styles.fieldHint}>Cost per extra choice</span></span>
                    <input
                      style={styles.input}
                      onChange={(ev) => {
                        const val = ev.target.value;
                        sete((prevState) => ({ ...prevState, extraSelectionPrice: val }));
                        setnewProductOptions((prev) => { const clone = structuredClone(prev); clone[index].extraSelectionPrice = val; return clone; });
                      }}
                      value={e.extraSelectionPrice ?? ""}
                      placeholder="e.g. 1.50"
                    />
                  </div>
                  <div style={styles.fieldGroup}>
                    <span style={styles.fieldLabel}>Display Style</span>
                    <DropdownStringOptions
                      placeholder="Choose style"
                      value={e.includedDisplayStyle ?? null}
                      setValue={(val) => {
                        sete((prevState) => ({ ...prevState, includedDisplayStyle: val ?? undefined }));
                        setnewProductOptions((prev) => { const clone = structuredClone(prev); clone[index].includedDisplayStyle = val ?? undefined; return clone; });
                      }}
                      options={["Quantity Dropdown", "Table View"]}
                      scrollY={scrollY}
                    />
                  </div>
                </div>
              )}

              {/* Link Pricing To */}
              {optionLbls.length >= 1 && (
                <div style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Link Prices To Another Option <span style={styles.fieldHint}>Different prices based on another selection (e.g. size)</span></span>
                  <DropdownStringOptions
                    placeholder="None (same price for all)"
                    value={e.sizeLinkedOptionLabel ?? null}
                    setValue={(val) => {
                      sete((prevState) => ({ ...prevState, sizeLinkedOptionLabel: val ?? undefined }));
                      setnewProductOptions((prev) => { const clone = structuredClone(prev); clone[index].sizeLinkedOptionLabel = val ?? undefined; return clone; });
                    }}
                    options={optionLbls}
                    scrollY={scrollY}
                  />
                </div>
              )}

              {/* Visibility Rules */}
              {optionLbls.length >= 1 && (
                <>
                  {caseList.length > 0 && (
                    <div style={styles.sectionDivider}>
                      <span style={styles.sectionTitle}>Visibility Rules</span>
                      <span style={styles.sectionHint}>Only show this option when another option has a specific value</span>
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
                  <div style={styles.addBtnRow}>
                    <button
                      style={styles.addSelectionBtn}
                      onClick={() => {
                        const id = generateId(10);
                        if (!newProductOptions[index].selectedCaseList) {
                          setnewProductOptions((prev) => {
                            const clone = structuredClone(prev);
                            clone[index].selectedCaseList = [{ selectedCaseKey: null, selectedCaseValue: null, id: id }];
                            return clone;
                          });
                          sete((prev) => ({ ...prev, selectedCaseList: [{ selectedCaseKey: null, selectedCaseValue: null, id: id }] }));
                        } else {
                          let clone: Option[] = [];
                          setnewProductOptions((prev) => {
                            clone = structuredClone(prev);
                            const cloneCaseList = clone[index].selectedCaseList ?? [];
                            cloneCaseList.push({ selectedCaseKey: null, selectedCaseValue: null, id: id } as never);
                            clone[index].selectedCaseList = cloneCaseList;
                            return clone;
                          });
                          sete((prev) => ({ ...prev, selectedCaseList: clone[index].selectedCaseList }));
                        }
                      }}
                    >
                      <FiPlus size={14} color="#1D294E" />
                      <span style={styles.addSelectionTxt}>Add Visibility Rule</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    display: "flex",
    flexDirection: "column",
    padding: "20px 20px 8px",
    gap: 14,
    maxHeight: 500,
    overflowY: "auto" as const,
    overflowX: "hidden" as const,
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
  fieldHint: {
    fontSize: 11,
    fontWeight: "400",
    color: "#94a3b8",
    marginLeft: 4,
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
  typeHint: {
    padding: "6px 10px",
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    border: "1px solid #f1f5f9",
  },
  typeHintText: {
    fontSize: 12,
    color: "#64748b",
  },
  inlineToggle: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    border: "1px solid #f1f5f9",
  },
  inlineToggleLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
  },
  inlineToggleHint: {
    fontSize: 12,
    color: "#94a3b8",
  },
  inlineToggleSm: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: "1 1 180px",
    minWidth: 140,
    height: 42,
    padding: "0 12px",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    border: "1px solid #f1f5f9",
  },
  sectionDivider: {
    borderTop: "1px solid #e2e8f0",
    paddingTop: 14,
    marginTop: 2,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  sectionHint: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "400",
    marginTop: 2,
  },
  bulkPriceRow: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: "12px 14px",
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    border: "1px solid #bfdbfe",
  },
  bulkPriceLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D294E",
  },
  bulkPriceFields: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap" as const,
  },
  bulkPriceItem: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  bulkPriceSizeLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
  },
  bulkPriceInput: {
    width: 70,
    height: 32,
    border: "1px solid #bfdbfe",
    borderRadius: 6,
    padding: "0 8px",
    fontSize: 13,
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
    backgroundColor: "#fff",
  },
  bulkApplyBtn: {
    height: 34,
    paddingLeft: 14,
    paddingRight: 14,
    backgroundColor: "#1D294E",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  bulkApplyTxt: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
    whiteSpace: "nowrap" as const,
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
    color: "#1D294E",
  },
  advancedToggle: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: "8px 0",
    background: "none",
    border: "none",
    cursor: "pointer",
    alignSelf: "flex-start",
  },
  advancedToggleTxt: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
  },
  advancedSection: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    padding: "12px 16px",
    backgroundColor: "#fafbfc",
    borderRadius: 8,
    border: "1px solid #f1f5f9",
  },
};

export default OptionsItemExpanded;
