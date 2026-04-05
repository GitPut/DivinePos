import React, { useEffect, useState } from "react";
import ItemNoOptionsView from "./ItemNoOptionsView";
import DisplayOption from "features/pos/components/ProductBuilder/OptionDisplay";
import { ProductProp } from "types";
import { resolveOptionPrice } from "utils/resolveOptionPrice";
import { FiEye } from "react-icons/fi";

interface ProductBuilderViewProps {
  product: ProductProp;
  imageUrl: string | null;
}

function ProductBuilderView({ product, imageUrl }: ProductBuilderViewProps) {
  const myObj = product;
  const [myObjProfile, setMyObjProfile] = useState(myObj);
  const [total, setTotal] = useState(myObj.total ? myObj.total : myObj.price);
  const [openOptions, setOpenOptions] = useState<string | null>(null);

  useEffect(() => {
    const clone = structuredClone(product);
    // Auto-select first choice for single-select options (Row/Dropdown)
    // so the preview reflects the starting price even before interaction
    clone.options.forEach((op: any) => {
      if (
        (op.optionType === "Row" || op.optionType === "Dropdown") &&
        op.optionsList.length > 0 &&
        !op.optionsList.some((item: any) => item.selected === true)
      ) {
        op.optionsList[0].selected = true;
      }
      // Apply default selections for Included Selections / Table View / Quantity Dropdown
      op.optionsList.forEach((item: any) => {
        if (item.defaultSelectedTimes && parseFloat(item.defaultSelectedTimes) > 0) {
          if (!item.selectedTimes || parseFloat(item.selectedTimes) === 0) {
            item.selectedTimes = item.defaultSelectedTimes;
          }
        }
      });
    });
    setMyObjProfile(clone);
  }, [product]);

  useEffect(() => {
    setTotal(getPrice().toString());
  }, [myObjProfile]);

  const getPrice = () => {
    let total = parseFloat(myObjProfile.price) || 0;
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
              const resolved = op.sizeLinkedOptionLabel
                ? parseFloat(resolveOptionPrice(item, op, myObjProfile.options))
                : 0;
              const itemPrice = parseFloat(item.priceIncrease ?? "0");
              const perItemPrice = resolved > 0 ? resolved : itemPrice > 0 ? itemPrice : flatExtraPrice;
              total += extraFromThis * perItemPrice;
            }
          });
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
        .filter((f) => parseFloat(f.selectedTimes ?? "0") > 0)
        .map((e) => {
          const thisItemSelectedTimes = e.selectedTimes
            ? parseInt(e.selectedTimes)
            : 0;
          const thisItemCountsAs = e.countsAs ? parseInt(e.countsAs) : 1;
          const resolved = resolveOptionPrice(e, op, myObjProfile.options);
          total += resolved
            ? parseFloat(resolved) *
              thisItemCountsAs *
              thisItemSelectedTimes
            : 0;
        });
    });
    return total;
  };

  const hasOptions = product.options.length > 0;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <FiEye size={16} color="#64748b" />
        <span style={styles.headerTitle}>Live Preview</span>
      </div>

      {/* Preview Content */}
      <div style={styles.scrollArea}>
        {hasOptions ? (
          <div style={styles.previewCard}>
            {/* Product Info */}
            <div style={styles.productInfo}>
              {imageUrl && (
                <img src={imageUrl} alt="" style={styles.productImage} />
              )}
              <div style={styles.productMeta}>
                <span style={styles.productName}>
                  {myObj.name || "Product Name"}
                </span>
                {myObj.description && (
                  <span style={styles.productDesc}>{myObj.description}</span>
                )}
                <span style={styles.basePrice}>
                  ${parseFloat(myObj.price || "0").toFixed(2)}
                </span>
              </div>
            </div>

            {/* Options */}
            <div style={styles.optionsArea}>
              {myObjProfile.options.map((option, index) => (
                <DisplayOption
                  key={option.id}
                  e={option}
                  index={index}
                  myObjProfile={myObjProfile}
                  setMyObjProfile={setMyObjProfile}
                  setOpenOptions={setOpenOptions}
                  openOptions={openOptions}
                  isOnlineOrder={false}
                  scrollY={0}
                />
              ))}
            </div>

            {/* Total */}
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total</span>
              <span style={styles.totalAmount}>
                ${(parseFloat(total) || 0).toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <ItemNoOptionsView product={product} imageUrl={imageUrl} />
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    overflow: "hidden",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: "16px 24px",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  scrollArea: {
    flex: 1,
    overflow: "auto",
    padding: 20,
  },
  previewCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  productInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 20px 16px",
    borderBottom: "1px solid #f1f5f9",
    gap: 12,
  },
  productImage: {
    width: "100%",
    maxWidth: 240,
    height: 160,
    objectFit: "contain" as const,
    borderRadius: 10,
  },
  productMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    width: "100%",
  },
  productName: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 20,
    textAlign: "center" as const,
  },
  productDesc: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center" as const,
    maxWidth: "90%",
  },
  basePrice: {
    fontWeight: "600",
    color: "#64748b",
    fontSize: 16,
    marginTop: 4,
  },
  optionsArea: {
    padding: "16px 20px",
  },
  totalRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderTop: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
  },
  totalLabel: {
    fontWeight: "600",
    color: "#64748b",
    fontSize: 15,
  },
  totalAmount: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 20,
  },
};

export default ProductBuilderView;
