import React, { useState } from "react";
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

  return (
    <div style={styles.innerOptionContainer1}>
      <div style={styles.optionMainInfoRow1}>
        <div style={styles.optionNameInputGroup1}>
          <span style={styles.optionNameInputLbl1}>Option Name</span>
          <input
            style={styles.optionNameInput2}
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
            placeholder="Enter Name (Ex Size, Toppings, Cheese)"
          />
        </div>
        <div style={styles.optionTypeGroup1}>
          <span style={styles.optionTypeDropdownLbl1}>Option Type</span>
          <div>
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
        </div>
        <div style={styles.selectionLimitInputGroup1}>
          <span style={styles.selectionLimitInputLbl1}>Selection Limit</span>
          <input
            style={styles.selectionLimitInput2}
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
            placeholder="Leave empty for no limit"
          />
        </div>
      </div>
      <div style={styles.spacer5}></div>
      <div style={styles.optionMainInfoRow1}>
        <div style={styles.optionRequiredRow1}>
          <span style={styles.isOptionTxt1}>Is Option Required?:</span>
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
        {(e.optionType === "Dropdown" || e.optionType === "Row") && (
          <div style={styles.optionTypeGroup1}>
            <span style={styles.optionTypeDropdownLbl1}>Default Value</span>
            <div>
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
          </div>
        )}
        {e.optionType === "Included Selections" ? (
          <>
            <div style={styles.selectionLimitInputGroup1}>
              <span style={styles.selectionLimitInputLbl1}>Included Selections</span>
              <input
                style={styles.selectionLimitInput2}
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
            <div style={styles.selectionLimitInputGroup1}>
              <span style={styles.selectionLimitInputLbl1}>Extra Selection Price</span>
              <input
                style={styles.selectionLimitInput2}
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
        ) : (
          <div style={{ width: 195 }} />
        )}
      </div>
      {e.optionType === "Included Selections" && (
        <>
          <div style={styles.spacer5}></div>
          <div style={styles.optionMainInfoRow1}>
            <div style={styles.optionTypeGroup1}>
              <span style={styles.optionTypeDropdownLbl1}>Display Style</span>
              <div>
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
            <div style={{ width: 239 }} />
            <div style={{ width: 195 }} />
          </div>
        </>
      )}
      <div style={styles.spacer6}></div>
      {testMap.map((e, indexInnerList) => (
        <OptionSelectionItem
          key={e.id}
          style={styles.optionSelectionItem1}
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
        />
      ))}
      {testMap.length > 0 && <div style={styles.spacer7}></div>}
      <div style={styles.addAnotherSelectionBtnRow1}>
        <button
          style={styles.addAnotherSelectionBtn2}
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
          <span style={styles.addAnotherSelectionBtnLbl1}>
            {testMap.length > 0 ? "Add Another Selection" : "Add Selection"}
          </span>
        </button>
      </div>
      <div style={styles.spacer6}></div>
      {caseList.length > 0 &&
        caseList.map((ifStatement, indexOfIf) => (
          <OptionConditionItem
            key={indexOfIf}
            style={styles.optionSelectionItem1}
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
      {caseList.length > 0 && <div style={styles.spacer7}></div>}
      {optionLbls.length >= 1 && (
        <div style={styles.addAnotherSelectionBtnRow1}>
          <button
            style={styles.addAnotherSelectionBtn2}
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
            <span style={styles.addAnotherSelectionBtnLbl1}>
              Add If Statement
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  innerOptionContainer1: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  optionMainInfoRow1: {
    width: "100%",
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
    flexDirection: "column",
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
    border: "1px solid #9b9b9b",
    borderRadius: 5,
    padding: 10,
    boxSizing: "border-box" as const,
  },
  optionTypeGroup1: {
    width: 197,
    height: 77,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  optionTypeDropdownLbl1: {
    color: "#121212",
    fontSize: 17,
  },
  selectionLimitInputGroup1: {
    width: 195,
    height: 77,
    display: "flex",
    flexDirection: "column",
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
    border: "1px solid #9b9b9b",
    borderRadius: 5,
    padding: 10,
    boxSizing: "border-box" as const,
  },
  spacer5: {
    width: "100%",
    height: 40,
  },
  optionRequiredRow1: {
    width: 239,
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
  spacer6: {
    width: "100%",
    height: 53,
  },
  optionSelectionItem1: {
    width: "100%",
  },
  spacer7: {
    width: "100%",
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
};

export default OptionsItemExpanded;
