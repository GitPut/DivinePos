/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { RefObject, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ViewStyle,
  ScrollView,
} from "react-native";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import OptionsItemOpenInner from "./OptionsItemOpenInner";
import { Tooltip } from "react-tooltip";
import { useAlert } from "react-alert";
import { Option, ProductProp } from "types/global";

interface OptionsItemProps {
  item: Option;
  index: number;
  setnewProduct: (
    val: ((prev: ProductProp) => ProductProp) | ProductProp
  ) => void;
  newProduct: ProductProp;
  newProductOptions: Option[];
  setnewProductOptions: (
    val: ((prev: Option[]) => Option[]) | Option[]
  ) => void;
  indexOn: number | null;
  setindexOn: (val: number | null) => void;
  style?: ViewStyle;
  scrollY: number;
  scrollViewRef: RefObject<ScrollView>;
  selectedID: string | null;
  setselectedID: (val: string | null) => void;
}

function OptionsItem({
  item,
  index,
  setnewProduct,
  newProduct,
  newProductOptions,
  setnewProductOptions,
  indexOn,
  setindexOn,
  style,
  scrollY,
  scrollViewRef,
  selectedID,
  setselectedID,
}: OptionsItemProps) {
  const [e, sete] = useState(structuredClone(item));
  const [addOptionClicked, setaddOptionClicked] = useState(true);
  const [moveToOptionPos, setmoveToOptionPos] = useState<number | null>(null);
  const alertP = useAlert();

  const isValidOption = (obj: any): boolean => {
    return (
      obj &&
      typeof obj === "object" &&
      "label" in obj &&
      Array.isArray(obj.optionsList) &&
      "id" in obj &&
      "optionType" in obj &&
      Array.isArray(obj.selectedCaseList) &&
      "isRequired" in obj
    );
  };

  const scrollToPositionIncluding = (position: number) => {
    scrollViewRef.current?.measure(
      (
        _fx: number,
        _fy: number,
        _width: number,
        _scrollViewHeight: number,
        _px: number,
        _py: number
      ) => {
        scrollViewRef.current?.scrollTo({
          y: scrollY + position,
          animated: true,
        });
      }
    );
  };

  const copyEToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(e));
  };

  return (
    <>
      <View
        style={[
          styles.container,
          style,
          indexOn === index && { paddingBottom: 20 },
          selectedID === item.id
            ? { borderColor: "#4CAF50", borderWidth: 2 }
            : { borderColor: "#000000" },
        ]}
        onLayout={(event) => {
          const { y, height } = event.nativeEvent.layout;
          if (indexOn === index) {
            // Calculate the bottom position of the element within the ScrollView
            let elementBottomPosition = y + height;

            const caseList = newProductOptions[index].selectedCaseList ?? [];

            if (addOptionClicked && caseList.length > 0) {
              elementBottomPosition -= 135 * caseList.length;
              setaddOptionClicked(false);
              if (moveToOptionPos !== null) {
                elementBottomPosition -=
                  (newProductOptions[index].optionsList?.length -
                    moveToOptionPos) *
                  135;
                setmoveToOptionPos(null);
              }
            }

            // Get the ScrollView's height and the current scroll position
            scrollViewRef.current?.measure(
              (
                _fx: number,
                _fy: number,
                _width: number,
                scrollViewHeight: number,
                _px: number,
                _py: number
              ) => {
                // Calculate the visible bottom position of the ScrollView
                const visibleBottomPosition = scrollY + scrollViewHeight;

                // Check if the element is fully visible. If not, scroll to show the element.
                if (
                  elementBottomPosition > visibleBottomPosition ||
                  y < scrollY
                ) {
                  const positionToScroll = Math.max(
                    0,
                    elementBottomPosition - scrollViewHeight
                  );
                  scrollViewRef.current?.scrollTo({
                    y: positionToScroll,
                    animated: true,
                  });
                }
              }
            );
          }
        }}
      >
        <Pressable
          style={[
            styles.closedOptionContainer,
            index === indexOn && { borderBottomWidth: 1 },
          ]}
          onPress={() => {
            if (indexOn !== index) {
              setindexOn(index);
              setselectedID(null);
            } else {
              setindexOn(null);
            }
          }}
        >
          <Text style={styles.optionNameLbl}>
            {e.label ? e.label : "New Option"}
          </Text>
          <View style={styles.btnsRow}>
            <Pressable
              style={styles.moveDownBtn}
              onPress={copyEToClipboard}
              nativeID="copyToClipboardBtn"
            >
              <Entypo name="clipboard" size={20} color="white" />
            </Pressable>
            <Tooltip
              anchorSelect="#copyToClipboardBtn"
              place="top"
              style={{
                backgroundColor: "black",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  padding: 10,
                }}
              >
                Copy to clipboard
              </Text>
            </Tooltip>
            <Pressable
              style={styles.moveDownBtn}
              onPress={() => {
                if (
                  newProductOptions.length > 1 &&
                  index !== newProductOptions.length - 1
                ) {
                  setnewProductOptions((prev) => {
                    const clone = structuredClone(prev);
                    const f = clone.splice(index, 1)[0];
                    clone.splice(index + 1, 0, f);
                    return clone;
                  });

                  setnewProduct((prevState) => ({
                    ...prevState,
                    options: newProductOptions,
                  }));
                  setindexOn(null);
                  scrollToPositionIncluding(100);
                  setselectedID(item.id ?? "");
                }
              }}
              nativeID="moveDownBtn"
            >
              <Entypo name="chevron-down" style={styles.chevronDown} />
            </Pressable>
            <Tooltip
              anchorSelect="#moveDownBtn"
              place="top"
              style={{
                backgroundColor: "black",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  padding: 10,
                }}
              >
                Move down
              </Text>
            </Tooltip>
            <Pressable
              style={styles.moveUpBtn}
              onPress={() => {
                if (newProductOptions.length > 1 && index !== 0) {
                  setnewProductOptions((prev) => {
                    const clone = structuredClone(prev);
                    const f = clone.splice(index, 1)[0];
                    clone.splice(index - 1, 0, f);
                    return clone;
                  });

                  setnewProduct((prevState) => ({
                    ...prevState,
                    options: newProductOptions,
                  }));
                  setindexOn(null);
                  scrollToPositionIncluding(-100);
                  setselectedID(item.id ?? "");
                }
              }}
              nativeID="moveUpBtn"
            >
              <Entypo name="chevron-up" style={styles.chevronUp} />
            </Pressable>
            <Tooltip
              anchorSelect="#moveUpBtn"
              place="top"
              style={{
                backgroundColor: "black",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  padding: 10,
                }}
              >
                Move up
              </Text>
            </Tooltip>
            <Pressable
              style={styles.duplicateBtn}
              onPress={() => {
                setnewProductOptions((prev) => {
                  const clone = structuredClone(prev);
                  clone.push({
                    ...item,
                    label: item.label + " Copy",
                    id: Math.random().toString(36).substr(2, 9),
                  });
                  return clone;
                });

                setnewProduct((prevState) => ({
                  ...prevState,
                  options: newProductOptions,
                }));
                setindexOn(newProductOptions.length);
                setselectedID(null);
              }}
              nativeID="duplicateBtn"
            >
              <MaterialCommunityIcons
                name="content-copy"
                style={styles.duplicateIcon}
              />
            </Pressable>
            <Tooltip
              anchorSelect="#duplicateBtn"
              place="top"
              style={{
                backgroundColor: "black",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  padding: 10,
                }}
              >
                Duplicate
              </Text>
            </Tooltip>
            <Pressable
              style={styles.deleteBtn}
              onPress={() => {
                const newProductOptionsUpdated = newProduct.options.filter(
                  (e, filterIndex) => filterIndex !== index && e.id !== item.id
                );
                // newProductOptions.current.splice(index, 1);
                setnewProductOptions((prev) => {
                  const clone = structuredClone(prev);
                  clone.splice(index, 1);
                  return clone;
                });

                setnewProduct((prevState) => ({
                  ...prevState,
                  options: newProductOptionsUpdated,
                }));
                setindexOn(null);
                setselectedID(null);
              }}
              nativeID="deleteBtn"
            >
              <MaterialCommunityIcons
                name="delete-outline"
                style={styles.deleteIcon}
              />
            </Pressable>
            <Tooltip
              anchorSelect="#deleteBtn"
              place="top"
              style={{
                backgroundColor: "black",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  padding: 10,
                }}
              >
                Delete
              </Text>
            </Tooltip>
          </View>
        </Pressable>
        {indexOn === index && (
          <OptionsItemOpenInner
            item={item}
            newProduct={newProduct}
            newProductOptions={newProductOptions}
            setnewProductOptions={setnewProductOptions}
            index={index}
            e={e}
            sete={sete}
            scrollY={scrollY}
            setaddOptionClicked={setaddOptionClicked}
            setmoveToOptionPos={setmoveToOptionPos}
            scrollToPositionIncluding={scrollToPositionIncluding}
          />
        )}
      </View>
      {index === newProduct.options.length - 1 && (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => {
              setnewProductOptions((prev) => {
                const clone = structuredClone(prev);
                clone.push({
                  label: null,
                  optionsList: [],
                  // selectedCaseKey: null,
                  // selectedCaseValue: null,
                  numOfSelectable: null,
                  id: Math.random().toString(36).substr(2, 9),
                  optionType: null,
                  selectedCaseList: [],
                  isRequired: false,
                });
                return clone;
              });
              setindexOn(newProductOptions.length);
            }}
            disabled={e.label === null}
            style={styles.createOptionBtn}
          >
            <Text style={styles.createOptionTxt}>Create Option</Text>
          </Pressable>
          <Pressable
            style={[styles.createOptionBtn, { marginLeft: 20 }]}
            onPress={async () => {
              try {
                const text = await navigator.clipboard.readText();
                const parsed = JSON.parse(text);

                if (!isValidOption(parsed)) {
                  alertP.error("Clipboard data is not a valid option");
                  return;
                }

                setnewProductOptions((prev) => {
                  const clone = structuredClone(prev);
                  const existingIndex = prev.findIndex(
                    (e) => e.id === parsed.id
                  );

                  if (existingIndex > -1) {
                    const newCopy = {
                      ...parsed,
                      id: Math.random().toString(36).substr(2, 9),
                      label: (parsed.label || "Untitled") + " Copy",
                    };
                    clone.push(newCopy);
                  } else {
                    clone.push(parsed);
                  }
                  return clone;
                });

                setindexOn(newProductOptions.length);
              } catch (err) {
                console.error(err);
                if (
                  err instanceof DOMException &&
                  err.name === "NotAllowedError"
                ) {
                  alertP.error(
                    "Clipboard access denied. Try copying again and clicking Paste right after."
                  );
                } else {
                  alertP.error("Invalid or blocked clipboard content.");
                }
              }
            }}
          >
            <Text style={styles.createOptionTxt}>Paste Option</Text>
          </Pressable>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,1)",
    justifyContent: "flex-start",
    marginBottom: 30,
  },
  innerOptionContainer1: {
    width: 808,
    height: 389,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginTop: 20,
    marginLeft: 20,
  },
  optionMainInfoRow1: {
    width: 808,
    height: 84,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionNameInputGroup1: {
    width: 239,
    height: 84,
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
    borderWidth: 1,
    borderColor: "#9b9b9b",
    borderRadius: 5,
  },
  optionTypeGroup1: {
    width: 197,
    height: 77,
    justifyContent: "space-between",
  },
  optionTypeDropdownLbl1: {
    color: "#121212",
    fontSize: 17,
  },
  optionTypeDropdown2: {
    width: 195,
    height: 50,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#9b9b9b",
    borderRadius: 5,
  },
  selectionLimitInputGroup1: {
    width: 195,
    height: 77,
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
    borderWidth: 1,
    borderColor: "#9b9b9b",
    borderRadius: 5,
  },
  spacer5: {
    width: 808,
    height: 40,
  },
  optionRequiredRow1: {
    width: 216,
    height: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  isOptionTxt1: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 17,
  },
  isRequiredBtn1: {
    width: 44,
    height: 20,
    backgroundColor: "#E6E6E6",
  },
  spacer6: {
    width: 808,
    height: 53,
  },
  optionSelectionItem1: {
    height: 84,
    width: 808,
  },
  spacer7: {
    width: 808,
    height: 61,
  },
  addAnotherSelectionBtnRow1: {
    height: 47,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
  },
  addAnotherSelectionBtn2: {
    width: 173,
    height: 47,
    backgroundColor: "#1c294e",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  addAnotherSelectionBtnLbl1: {
    color: "rgba(255,255,255,1)",
    fontSize: 15,
  },
  createOptionBtn: {
    width: 173,
    height: 47,
    backgroundColor: "#1c294e",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  createOptionTxt: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 20,
  },
  closedOptionContainer: {
    backgroundColor: "rgba(255,255,255,1)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 67,
  },
  optionNameLbl: {
    color: "#121212",
    fontSize: 17,
    marginRight: 20,
    marginLeft: 20,
  },
  btnsRow: {
    width: 224,
    height: 35,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 20,
    marginLeft: 20,
  },
  moveUpBtn: {
    width: 35,
    height: 35,
    backgroundColor: "#1c294e",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chevronUp: {
    color: "rgba(255,255,255,1)",
    fontSize: 30,
  },
  moveDownBtn: {
    width: 35,
    height: 35,
    backgroundColor: "#1c294e",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chevronDown: {
    color: "rgba(255,255,255,1)",
    fontSize: 30,
  },
  duplicateBtn: {
    width: 35,
    height: 35,
    backgroundColor: "#1c294e",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  duplicateIcon: {
    color: "rgba(255,255,255,1)",
    fontSize: 26,
  },
  deleteBtn: {
    width: 35,
    height: 35,
    backgroundColor: "#1c294e",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIcon: {
    color: "rgba(255,255,255,1)",
    fontSize: 26,
  },
});

export default OptionsItem;
