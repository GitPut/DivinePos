import React from "react";
import SingleSelectButton from "./SingleSelectButton";
import { Option, OptionsList } from "types";
import { resolveOptionPrice } from "utils/resolveOptionPrice";

interface SingleSelectOptionGroupProps {
  isRequired: boolean;
  label: string;
  options: OptionsList[];
  value: OptionsList | null;
  setValue: (val: { option: OptionsList; listIndex: number | null }) => void;
  optionGroup?: Option;
  allOptions?: Option[];
}

function SingleSelectOptionGroup({
  isRequired,
  label,
  options,
  value,
  setValue,
  optionGroup,
  allOptions,
}: SingleSelectOptionGroupProps) {
  return (
    <div style={styles.container}>
      <span style={styles.lbl}>
        {label} {isRequired ? "*" : ""}
      </span>
      <div style={styles.pillsRow}>
        {options.map((option, listIndex) => {
          return (
            <SingleSelectButton
              key={option.id}
              label={(() => {
                const displayPrice = optionGroup && allOptions
                  ? resolveOptionPrice(option, optionGroup, allOptions)
                  : option.priceIncrease ?? "0";
                return parseFloat(displayPrice) > 0
                  ? `${option.label} (+$${parseFloat(displayPrice).toFixed(2)})`
                  : option.label;
              })()}
              onPress={() => {
                setValue({
                  option: {
                    label: option.label,
                    priceIncrease: option.priceIncrease ?? "0",
                    id: option.id,
                  },
                  listIndex: listIndex,
                });
              }}
              isSelected={
                value
                  ? value.label === option.label
                  : option.selected
                  ? option.selected
                  : false
              }
            />
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: 20,
    alignSelf: "stretch",
  },
  lbl: {
    display: "inline-block",
    fontWeight: "700",
    color: "#1a1a1a",
    fontSize: 14,
    marginBottom: 10,
  },
  pillsRow: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
};

export default SingleSelectOptionGroup;
