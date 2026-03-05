import React, { useEffect, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { MdClear } from "react-icons/md";
import { IoRefresh, IoCheckmark } from "react-icons/io5";
import Modal from "shared/components/ui/Modal";
import useWindowSize from "shared/hooks/useWindowSize";
import OptionSelectorContainer from "./OptionSelectorContainer";
import { Option, OptionsList, ProductProp } from "types";

interface TableOptionProps {
  label: string;
  isRequired: boolean;
  myObjProfile: ProductProp;
  setMyObjProfile: (
    val: ((prev: ProductProp) => ProductProp) | ProductProp
  ) => void;
  index: number;
  e: Option;
  optionsSelectedLabel: string;
}

function TableOption({
  label,
  isRequired,
  myObjProfile,
  setMyObjProfile,
  index,
  e,
  optionsSelectedLabel,
}: TableOptionProps) {
  const [localMyObjProfile, setlocalMyObjProfile] =
    useState<ProductProp>(myObjProfile);
  const [modalVisible, setmodalVisible] = useState(false);
  const { height, width } = useWindowSize();

  useEffect(() => {
    setlocalMyObjProfile(myObjProfile);
  }, [myObjProfile]);

  const onMinusPress = ({
    option,
    listIndex,
  }: {
    option: OptionsList;
    listIndex: number;
  }) => {
    const newMyObjProfile = structuredClone(localMyObjProfile);
    const thisItemCountsAs = option.countsAs ?? "1";
    const selectedTimes = parseFloat(
      newMyObjProfile.options[index].optionsList[listIndex].selectedTimes ?? "0"
    );

    if (selectedTimes > 0) {
      newMyObjProfile.options[index].optionsList[listIndex].selectedTimes = (
        selectedTimes -
        1 * parseFloat(thisItemCountsAs)
      ).toString();
    }

    setlocalMyObjProfile(newMyObjProfile);
  };

  const onPlusPress = ({
    option,
    listIndex,
  }: {
    option: OptionsList;
    listIndex: number;
  }) => {
    const newMyObjProfile = structuredClone(localMyObjProfile);

    const selectedItems = newMyObjProfile.options[index].optionsList.filter(
      (op) => {
        const opSelectedTimes = parseFloat(op.selectedTimes ?? "0");
        return opSelectedTimes > 0;
      }
    );

    const thisItemCountsAs = parseFloat(option.countsAs ?? "1");

    let selectedTimesTotal = thisItemCountsAs;

    selectedItems.map((op) => {
      selectedTimesTotal +=
        op.countsAs ?? false
          ? parseFloat(op.selectedTimes ?? "0") * thisItemCountsAs
          : parseFloat(op.selectedTimes ?? "0");
    });

    if (
      parseFloat(e.numOfSelectable ?? "0") >= selectedTimesTotal ||
      !e.numOfSelectable ||
      e.numOfSelectable === "0"
    ) {
      const selectedTimes = parseFloat(
        newMyObjProfile.options[index].optionsList[listIndex].selectedTimes ??
          "0"
      );

      if (selectedTimes ?? 0 > 0) {
        newMyObjProfile.options[index].optionsList[listIndex].selectedTimes = (
          selectedTimes + 1
        ).toString();
      } else {
        newMyObjProfile.options[index].optionsList[listIndex].selectedTimes =
          "1";
      }
      setlocalMyObjProfile(newMyObjProfile);
    }
  };

  const clearOptions = () => {
    const newMyObjProfile = structuredClone(localMyObjProfile);
    newMyObjProfile.options[index].optionsList.map((op) => {
      op.selectedTimes = "0";
    });
    setlocalMyObjProfile(newMyObjProfile);
  };

  const clearOptionsMain = () => {
    const newMyObjProfile = structuredClone(localMyObjProfile);
    newMyObjProfile.options[index].optionsList.map((op) => {
      op.selectedTimes = "0";
    });
    setMyObjProfile(newMyObjProfile);
  };

  return (
    <div style={width > 800 ? styles.container : styles.containerMobile}>
      <span style={width > 800 ? styles.lbl : styles.lblMobile}>
        {label} {isRequired ? "*" : ""}
      </span>
      <div style={width < 800 ? { width: "100%" } : { width: "70%" }}>
        <button
          style={styles.dropdown}
          onClick={() => {
            setmodalVisible(true);
          }}
        >
          {optionsSelectedLabel !== "" ? (
            <span style={styles.placeholder}>{optionsSelectedLabel}</span>
          ) : (
            <span style={styles.placeholder}>Select {label}</span>
          )}
          {optionsSelectedLabel.length > 0 ? (
            <button
              style={{ marginTop: 5, marginRight: 5, background: "none", border: "none", cursor: "pointer" }}
              onClick={(e) => { e.stopPropagation(); clearOptionsMain(); }}
            >
              <MdClear size={24} color="red" />
            </button>
          ) : (
            <FiChevronDown size={30} color="rgba(128,128,128,1)" style={{ marginTop: 2, marginRight: 2 }} />
          )}
        </button>
      </div>
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => {
          setmodalVisible(false);
          setMyObjProfile(localMyObjProfile);
        }}
      >
        <div style={{ cursor: "default" }} onClick={(e) => e.stopPropagation()}>
          <div
            style={{
              ...styles.modalContainer,
              height: height * 0.9,
              width: width * 0.9,
              padding: 20,
            }}
          >
            <div style={styles.innerContainer}>
              <div style={styles.header}>
                <button
                  onClick={clearOptions}
                  style={{
                    backgroundColor: "rgba(208,2,27,1)",
                    borderRadius: 50,
                    height: 40,
                    width: 40,
                    justifyContent: "center",
                    alignItems: "center",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                  }}
                >
                  <IoRefresh size={35} color="white" />
                </button>
                <span style={styles.optionName}>{e.label}</span>
                <button
                  onClick={() => {
                    setmodalVisible(false);
                    setMyObjProfile(localMyObjProfile);
                  }}
                  style={{
                    backgroundColor: "#314ab0",
                    borderRadius: 50,
                    height: 40,
                    width: 40,
                    justifyContent: "center",
                    alignItems: "center",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                  }}
                >
                  <IoCheckmark size={40} color="white" />
                </button>
              </div>
              <div style={styles.scrollArea}>
                <div
                  style={{ overflow: "auto", ...styles.scrollArea_contentContainerStyle }}
                >
                  <div style={styles.flexwrapRow}>
                    {localMyObjProfile.options[index].optionsList.map(
                      (option, listIndex) => (
                        <OptionSelectorContainer
                          key={listIndex}
                          style={styles.optionSelectorItemContainer}
                          option={option}
                          onMinusPress={() =>
                            onMinusPress({ option, listIndex })
                          }
                          onPlusPress={() =>
                            onPlusPress({ option, listIndex })
                          }
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
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
    height: 44,
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
  modalContainer: {
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    flexDirection: "column",
  },
  dropdown: {
    width: "100%",
    height: 44,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    border: "2px solid #6987d3",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    display: "flex",
    cursor: "pointer",
    padding: 0,
  },
  placeholder: {
    fontWeight: "500",
    color: "#7f838c",
    fontSize: 12,
    margin: 10,
  },
  downIcon: {
    color: "rgba(128,128,128,1)",
    fontSize: 30,
    margin: 0,
    marginTop: 2,
    marginRight: 2,
  },
  innerContainer: {
    width: "90%",
    height: "90%",
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    width: "100%",
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
  },
  closeIcon: {
    color: "white",
    fontSize: 40,
  },
  optionName: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
  },
  resetIcon: {
    color: "white",
    fontSize: 35,
  },
  scrollArea: {
    width: "100%",
    height: "85%",
  },
  scrollArea_contentContainerStyle: {
    height: "100%",
    width: "100%",
    paddingRight: 15,
    paddingLeft: 15,
  },
  flexwrapRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    justifyContent: "space-between",
    display: "flex",
  },
  optionSelectorItemContainer: {
    marginBottom: 20,
  },
};

export default TableOption;
