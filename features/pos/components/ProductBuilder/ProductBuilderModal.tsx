import React, { useEffect, useMemo, useState } from "react";
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
  const [myObjProfile, setMyObjProfile] = useState<ProductProp>(myObj);
  const [total, setTotal] = useState<number>(parseFloat(myObj.price ?? "0"));
  const isEditing = typeof itemIndex === "number";

  const [extraInput, setExtraInput] = useState<string>(
    myObj.extraDetails ? myObj.extraDetails : ""
  );
  const [openOptions, setOpenOptions] = useState<string | null>(null);
  const alertP = useAlert();
  const [scrollY, setScrollY] = useState<number>(0);
  const { width } = useWindowSize();

  useEffect(() => {
    if (product !== null) {
      setMyObjProfile(structuredClone(product));
    }
  }, [product]);

  const goBack = () => {
    resetProductBuilderState();
  };

  const price = useMemo(() => {
    let t = parseFloat(myObjProfile.price);
    myObjProfile.options.forEach((op) => {
      if (op.optionType === "Included Selections") {
        const includedCount = parseFloat(op.includedSelections ?? "0");
        const flatExtraPrice = parseFloat(op.extraSelectionPrice ?? "0");

        let freeRemaining = includedCount;
        op.optionsList
          .filter((item) => parseFloat(item.selectedTimes ?? "0") > 0)
          .forEach((item) => {
            const qty = parseFloat(item.selectedTimes ?? "0");
            const freeFromThis = Math.min(qty, freeRemaining);
            const extraFromThis = qty - freeFromThis;
            freeRemaining -= freeFromThis;
            if (extraFromThis > 0) {
              // Try size-linked price, fall back to flat extra price
              const resolved = op.sizeLinkedOptionLabel
                ? parseFloat(resolveOptionPrice(item, op, myObjProfile.options))
                : 0;
              const perItemPrice = resolved > 0 ? resolved : flatExtraPrice;
              t += extraFromThis * perItemPrice;
            }
          });
        return;
      }
      op.optionsList
        .filter((f) => f.selected === true)
        .map((e) => {
          const resolved = parseFloat(resolveOptionPrice(e, op, myObjProfile.options));
          t += resolved || 0;
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
          t += resolved
            ? parseFloat(resolved) *
              parseFloat(thisItemCountsAs) *
              parseFloat(thisItemSelectedTimes)
            : 0;
        });
    });
    return t;
  }, [myObjProfile]);

  useEffect(() => {
    setTotal(price);
  }, [price]);

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

  const extrasSummary = useMemo(() => {
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
  }, [myObjProfile]);

  const isMobile = width < 800;

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
                setMyObjProfile={setMyObjProfile}
                setOpenOptions={setOpenOptions}
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
              onChange={(e) => setExtraInput(e.target.value)}
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
      {/* Top bar */}
      <div style={styles.topBar}>
        <GoBackButton onPress={goBack} />
      </div>

      {/* Content */}
      <div style={styles.contentRow}>
        {/* Left column - product info */}
        <div style={styles.leftColumn}>
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

          <div style={styles.spacer} />
          <span style={styles.sectionLabel}>Special Instructions</span>
          <textarea
            style={styles.notesInput}
            placeholder="Add any special requests..."
            rows={3}
            onChange={(e) => setExtraInput(e.target.value)}
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
        </div>

        {/* Right column - options */}
        <div style={styles.rightColumn}>
          <div
            style={styles.optionsScrollArea}
            onScroll={(e) => setScrollY((e.target as HTMLDivElement).scrollTop)}
          >
            {myObjProfile.options.map((option, index) => (
              <OptionDisplay
                key={index}
                e={option}
                index={index}
                myObjProfile={myObjProfile}
                setMyObjProfile={setMyObjProfile}
                setOpenOptions={setOpenOptions}
                openOptions={openOptions}
                isOnlineOrder={isOnlineOrder}
                scrollY={scrollY}
              />
            ))}
          </div>
        </div>
      </div>

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
  topBar: {
    padding: "16px 24px",
    flexShrink: 0,
  },
  contentRow: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
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
