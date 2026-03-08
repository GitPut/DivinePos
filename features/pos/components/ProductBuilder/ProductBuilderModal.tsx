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
import { resolveOptionPrice } from "utils/resolveOptionPrice";

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
      if (op.optionType === "Included Selections") {
        const includedCount = parseFloat(op.includedSelections ?? "0");
        const extraPrice = parseFloat(op.extraSelectionPrice ?? "0");
        let totalSelected = 0;
        op.optionsList.forEach((item) => {
          totalSelected += parseFloat(item.selectedTimes ?? "0");
        });
        const extraSelections = Math.max(0, totalSelected - includedCount);
        total += extraSelections * extraPrice;
        return;
      }
      op.optionsList
        .filter((f) => f.selected === true)
        .map((e) => {
          const resolved = parseFloat(resolveOptionPrice(e, op, myObjProfile.options));
          total += resolved || 0;
        });
    });
    myObjProfile.options.forEach((op) => {
      if (op.optionType === "Included Selections") return;
      op.optionsList
        .filter((f) => f.selectedTimes ?? 0 > 0)
        .map((e) => {
          const thisItemSelectedTimes = e.selectedTimes ? e.selectedTimes : "0";
          const thisItemCountsAs = e.countsAs ? e.countsAs : "1";
          const resolved = resolveOptionPrice(e, op, myObjProfile.options);
          total += resolved
            ? parseFloat(resolved) *
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
            const sideLabel =
              e.halfSide === "left"
                ? " (Left)"
                : e.halfSide === "right"
                  ? " (Right)"
                  : e.halfSide === "whole"
                    ? " (Whole)"
                    : "";
            if (index < selectedItems.length - 1) {
              opWVal += "   " + e.selectedTimes + " X " + e.label + sideLabel + "\n";
            } else {
              opWVal += "   " + e.selectedTimes + " X " + e.label + sideLabel;
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

  // Extra pricing summary for included selections
  const getIncludedExtrasSummary = () => {
    const extras: string[] = [];
    myObjProfile.options.forEach((op) => {
      if (op.optionType === "Included Selections") {
        const includedCount = parseFloat(op.includedSelections ?? "0");
        const extraPrice = parseFloat(op.extraSelectionPrice ?? "0");
        let totalSelected = 0;
        op.optionsList.forEach((item) => {
          totalSelected += parseFloat(item.selectedTimes ?? "0");
        });
        const extraSelections = Math.max(0, totalSelected - includedCount);
        if (extraSelections > 0) {
          extras.push(
            `Includes ${extraSelections} extra ${op.label?.toLowerCase() ?? "selections"} (+$${(extraSelections * extraPrice).toFixed(2)})`
          );
        }
      }
    });
    return extras;
  };

  const isMobile = width < 800;
  const extrasSummary = getIncludedExtrasSummary();

  if (isMobile) {
    return (
      <div style={styles.container}>
        {/* Mobile: single scroll layout */}
        <div style={styles.mobileScrollArea}>
          {/* Back button */}
          <div style={styles.mobileTopBar}>
            <GoBackButton onPress={goBack} />
          </div>

          {/* Product info */}
          {imageUrl && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <ProductImage
                source={imageUrl}
                style={styles.mobileProductImg}
                alt={myObj.name}
              />
            </div>
          )}
          <div style={{ padding: "0 16px" }}>
            <span style={styles.productName}>{myObj.name}</span>
            {myObj.calorieDetails && (
              <span style={styles.calorieDetails}>{myObj.calorieDetails}</span>
            )}
            {myObj.description && (
              <span style={styles.description}>{myObj.description}</span>
            )}
            <span style={styles.price}>${parseFloat(myObj.price).toFixed(2)}</span>
          </div>

          {/* Options inline */}
          <div style={{ padding: "0 16px" }}>
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

          {/* Notes */}
          <div style={{ padding: "0 16px", marginTop: 16 }}>
            <span style={styles.sectionLabel}>Special Instructions</span>
            <textarea
              style={styles.notesInput}
              placeholder="Add any special requests..."
              rows={2}
              onChange={(e) => setextraInput(e.target.value)}
              value={extraInput}
            />
          </div>

          {/* Item total */}
          <div style={{ padding: "12px 16px 16px" }}>
            <div style={styles.itemTotalCard}>
              <span style={styles.itemTotalLabel}>Item Total</span>
              <span style={styles.itemTotalPrice}>${total.toFixed(2)}</span>
              {extrasSummary.map((line, i) => (
                <span key={i} style={styles.itemTotalExtras}>{line}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky bottom button */}
        <div style={styles.mobileBottomBar}>
          <AddToCartButton
            title={isEditing ? "Save" : "Add to Cart"}
            total={total}
            onPress={AddToCart}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.desktopScrollWrapper}>
        <div style={styles.desktopInner}>
          <div style={styles.productBuilderGroup}>
            <div
              style={{
                ...styles.goBackRow,
                ...(myObj.description
                  ? { marginBottom: 35 }
                  : { marginBottom: 50 }),
              }}
            >
              <GoBackButton onPress={goBack} />
            </div>
            <div
              style={{
                ...styles.groupsContainer,
                ...(myObj.description?.length > 0 ? { marginTop: 50 } : {}),
              }}
            >
              {/* Left side - product info + notes */}
              <div style={styles.leftSideGroup}>
                <div
                  style={{
                    ...styles.itemInfoContainer,
                    height: "60%",
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
                      }}
                      alt={myObj.name}
                    />
                  )}
                  <div style={styles.itemInfoTxtGroup}>
                    <div style={styles.topTxtGroup}>
                      <span style={styles.productName}>{myObj.name}</span>
                      {myObj.calorieDetails && (
                        <span style={styles.calorieDetails}>
                          {myObj.calorieDetails}
                        </span>
                      )}
                    </div>
                    {myObj.description && (
                      <span style={styles.description}>
                        Description: {myObj.description}
                      </span>
                    )}
                  </div>
                </div>
                <div style={styles.writeNoteContainer}>
                  <span style={styles.notesLbl}>Notes:</span>
                  <textarea
                    style={styles.noteInput}
                    placeholder="Write any extra info here..."
                    rows={4}
                    onChange={(e) => setextraInput(e.target.value)}
                    value={extraInput}
                  />
                </div>
              </div>

              {/* Right side - options */}
              <div style={styles.rightSideGroup}>
                <div
                  style={styles.optionsScrollArea}
                  onScroll={(e) =>
                    setscrollY((e.target as HTMLDivElement).scrollTop)
                  }
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
            <div style={styles.addToCartRow}>
              <AddToCartButton
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
  // Mobile styles
  mobileScrollArea: {
    flex: 1,
    overflowY: "auto",
    WebkitOverflowScrolling: "touch" as any,
  },
  mobileTopBar: {
    padding: "12px 16px",
    flexShrink: 0,
  },
  mobileProductImg: {
    width: 160,
    height: 160,
    objectFit: "contain",
    borderRadius: 12,
  },
  mobileBottomBar: {
    padding: "12px 16px",
    flexShrink: 0,
    backgroundColor: "#f8f9fc",
    borderTop: "1px solid #e2e8f0",
  },
  // Desktop styles
  desktopScrollWrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    overflowY: "auto",
    overflowX: "hidden",
  },
  desktopInner: {
    width: "95%",
    justifyContent: "center",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    margin: "auto",
    height: "96%",
  },
  productBuilderGroup: {
    width: "90%",
    height: "85%",
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
  },
  goBackRow: {
    alignSelf: "stretch",
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
    objectFit: "contain" as const,
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
  price: {
    fontWeight: "700",
    color: "#1e293b",
    fontSize: 18,
    marginBottom: 8,
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
    boxSizing: "border-box" as const,
    border: "none",
    resize: "none" as const,
    fontFamily: "inherit",
  },
  sectionLabel: {
    fontWeight: "600",
    color: "#1a1a1a",
    fontSize: 14,
    marginBottom: 8,
    display: "inline-block",
  },
  notesInput: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    padding: 12,
    boxSizing: "border-box" as const,
    resize: "none" as const,
    fontFamily: "inherit",
    fontSize: 13,
    color: "#1a1a1a",
    outline: "none",
  },
  itemTotalCard: {
    width: "100%",
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 16,
    boxSizing: "border-box" as const,
    display: "flex",
    flexDirection: "column",
  },
  itemTotalLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  itemTotalPrice: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
  },
  itemTotalExtras: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 6,
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
  optionsScrollArea: {
    overflow: "auto",
    height: "90%",
    width: "100%",
    padding: 20,
    paddingLeft: 30,
    paddingRight: 30,
    boxSizing: "border-box" as const,
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
};

export default ProductBuilderModal;
