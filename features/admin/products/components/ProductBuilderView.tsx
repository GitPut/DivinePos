import React, { useEffect, useState } from "react";
import ItemNoOptionsView from "./ItemNoOptionsView";
import DisplayOption from "features/pos/components/ProductBuilder/OptionDisplay";
import { ProductProp } from "types";
import { resolveOptionPrice } from "utils/resolveOptionPrice";

interface ProductBuilderViewProps {
  product: ProductProp;
  imageUrl: string | null;
}

function ProductBuilderView({ product, imageUrl }: ProductBuilderViewProps) {
  const myObj = product;
  const [myObjProfile, setmyObjProfile] = useState(myObj);
  const [total, settotal] = useState(myObj.total ? myObj.total : myObj.price);
  const [openOptions, setopenOptions] = useState<string | null>(null);

  useEffect(() => {
    setmyObjProfile(product);
  }, [product]);

  useEffect(() => {
    settotal(getPrice().toString());
  }, [myObjProfile]);

  const getPrice = () => {
    let total = parseFloat(myObjProfile.price);
    myObjProfile.options.forEach((op) => {
      op.optionsList
        .filter((f) => f.selected === true)
        .map((e) => {
          const resolved = parseFloat(resolveOptionPrice(e, op, myObjProfile.options));
          total += resolved || 0;
        });
    });
    myObjProfile.options.forEach((op) => {
      op.optionsList
        .filter((f) => f.selectedTimes ?? 0 > 0)
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

  return (
    <div style={styles.container}>
      <div
        style={{ width: "100%", height: "100%", padding: 20, overflow: "auto" }}
      >
        <div style={{ width: "100%" }}>
          <span style={{ fontWeight: "700", color: "#121212", fontSize: 21 }}>
            Preview
          </span>
          {product.options.length > 0 ? (
            <>
              <div style={styles.productBuilderGroup}>
                <div style={styles.itemInfoContainer}>
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt=""
                      style={{
                        ...styles.itemImg,
                        ...(myObj.description ? { width: 300, height: 150 } : {}),
                      }}
                    />
                  )}
                  <div style={styles.itemInfoTxtGroup}>
                    <div style={styles.topTxtGroup}>
                      <span style={styles.productName}>{myObj.name}</span>
                      <>
                        {myObj.calorieDetails && (
                          <span style={styles.calorieDetails}>280 cal/slice</span>
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
                <div
                  style={{
                    width: "100%",
                    padding: 20,
                    paddingLeft: 30,
                    paddingRight: 30,
                    backgroundColor: "white",
                    borderRadius: 10,
                    marginTop: 20,
                  }}
                >
                  <div>
                    {myObjProfile.options.map((option, index) => (
                      <DisplayOption
                        key={option.id}
                        e={option}
                        index={index}
                        myObjProfile={myObjProfile}
                        setMyObjProfile={setmyObjProfile}
                        setopenOptions={setopenOptions}
                        openOptions={openOptions}
                        isOnlineOrder={false}
                        scrollY={0}
                      />
                    ))}
                  </div>
                </div>
                <div style={styles.totalLblRow}>
                  <span style={styles.totalLbl}>
                    Total: ${parseFloat(total).toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <ItemNoOptionsView product={product} />
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#edf2ff",
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  productBuilderGroup: {
    width: "100%",
    height: "85%",
    paddingTop: 20,
  },
  itemInfoContainer: {
    height: 350,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    alignSelf: "stretch",
  },
  itemImg: {
    height: 250,
    width: 250,
    objectFit: "contain",
  },
  itemInfoTxtGroup: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topTxtGroup: {
    marginTop: 7,
    marginBottom: 15,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  productName: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 30,
    paddingLeft: "3%",
    paddingRight: "3%",
    textAlign: "center",
    display: "block",
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
    display: "block",
  },
  totalLblRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignSelf: "stretch",
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 20,
    paddingTop: 20,
  },
  totalLbl: {
    fontWeight: "700",
    color: "#00c937",
    fontSize: 22,
    marginTop: 0,
  },
};

export default ProductBuilderView;
