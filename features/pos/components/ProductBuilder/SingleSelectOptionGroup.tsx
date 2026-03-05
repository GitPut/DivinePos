import React from "react";
import SingleSelectButton from "./SingleSelectButton";
import useWindowSize from "shared/hooks/useWindowSize";
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
  const { width } = useWindowSize();

  const stylesGrid = {
    gridContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
      gap: "10px",
      width: width > 800 ? "70%" : "100%",
    },
  };

  return (
    <div style={width > 800 ? styles.container : styles.containerMobile}>
      <span style={width > 800 ? styles.lbl : styles.lblMobile}>
        {label} {isRequired ? "*" : ""}
      </span>
      <div style={stylesGrid.gridContainer}>
        {options.map((option, listIndex) => {
          return (
            <SingleSelectButton
              key={option.id}
              label={
                parseFloat(option.priceIncrease ?? '0') > 0
                  ? `${option.label} (+$${option.priceIncrease})`
                  : option.label
              }
              style={styles.nonActiveOneTimeSelectableBtn}
              onPress={() => {
                setValue({
                  option: {
                    label: option.label,
                    priceIncrease:
                      option.priceIncrease ?? '0',
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    alignSelf: "stretch",
    display: "flex",
  },
  containerMobile: {
    marginBottom: 20,
    alignSelf: "stretch",
  },
  lbl: {
    display: "inline-block",
    fontWeight: "700",
    color: "#3e3f41",
    width: "25%",
  },
  lblMobile: {
    display: "inline-block",
    fontWeight: "700",
    color: "#3e3f41",
    width: "100%",
    marginBottom: 10,
  },
  optionsRow: {
    width: "70%",
    flexDirection: "row",
    flexWrap: "wrap",
    display: "flex",
  },
  activeOneTimeSelectableBtn: {
    height: 33,
    width: 110,
    marginRight: 7,
    marginBottom: 15,
  },
  nonActiveOneTimeSelectableBtn: {
    width: "100%",
    padding: 5,
    height: 33,
  },
  nonActiveOneTimeSelectableBtn1: {
    height: 33,
    width: 110,
    marginRight: 7,
    marginBottom: 15,
  },
  nonActiveOneTimeSelectableBtn2: {
    height: 33,
    width: 110,
    marginRight: 7,
    marginBottom: 15,
  },
};

export default SingleSelectOptionGroup;
