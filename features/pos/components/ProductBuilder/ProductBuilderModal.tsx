import React, { useEffect, useState } from "react";
import GoBackButton from "./GoBackButton";
import ProductImage from "shared/components/ui/ProductImage";
import AddToCartButton from "./AddToCartButton";
import {
  addCartState,
  cartState,
  setCartState,
  productBuilderState,
  resetProductBuilderState,
} from "store/appState";
import { useAlert } from "react-alert";
import OptionDisplay from "./OptionDisplay";
import { ProductProp } from "types";
import useWindowSize from "shared/hooks/useWindowSize";

function ProductBuilderModal() {
  const { product, itemIndex, imageUrl, isOnlineOrder } =
    productBuilderState.use();
  if (!product) return null;

  const cart = cartState.use();
  const myObj = product;
  const [myObjProfile, setmyObjProfile] = useState<ProductProp>(myObj);
  const [total, settotal] = useState<number>(parseFloat(myObj.price ?? "0"));
  const isEditing = typeof itemIndex === "number" ? true : false;

  const [extraInput, setextraInput] = useState<string>(
    myObj.extraDetails ? myObj.extraDetails : ""
  );
  const [openOptions, setopenOptions] = useState<string | null>(null);
  const alertP = useAlert();
  const [scrollY, setscrollY] = useState<number>(0);
  const { width } = useWindowSize();

  async function getDeepCopy(obj: ProductProp) {
    return await structuredClone(obj);
  }

  useEffect(() => {
    async function loadProduct(productToLoad: ProductProp) {
      const productCopy = await getDeepCopy(productToLoad);
      setmyObjProfile(productCopy);
    }
    if (product !== null) {
      loadProduct(product);
    }
  }, [product]);

  const goBack = () => {
    resetProductBuilderState();
  };

  useEffect(() => {
    settotal(getPrice());
  }, [myObjProfile]);

  const getPrice = () => {
    let total = parseFloat(myObjProfile.price);
    myObjProfile.options.forEach((op) => {
      op.optionsList
        .filter((f) => f.selected === true)
        .map(
          (e) =>
            (total += parseFloat(e.priceIncrease ?? "0")
              ? parseFloat(e.priceIncrease ?? "0")
              : 0)
        );
    });
    myObjProfile.options.forEach((op) => {
      op.optionsList
        .filter((f) => f.selectedTimes ?? 0 > 0)
        .map((e) => {
          const thisItemSelectedTimes = e.selectedTimes ? e.selectedTimes : "0";
          const thisItemCountsAs = e.countsAs ? e.countsAs : "1";
          total += e.priceIncrease
            ? parseFloat(e.priceIncrease) *
              parseFloat(thisItemCountsAs) *
              parseFloat(thisItemSelectedTimes)
            : 0;
        });
    });
    return total;
  };

  const AddToCart = () => {
    const opsArray: string[] = [];
    let stop = false;

    myObjProfile.options.forEach((op) => {
      if (op.optionType === "Dropdown" || op.optionType === "Row") {
        let opWVal = `${op.label}: `;
        const numberOfSelected = op.optionsList.filter(
          (f) => f.selected === true
        ).length;

        if (numberOfSelected > 0) {
          opWVal = `${op.label}: `;

          op.optionsList.map((e, index) => {
            if (e.selected === true) {
              if (index < op.optionsList.length - 1 && numberOfSelected > 1) {
                opWVal += e.label + " , ";
              } else {
                opWVal += e.label;
              }
            }
          });
          opsArray.push(opWVal);
        } else if (numberOfSelected === 0 && op.isRequired === true) {
          alertP.error(
            op.label + " is required. Please fill out to add to cart"
          );
          stop = true;
        }
      } else {
        const selectedItems = op.optionsList.filter(
          (op) => parseFloat(op.selectedTimes ?? "0") > 0
        );
        if (selectedItems.length > 0) {
          let opWVal = `${op.label}:\n`;
          selectedItems.map((e, index) => {
            if (index < selectedItems.length - 1) {
              opWVal += "   " + e.selectedTimes + " X " + e.label + "\n";
            } else {
              opWVal += "   " + e.selectedTimes + " X " + e.label;
            }
          });
          opsArray.push(opWVal);
        }
      }
    });
    if (!stop) {
      const objWTotal = {
        name: myObjProfile.name,
        price: myObjProfile.price,
        description: myObj.description,
        options: myObjProfile.options,
        total: total.toString(),
        extraDetails: extraInput,
        id: myObjProfile.id,
      };

      if (!isEditing) {
        addCartState(
          {
            name: myObjProfile.name,
            price: total.toString(),
            description: myObj.description,
            options: opsArray,
            extraDetails: extraInput,
            editableObj: objWTotal,
            imageUrl: imageUrl ? imageUrl : null,
          },
          cart
        );
      } else {
        const copyCart = structuredClone(cart);
        if (itemIndex === null || itemIndex === undefined) return;
        copyCart[itemIndex] = {
          name: myObjProfile.name,
          price: total.toString(),
          description: myObj.description,
          options: opsArray,
          extraDetails: extraInput,
          editableObj: objWTotal,
          imageUrl: imageUrl ? imageUrl : null,
        };
        setCartState(copyCart);
      }

      goBack();
    }
  };

  return (
    <div style={styles.container}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <div
          style={{
            width: width > 800 ? "95%" : "100%",
            justifyContent: width > 800 ? "center" : "space-between",
            display: "flex",
            flexDirection: width > 800 ? "row" : "column",
            alignItems: "center",
            margin: "auto",
            height: "96%",
          }}
        >
          <div
            style={
              width > 800
                ? styles.productBuilderGroup
                : styles.productBuilderGroupMobile
            }
          >
            <div
              style={{
                ...styles.goBackRow,
                ...(myObj.description && width > 800
                  ? { marginBottom: 35 }
                  : !myObj.description && width > 800 ? { marginBottom: 50 } : {}),
              }}
            >
              <GoBackButton onPress={goBack} />
            </div>
            <div
              style={{
                ...(width > 800 ? styles.groupsContainer : {}),
                ...(myObj.description?.length > 0 ? { marginTop: 50 } : {}),
              }}
            >
              <div style={width > 800 ? styles.leftSideGroup : {}}>
                <div
                  style={{
                    ...styles.itemInfoContainer,
                    ...(width > 800 ? { height: "60%" } : {}),
                  }}
                >
                  {imageUrl && (
                    <ProductImage
                      source={imageUrl}
                      style={{
                        ...styles.itemImg,
                        ...(myObj.description?.length > 0 && {
                          width: 300,
                          height: 150,
                        }),
                        ...(width < 800 && { width: 300, height: 200 }),
                      }}
                      alt={myObj.name}
                    />
                  )}
                  <div style={styles.itemInfoTxtGroup}>
                    <div style={styles.topTxtGroup}>
                      <span style={styles.productName}>{myObj.name}</span>
                      <>
                        {myObj.calorieDetails && (
                          <span style={styles.calorieDetails}>
                            {myObj.calorieDetails}
                          </span>
                        )}
                      </>
                    </div>
                    <>
                      {myObj.description && (
                        <span style={styles.description}>
                          Description: {myObj.description}
                        </span>
                      )}
                    </>
                  </div>
                </div>
                {width > 800 && (
                  <div
                    style={{
                      ...styles.writeNoteContainer,
                      ...(width < 800 ? { marginTop: 15, height: "25%" } : {}),
                    }}
                  >
                    <span style={styles.notesLbl}>Notes:</span>
                    <textarea
                      style={{
                        ...styles.noteInput,
                        border: "none",
                        resize: "none",
                        fontFamily: "inherit",
                      }}
                      placeholder="Write any extra info here..."
                      rows={4}
                      onChange={(e) => setextraInput(e.target.value)}
                      value={extraInput}
                    />
                  </div>
                )}
              </div>
              <div
                style={
                  width > 800
                    ? styles.rightSideGroup
                    : styles.rightSideGroupMobile
                }
              >
                <div
                  style={{
                    overflow: "auto",
                    height: "90%",
                    width: "100%",
                    padding: 20,
                    paddingLeft: 30,
                    paddingRight: 30,
                    boxSizing: "border-box",
                  }}
                  onScroll={(e) => setscrollY((e.target as HTMLDivElement).scrollTop)}
                >
                  {myObjProfile.options.map((option, index) => (
                    <OptionDisplay
                      key={index}
                      e={option}
                      index={index}
                      myObjProfile={myObjProfile}
                      setMyObjProfile={setmyObjProfile}
                      setopenOptions={setopenOptions}
                      openOptions={openOptions}
                      isOnlineOrder={isOnlineOrder}
                      scrollY={scrollY}
                    />
                  ))}
                </div>
                <div style={styles.totalLblRow}>
                  <span style={styles.totalLbl}>
                    Total: ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            {width < 800 && (
              <div
                style={{
                  ...styles.writeNoteContainer,
                  ...(width < 800 ? { marginTop: 15, height: 120 } : {}),
                }}
              >
                <span style={styles.notesLbl}>Notes:</span>
                <textarea
                  style={{
                    ...styles.noteInput,
                    border: "none",
                    resize: "none",
                    fontFamily: "inherit",
                  }}
                  placeholder="Write any extra info here..."
                  rows={4}
                  onChange={(e) => setextraInput(e.target.value)}
                  value={extraInput}
                />
              </div>
            )}
            <div style={styles.addToCartRow}>
              <AddToCartButton
                style={styles.addToCartBtn}
                title={isEditing ? "Save" : "Add To Cart"}
                onPress={AddToCart}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#edf2ff",
    width: "100%",
    height: "100%",
    display: "flex",
  },
  productBuilderGroup: {
    width: "90%",
    height: "85%",
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
  },
  productBuilderGroupMobile: {
    width: "90%",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 40,
    display: "flex",
    flexDirection: "column",
  },
  goBackRow: {
    alignSelf: "stretch",
  },
  goBackBtn: {
    height: 32,
    width: 126,
  },
  groupsContainer: {
    height: "70%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "stretch",
    display: "flex",
  },
  leftSideGroup: {
    width: "35%",
    height: "100%",
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
  },
  itemInfoContainer: {
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,1)",
    alignItems: "center",
    justifyContent: "flex-end",
    alignSelf: "stretch",
    display: "flex",
    flexDirection: "column",
  },
  itemImg: {
    height: 180,
    width: 200,
    objectFit: "contain",
  },
  itemInfoTxtGroup: {
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  topTxtGroup: {
    marginTop: 7,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    flexDirection: "column",
  },
  productName: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 30,
    paddingLeft: "3%",
    paddingRight: "3%",
    textAlign: "center",
    display: "inline-block",
  },
  calorieDetails: {
    color: "rgba(131,126,126,1)",
    marginBottom: 25,
    display: "inline-block",
  },
  description: {
    color: "rgba(131,126,126,1)",
    width: "90%",
    textAlign: "left",
    paddingBottom: 50,
    display: "inline-block",
  },
  writeNoteContainer: {
    height: "35%",
    justifyContent: "space-between",
    alignSelf: "stretch",
    display: "flex",
    flexDirection: "column",
  },
  notesLbl: {
    fontWeight: "700",
    color: "#121212",
    marginBottom: 10,
    display: "inline-block",
  },
  noteInput: {
    width: "100%",
    height: "90%",
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 20,
    padding: 10,
    boxSizing: "border-box",
  },
  noteInputTxt: {
    color: "#90949a",
  },
  rightSideGroup: {
    width: "60%",
    height: "100%",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 10,
    zIndex: 999,
    display: "flex",
    flexDirection: "column",
  },
  rightSideGroupMobile: {
    backgroundColor: "white",
    borderRadius: 10,
    zIndex: 999,
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
  },
  oneTimeSelectableOptionGroup: {
    marginBottom: 20,
    alignSelf: "stretch",
  },
  dropdownSelectableOption: {
    height: 44,
    marginBottom: 20,
    alignSelf: "stretch",
  },
  totalLblRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignSelf: "stretch",
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 20,
    paddingTop: 20,
    display: "flex",
  },
  totalLbl: {
    fontWeight: "700",
    color: "#00c937",
    fontSize: 22,
    marginTop: 0,
  },
  addToCartRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignSelf: "stretch",
    marginTop: 25,
    height: 41,
    display: "flex",
  },
  addToCartBtn: {
    height: 41,
    width: 147,
  },
};

export default ProductBuilderModal;
