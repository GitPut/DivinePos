import React from "react";
import SingleSelectButton from "./SingleSelectButton";
import { OptionsList } from "types";

interface SingleSelectOptionGroupProps {
  isRequired: boolean;
  label: string;
  options: OptionsList[];
  value: OptionsList | null;
  setValue: (val: { option: OptionsList; listIndex: number | null }) => void;
}

function SingleSelectOptionGroup({
  isRequired,
  label,
  options,
  value,
  setValue,
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
              label={
                parseFloat(option.priceIncrease ?? "0") > 0
                  ? `${option.label} (+$${option.priceIncrease})`
                  : option.label
              }
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
