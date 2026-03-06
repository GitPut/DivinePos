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
        .map(
          (e) =>
            (total += parseFloat(e.priceIncrease ?? "0")
              ? parseFloat(e.priceIncrease ?? "0")
              : 0)
        );
    });
    myObjProfile.options.forEach((op) => {
      if (op.optionType === "Included Selections") return;
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

  return (
    <div style={styles.container}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <GoBackButton onPress={goBack} />
      </div>

      {/* Content */}
      <div style={{
        ...styles.contentRow,
        flexDirection: isMobile ? "column" : "row",
      }}>
        {/* Left column - product info */}
        <div style={{
          ...styles.leftColumn,
          ...(isMobile ? { width: "100%", marginBottom: 20 } : {}),
        }}>
          {imageUrl && (
            <ProductImage
              source={imageUrl}
              style={styles.productImg}
              alt={myObj.name}
            />
          )}
          <span style={styles.productName}>{myObj.name}</span>
          {myObj.calorieDetails && (
            <span style={styles.calorieDetails}>{myObj.calorieDetails}</span>
          )}
          {myObj.description && (
            <span style={styles.description}>{myObj.description}</span>
          )}
          <span style={styles.price}>${parseFloat(myObj.price).toFixed(2)}</span>

          {!isMobile && (
            <>
              <div style={styles.spacer} />
              <span style={styles.sectionLabel}>Special Instructions</span>
              <textarea
                style={styles.notesInput}
                placeholder="Add any special requests..."
                rows={3}
                onChange={(e) => setextraInput(e.target.value)}
                value={extraInput}
              />

              <div style={styles.spacer} />
              <div style={styles.itemTotalCard}>
                <span style={styles.itemTotalLabel}>Item Total</span>
                <span style={styles.itemTotalPrice}>${total.toFixed(2)}</span>
                {extrasSummary.map((line, i) => (
                  <span key={i} style={styles.itemTotalExtras}>{line}</span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right column - options */}
        <div style={{
          ...styles.rightColumn,
          ...(isMobile ? { width: "100%" } : {}),
        }}>
          <div
            style={styles.optionsScrollArea}
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
        </div>
      </div>

      {/* Mobile notes + total */}
      {isMobile && (
        <div style={{ padding: "0 20px", width: "100%", boxSizing: "border-box" }}>
          <span style={styles.sectionLabel}>Special Instructions</span>
          <textarea
            style={styles.notesInput}
            placeholder="Add any special requests..."
            rows={3}
            onChange={(e) => setextraInput(e.target.value)}
            value={extraInput}
          />
          <div style={{ ...styles.itemTotalCard, marginTop: 16 }}>
            <span style={styles.itemTotalLabel}>Item Total</span>
            <span style={styles.itemTotalPrice}>${total.toFixed(2)}</span>
            {extrasSummary.map((line, i) => (
              <span key={i} style={styles.itemTotalExtras}>{line}</span>
            ))}
          </div>
        </div>
      )}

      {/* Bottom button */}
      <div style={styles.bottomBar}>
        <AddToCartButton
          title={isEditing ? "Save" : "Add to Cart"}
          total={total}
          onPress={AddToCart}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f8f9fc",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  topBar: {
    padding: "16px 24px",
    flexShrink: 0,
  },
  contentRow: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
    padding: "0 24px",
    gap: 24,
  },
  leftColumn: {
    width: 240,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    overflowY: "auto",
    paddingBottom: 20,
  },
  productImg: {
    width: 140,
    height: 140,
    objectFit: "contain",
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 16,
  },
  productName: {
    fontWeight: "700",
    color: "#1a1a1a",
    fontSize: 22,
    marginBottom: 4,
  },
  calorieDetails: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 4,
  },
  description: {
    color: "#64748b",
    fontSize: 13,
    lineHeight: "1.4",
    marginBottom: 8,
  },
  price: {
    fontWeight: "700",
    color: "#1e293b",
    fontSize: 18,
    marginBottom: 8,
  },
  spacer: {
    height: 16,
    width: "100%",
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
    boxSizing: "border-box",
    resize: "none",
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
    boxSizing: "border-box",
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
  rightColumn: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minHeight: 0,
  },
  optionsScrollArea: {
    flex: 1,
    overflow: "auto",
    padding: 24,
  },
  bottomBar: {
    padding: "16px 24px",
    flexShrink: 0,
  },
};

export default ProductBuilderModal;
