import React, { useState, useEffect } from "react";
import DropdownOption from "./DropdownOption";
import MultiSelectOptionGroup from "./MultiSelectOptionGroup";
import TableOption from "./TableOption";
import SingleSelectOptionGroup from "./SingleSelectOptionGroup";
import { Option, OptionsList, ProductProp } from "types";

interface OptionDisplayProps {
  e: Option;
  index: number;
  myObjProfile: ProductProp;
  setMyObjProfile: (
    val: ((prev: ProductProp) => ProductProp) | ProductProp
  ) => void;
  setopenOptions: (val: string | null) => void;
  openOptions: string | null;
  scrollY: number;
  isOnlineOrder?: boolean | null;
}

const OptionDisplay = ({
  e,
  index,
  myObjProfile,
  setMyObjProfile,
  setopenOptions,
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
          const newOptions = [...prev.options];
          const newProfile = structuredClone(prev);

          newProfile.options[index].optionsList.forEach(
            (option: OptionsList) => {
              option.selected = false;
              option.selectedTimes = "0";
            }
          );

          newOptions[index] = newProfile.options[index];

          return {
            ...prev,
            options: newOptions,
          };
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
      const newOptions = [...prev.options];

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

      return {
        ...prev,
        options: newOptions,
      };
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

    const Component =
      e.optionType === "Quantity Dropdown" || isOnlineOrder
        ? MultiSelectOptionGroup
        : TableOption;

    switch (e.optionType) {
      case "Dropdown":
        return (
          <DropdownOption
            id={index.toString()}
            setopenDropdown={setopenOptions}
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
          />
        );
      case "Quantity Dropdown":
      case "Table View":
        return (
          <Component
            e={e}
            index={index}
            myObjProfile={myObjProfile}
            setmyObjProfile={setMyObjProfile}
            id={index.toString()}
            setopenDropdown={setopenOptions}
            openDropdown={openOptions}
            label={e.label ?? ""}
            isRequired={e.isRequired ? true : false}
            optionsSelectedLabel={optionsSelectedLabel}
            scrollY={scrollY}
            setMyObjProfile={setMyObjProfile}
          />
        );
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
          />
        );
    }
  };

  return renderOptionByType();
};

export default OptionDisplay;
