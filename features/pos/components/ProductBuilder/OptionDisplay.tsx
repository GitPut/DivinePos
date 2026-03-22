import React, { useState, useEffect } from "react";
import DropdownOption from "./DropdownOption";
import MultiSelectOptionGroup from "./MultiSelectOptionGroup";
import TableOption from "./TableOption";
import SingleSelectOptionGroup from "./SingleSelectOptionGroup";
import IncludedSelectionsGroup from "./IncludedSelectionsGroup";
import { Option, OptionsList, ProductProp } from "types";

interface OptionDisplayProps {
  e: Option;
  index: number;
  myObjProfile: ProductProp;
  setMyObjProfile: (
    val: ((prev: ProductProp) => ProductProp) | ProductProp
  ) => void;
  setOpenOptions: (val: string | null) => void;
  openOptions: string | null;
  scrollY: number;
  isOnlineOrder?: boolean | null;
}

const OptionDisplay = ({
  e,
  index,
  myObjProfile,
  setMyObjProfile,
  setOpenOptions,
  openOptions,
  scrollY,
  isOnlineOrder,
}: OptionDisplayProps) => {
  const checkCases = () => {
    if (!e.selectedCaseList) return true;
    if (e.selectedCaseList?.length > 0) {
      return e.selectedCaseList.every((ifStatement) => {
        const option = myObjProfile.options
          .find((op) => op.label === ifStatement.selectedCaseKey)
          ?.optionsList.find(
            (opL) => opL.label === ifStatement.selectedCaseValue
          );
        return option?.selected;
      });
    }
    return true;
  };

  const [optionVal, setOptionVal] = useState<OptionsList | null>(null);
  const [isConditionMet, setIsConditionMet] = useState<boolean>(true);

  useEffect(() => {
    const isMet = checkCases();
    if (isConditionMet !== isMet) {
      setIsConditionMet(isMet);
      if (!isMet) {
        setMyObjProfile((prev: ProductProp) => {
          const clone = structuredClone(prev);

          clone.options[index].optionsList.forEach(
            (option: OptionsList) => {
              option.selected = false;
              option.selectedTimes = "0";
            }
          );

          return clone;
        });

        setOptionVal(null);
      } else {
        if (e.defaultValue) {
          const defaultOption = e.optionsList.find(
            (op) => op.label === e.defaultValue?.label
          );
          const defaultOptionIndex = e.optionsList.findIndex(
            (op) => op.label === e.defaultValue?.label
          );

          if (defaultOption) {
            handleValueChange({
              option: {
                ...defaultOption,
                label: defaultOption.label,
                priceIncrease: defaultOption.priceIncrease,
                selected: true,
                selectedTimes: defaultOption.selectedTimes,
                countsAs: defaultOption.countsAs,
                id: defaultOption.id,
              },
              listIndex: defaultOptionIndex,
            });
          }
        }
      }
    }
  }, [myObjProfile.options, index, e]);

  useEffect(() => {
    const selectedOption = e.optionsList.find((op) => op.selected);
    if (selectedOption && selectedOption !== optionVal) {
      setOptionVal(selectedOption);
    }
  }, [e.optionsList]);

  const handleValueChange = ({
    option,
    listIndex,
    isOnlyOneSelectable,
  }: {
    option: OptionsList | null;
    listIndex: number | null;
    isOnlyOneSelectable?: boolean;
  }) => {
    setMyObjProfile((prev: ProductProp) => {
      if (!option || isNaN(listIndex!) || listIndex === null) return prev;
      const clone = structuredClone(prev);
      const newOptions = clone.options;

      const selectedOptions = newOptions[index].optionsList.filter(
        (op) => op.selected
      );

      const NumOfSelectable = parseFloat(e.numOfSelectable ?? "0");

      if (NumOfSelectable === 1 || isOnlyOneSelectable) {
        newOptions[index].optionsList.forEach((opt: OptionsList, optIndex) => {
          if (optIndex !== listIndex) {
            newOptions[index].optionsList[optIndex].selected = false;
          } else {
            newOptions[index].optionsList[optIndex].selected = true;
            setOptionVal(option);
          }
        });
      } else if (
        NumOfSelectable > 0 &&
        selectedOptions.length >= NumOfSelectable
      ) {
        newOptions[index].optionsList[listIndex].selected = false;
      } else {
        newOptions[index].optionsList[listIndex].selected =
          !newOptions[index].optionsList[listIndex].selected;
      }

      return clone;
    });
  };

  const renderOptionByType = () => {
    if (!isConditionMet) return null;

    const optionsSelectedLabel = e.optionsList
      .filter((op) => parseFloat(op.selectedTimes ?? "0") > 0)
      .map(
        (op, idx, arr) =>
          `${op.label} (${op.selectedTimes})${idx < arr.length - 1 ? ", " : ""}`
      )
      .join("");

    switch (e.optionType) {
      case "Dropdown":
        return (
          <DropdownOption
            id={index.toString()}
            setopenDropdown={setOpenOptions}
            openDropdown={openOptions}
            label={e.label ?? ""}
            isRequired={e.isRequired ? true : false}
            options={e.optionsList}
            setValue={({
              option,
              listIndex,
            }: {
              option: OptionsList | null;
              listIndex: number | null;
            }) =>
              handleValueChange({
                option,
                listIndex,
                isOnlyOneSelectable: true,
              })
            }
            value={optionVal}
            scrollY={scrollY}
            optionGroup={e}
            allOptions={myObjProfile.options}
          />
        );
      case "Quantity Dropdown":
        return (
          <MultiSelectOptionGroup
            e={e}
            index={index}
            myObjProfile={myObjProfile}
            setmyObjProfile={setMyObjProfile}
            id={index.toString()}
            setopenDropdown={setOpenOptions}
            openDropdown={openOptions}
            label={e.label ?? ""}
            isRequired={e.isRequired ? true : false}
            optionsSelectedLabel={optionsSelectedLabel}
            scrollY={scrollY}
          />
        );
      case "Table View":
        return (
          <TableOption
            e={e}
            index={index}
            myObjProfile={myObjProfile}
            setMyObjProfile={setMyObjProfile}
            label={e.label ?? ""}
            isRequired={e.isRequired ? true : false}
            optionsSelectedLabel={optionsSelectedLabel}
          />
        );
      case "Included Selections": {
        const displayStyle = e.includedDisplayStyle ?? "Quantity Dropdown";

        const includedCount = parseFloat(e.includedSelections ?? "0");
        const extraPrice = parseFloat(e.extraSelectionPrice ?? "0");
        let totalSelected = 0;
        e.optionsList.forEach((item) => {
          totalSelected += parseFloat(item.selectedTimes ?? "0");
        });
        const extraSelections = Math.max(0, totalSelected - includedCount);

        return (
          <div style={{ alignSelf: "stretch" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}>
              <span style={{
                fontSize: 12,
                color: "#64748b",
                fontWeight: "500",
              }}>
                {Math.min(totalSelected, includedCount)} of {includedCount} included
              </span>
              {extraSelections > 0 && (
                <span style={{
                  fontSize: 12,
                  color: "#ef4444",
                  fontWeight: "600",
                }}>
                  +{extraSelections} extra = +${(extraSelections * extraPrice).toFixed(2)}
                </span>
              )}
            </div>
            {displayStyle === "Table View" ? (
              <TableOption
                e={e}
                index={index}
                myObjProfile={myObjProfile}
                setMyObjProfile={setMyObjProfile}
                label={e.label ?? ""}
                isRequired={e.isRequired ? true : false}
                optionsSelectedLabel={optionsSelectedLabel}
              />
            ) : (
              <IncludedSelectionsGroup
                e={e}
                index={index}
                myObjProfile={myObjProfile}
                setmyObjProfile={setMyObjProfile}
                id={index.toString()}
                setopenDropdown={setOpenOptions}
                openDropdown={openOptions}
                label={e.label ?? ""}
                isRequired={e.isRequired ? true : false}
                optionsSelectedLabel={optionsSelectedLabel}
                scrollY={scrollY}
              />
            )}
          </div>
        );
      }
      default:
        return (
          <SingleSelectOptionGroup
            label={e.label ?? ""}
            isRequired={e.isRequired ? true : false}
            options={e.optionsList}
            setValue={({
              option,
              listIndex,
            }: {
              option: OptionsList | null;
              listIndex: number | null;
            }) => handleValueChange({ option, listIndex })}
            value={
              parseFloat(e.numOfSelectable ?? "0") === 1 ? optionVal : null
            }
            optionGroup={e}
            allOptions={myObjProfile.options}
          />
        );
    }
  };

  return renderOptionByType();
};

export default OptionDisplay;
