import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { getSharedIncludedState } from "utils/sharedIncludedSelections";
import { FiCheck, FiChevronLeft, FiChevronRight } from "react-icons/fi";

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
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const optionsScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  // ─── Page grouping ─────────────────────────────────────────────────────────
  const pages = useMemo(() => {
    const pageMap = new Map<string, number[]>();
    myObjProfile.options.forEach((option, idx) => {
      const pageName = option.page || "";
      if (!pageMap.has(pageName)) {
        pageMap.set(pageName, []);
      }
      pageMap.get(pageName)!.push(idx);
    });
    return Array.from(pageMap.entries()).map(([name, indices]) => ({
      name: name || "Options",
      optionIndices: indices,
    }));
  }, [myObjProfile.options]);

  const isMultiPage = pages.length > 1;
  const currentPage = pages[currentPageIndex] ?? pages[0];
  const isLastPage = currentPageIndex === pages.length - 1;
  const isFirstPage = currentPageIndex === 0;

  const visibleOptionIndices = isMultiPage
    ? currentPage.optionIndices
    : myObjProfile.options.map((_, i) => i);

  // Reset scroll to top when switching pages
  useEffect(() => {
    if (optionsScrollRef.current) optionsScrollRef.current.scrollTop = 0;
    if (mobileScrollRef.current) mobileScrollRef.current.scrollTop = 0;
  }, [currentPageIndex]);

  useEffect(() => {
    if (product !== null) {
      const clone = structuredClone(product);
      clone.options.forEach((op) => {
        if (
          (op.optionType === "Row" || op.optionType === "Dropdown") &&
          op.optionsList.length > 0 &&
          !op.optionsList.some((item) => item.selected === true)
        ) {
          op.optionsList[0].selected = true;
        }
        // Apply default selections for Included Selections / Table View / Quantity Dropdown
        op.optionsList.forEach((item) => {
          if (item.defaultSelectedTimes && parseFloat(item.defaultSelectedTimes) > 0) {
            if (!item.selectedTimes || parseFloat(item.selectedTimes) === 0) {
              item.selectedTimes = item.defaultSelectedTimes;
            }
          }
        });
      });
      setMyObjProfile(clone);
      setCurrentPageIndex(0);
    }
  }, [product]);

  const goBack = () => {
    resetProductBuilderState();
  };

  const price = useMemo(() => {
    let t = parseFloat(myObjProfile.price);
    const processedSharedGroups = new Set<string>();
    myObjProfile.options.forEach((op, opIdx) => {
      if (op.optionType === "Included Selections") {
        // For shared groups, only process the entire group once (on the first option)
        if (op.sharedIncludedGroup) {
          if (processedSharedGroups.has(op.sharedIncludedGroup)) return;
          processedSharedGroups.add(op.sharedIncludedGroup);

          // Get shared pool info from the first option in the group
          const shared = getSharedIncludedState(myObjProfile.options, opIdx);
          if (!shared) return;
          const sharedIncludedCount = shared.sharedIncludedCount;

          // Iterate ALL items across ALL options in this shared group
          let freeRemaining = sharedIncludedCount;
          for (let i = 0; i < myObjProfile.options.length; i++) {
            const groupOp = myObjProfile.options[i];
            if (groupOp.sharedIncludedGroup !== op.sharedIncludedGroup || groupOp.optionType !== "Included Selections") continue;
            const flatExtraPrice = parseFloat(groupOp.extraSelectionPrice ?? "0") || shared.sharedExtraPrice;
            groupOp.optionsList
              .filter((item) => parseFloat(item.selectedTimes ?? "0") > 0)
              .forEach((item) => {
                const countsAs = parseFloat(item.countsAs ?? "1");
                const qty = parseFloat(item.selectedTimes ?? "0") * countsAs;
                const freeFromThis = Math.min(qty, freeRemaining);
                const extraFromThis = qty - freeFromThis;
                freeRemaining -= freeFromThis;
                if (extraFromThis > 0) {
                  const resolved = groupOp.sizeLinkedOptionLabel
                    ? parseFloat(resolveOptionPrice(item, groupOp, myObjProfile.options))
                    : 0;
                  const itemPrice = parseFloat(item.priceIncrease ?? "0");
                  const perItemPrice = resolved > 0 ? resolved : itemPrice > 0 ? itemPrice : flatExtraPrice;
                  t += extraFromThis * perItemPrice;
                }
              });
          }
          return;
        }

        // Non-shared: original logic
        const includedCount = parseFloat(op.includedSelections ?? "0");
        const flatExtraPrice = parseFloat(op.extraSelectionPrice ?? "0");

        let freeRemaining = includedCount;
        op.optionsList
          .filter((item) => parseFloat(item.selectedTimes ?? "0") > 0)
          .forEach((item) => {
            const countsAs = parseFloat(item.countsAs ?? "1");
            const qty = parseFloat(item.selectedTimes ?? "0") * countsAs;
            const freeFromThis = Math.min(qty, freeRemaining);
            const extraFromThis = qty - freeFromThis;
            freeRemaining -= freeFromThis;
            if (extraFromThis > 0) {
              const resolved = op.sizeLinkedOptionLabel
                ? parseFloat(resolveOptionPrice(item, op, myObjProfile.options))
                : 0;
              const itemPrice = parseFloat(item.priceIncrease ?? "0");
              const perItemPrice = resolved > 0 ? resolved : itemPrice > 0 ? itemPrice : flatExtraPrice;
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

  // ─── Per-page validation for Next button ───────────────────────────────────
  const validateCurrentPage = (): boolean => {
    for (const idx of currentPage.optionIndices) {
      const op = myObjProfile.options[idx];
      if (op.isRequired && (op.optionType === "Dropdown" || op.optionType === "Row")) {
        const hasSelection = op.optionsList.some((item) => item.selected === true);
        if (!hasSelection) {
          alertP.error(op.label + " is required. Please fill out before continuing.");
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentPage()) {
      setCurrentPageIndex((prev) => Math.min(prev + 1, pages.length - 1));
    }
  };

  const handlePageBack = () => {
    setCurrentPageIndex((prev) => Math.max(prev - 1, 0));
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

  const extrasSummary = useMemo(() => {
    const extras: string[] = [];
    const processedSharedGroups = new Set<string>();
    myObjProfile.options.forEach((op, opIdx) => {
      if (op.optionType === "Included Selections") {
        if (op.sharedIncludedGroup) {
          if (processedSharedGroups.has(op.sharedIncludedGroup)) return;
          processedSharedGroups.add(op.sharedIncludedGroup);

          const shared = getSharedIncludedState(myObjProfile.options, opIdx);
          if (!shared) return;
          const extraSelections = Math.max(0, shared.sharedTotalUsed - shared.sharedIncludedCount);
          if (extraSelections > 0) {
            // Recalculate cost across the group
            let extraCost = 0;
            let freeRemaining = shared.sharedIncludedCount;
            for (let i = 0; i < myObjProfile.options.length; i++) {
              const groupOp = myObjProfile.options[i];
              if (groupOp.sharedIncludedGroup !== op.sharedIncludedGroup || groupOp.optionType !== "Included Selections") continue;
              const flatExtraPrice = parseFloat(groupOp.extraSelectionPrice ?? "0") || shared.sharedExtraPrice;
              groupOp.optionsList.forEach((item) => {
                const countsAs = parseFloat(item.countsAs ?? "1");
                const qty = parseFloat(item.selectedTimes ?? "0") * countsAs;
                if (qty > 0) {
                  const freeFromThis = Math.min(qty, freeRemaining);
                  const extraFromThis = qty - freeFromThis;
                  freeRemaining -= freeFromThis;
                  if (extraFromThis > 0) {
                    const resolved = groupOp.sizeLinkedOptionLabel
                      ? parseFloat(resolveOptionPrice(item, groupOp, myObjProfile.options))
                      : 0;
                    const itemPrice = parseFloat(item.priceIncrease ?? "0");
                    const perItemPrice = resolved > 0 ? resolved : itemPrice > 0 ? itemPrice : flatExtraPrice;
                    extraCost += extraFromThis * perItemPrice;
                  }
                }
              });
            }
            extras.push(
              `Includes ${extraSelections} extra toppings (+$${extraCost.toFixed(2)})`
            );
          }
          return;
        }

        const includedCount = parseFloat(op.includedSelections ?? "0");
        const flatExtraPrice = parseFloat(op.extraSelectionPrice ?? "0");
        let totalSelected = 0;
        let extraCost = 0;
        let freeRemaining = includedCount;
        op.optionsList.forEach((item) => {
          const countsAs = parseFloat(item.countsAs ?? "1");
          const qty = parseFloat(item.selectedTimes ?? "0") * countsAs;
          totalSelected += qty;
          if (qty > 0) {
            const freeFromThis = Math.min(qty, freeRemaining);
            const extraFromThis = qty - freeFromThis;
            freeRemaining -= freeFromThis;
            if (extraFromThis > 0) {
              const resolved = op.sizeLinkedOptionLabel
                ? parseFloat(resolveOptionPrice(item, op, myObjProfile.options))
                : 0;
              const itemPrice = parseFloat(item.priceIncrease ?? "0");
              const perItemPrice = resolved > 0 ? resolved : itemPrice > 0 ? itemPrice : flatExtraPrice;
              extraCost += extraFromThis * perItemPrice;
            }
          }
        });
        const extraSelections = Math.max(0, totalSelected - includedCount);
        if (extraSelections > 0) {
          extras.push(
            `Includes ${extraSelections} extra ${op.label?.toLowerCase() ?? "selections"} (+$${extraCost.toFixed(2)})`
          );
        }
      }
    });
    return extras;
  }, [myObjProfile]);

  // ─── Stepper ───────────────────────────────────────────────────────────────
  const renderStepper = () => {
    if (!isMultiPage) return null;
    return (
      <div style={styles.stepperContainer}>
        {pages.map((pg, idx) => (
          <React.Fragment key={pg.name + idx}>
            {idx > 0 && (
              <div
                style={{
                  ...styles.stepLine,
                  backgroundColor: idx <= currentPageIndex ? "#1e293b" : "#e2e8f0",
                }}
              />
            )}
            <button
              style={styles.stepItem}
              onClick={() => {
                if (idx < currentPageIndex) setCurrentPageIndex(idx);
              }}
            >
              <div
                style={{
                  ...styles.stepCircle,
                  backgroundColor:
                    idx < currentPageIndex
                      ? "#10b981"
                      : idx === currentPageIndex
                        ? "#1e293b"
                        : "#f1f5f9",
                  color: idx <= currentPageIndex ? "#ffffff" : "#94a3b8",
                }}
              >
                {idx < currentPageIndex ? (
                  <FiCheck size={14} color="#fff" />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                style={{
                  ...styles.stepLabel,
                  color: idx === currentPageIndex ? "#1e293b" : idx < currentPageIndex ? "#10b981" : "#94a3b8",
                  fontWeight: idx === currentPageIndex ? "700" : "500",
                }}
              >
                {pg.name}
              </span>
            </button>
          </React.Fragment>
        ))}
      </div>
    );
  };

  // ─── Options list for current page ─────────────────────────────────────────
  const renderOptions = () =>
    visibleOptionIndices.map((optionIndex) => (
      <OptionDisplay
        key={optionIndex}
        e={myObjProfile.options[optionIndex]}
        index={optionIndex}
        myObjProfile={myObjProfile}
        setMyObjProfile={setMyObjProfile}
        setOpenOptions={setOpenOptions}
        openOptions={openOptions}
        isOnlineOrder={isOnlineOrder}
        scrollY={scrollY}
      />
    ));

  // ─── Bottom navigation ─────────────────────────────────────────────────────
  const renderBottomBar = (isMobileStyle?: boolean) => {
    const barStyle = isMobileStyle ? styles.mobileBottomBar : styles.bottomBar;

    if (!isMultiPage) {
      return (
        <div style={barStyle}>
          <AddToCartButton
            title={isEditing ? "Save" : "Add to Cart"}
            total={total}
            onPress={AddToCart}
          />
        </div>
      );
    }

    return (
      <div style={barStyle}>
        <div style={styles.navRow}>
          {!isFirstPage ? (
            <button style={styles.backBtn} onClick={handlePageBack}>
              <FiChevronLeft size={18} color="#64748b" />
              <span style={styles.backBtnText}>Back</span>
            </button>
          ) : (
            <div />
          )}
          <div style={{ flex: 1 }}>
            {isLastPage ? (
              <AddToCartButton
                title={isEditing ? "Save" : "Add to Cart"}
                total={total}
                onPress={AddToCart}
              />
            ) : (
              <button style={styles.nextBtn} onClick={handleNext}>
                <span style={styles.nextBtnText}>
                  Next: {pages[currentPageIndex + 1]?.name}
                </span>
                <FiChevronRight size={18} color="#fff" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const isMobile = width < 800;

  if (isMobile) {
    return (
      <div style={styles.container}>
        <div ref={mobileScrollRef} style={styles.mobileScrollArea}>
          <div style={styles.mobileTopBar}>
            <GoBackButton onPress={goBack} />
          </div>

          {renderStepper()}

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

          <div style={{ padding: "0 16px" }}>
            {renderOptions()}
          </div>

          {(!isMultiPage || isLastPage) && (
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
          )}

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

        {renderBottomBar(true)}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <GoBackButton onPress={goBack} />
      </div>

      {isMultiPage && (
        <div style={styles.stepperRow}>
          <div style={{ width: 240, flexShrink: 0 }} />
          {renderStepper()}
        </div>
      )}

      <div style={styles.contentRow}>
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

        <div style={styles.rightColumn}>
          <div
            ref={optionsScrollRef}
            style={styles.optionsScrollArea}
            onScroll={(e) => setScrollY((e.target as HTMLDivElement).scrollTop)}
          >
            {renderOptions()}
          </div>
        </div>
      </div>

      {renderBottomBar()}
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

  // ─── Stepper styles ──────────────────────────────────────────────────────
  stepperRow: {
    display: "flex",
    flexDirection: "row",
    padding: "0 24px",
    gap: 24,
    flexShrink: 0,
  },
  stepperContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: "8px 0 12px",
    gap: 0,
    flexShrink: 0,
    overflowX: "auto",
  },
  stepItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    minWidth: 80,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px 12px",
  },
  stepCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    fontWeight: "700",
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center" as const,
    maxWidth: 110,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  stepLine: {
    height: 2,
    flex: 1,
    minWidth: 24,
    maxWidth: 60,
    borderRadius: 1,
  },

  // ─── Navigation styles ───────────────────────────────────────────────────
  navRow: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  backBtn: {
    height: 50,
    paddingLeft: 16,
    paddingRight: 20,
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    cursor: "pointer",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    flexShrink: 0,
  },
  backBtnText: {
    fontWeight: "600",
    color: "#64748b",
    fontSize: 15,
  },
  nextBtn: {
    width: "100%",
    height: 50,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  nextBtnText: {
    fontWeight: "700",
    color: "#ffffff",
    fontSize: 16,
    letterSpacing: 0.3,
  },
};

export default ProductBuilderModal;
