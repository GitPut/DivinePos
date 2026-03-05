import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import productTemplates from "../components/productTemplates";
import ProductOptionBox from "../components/ProductOptionBox";
import { ProductProp } from "types";
import useWindowSize from "shared/hooks/useWindowSize";

interface ProductTemplatesModalProps {
  setproductTemplatesModalVisible: (val: boolean) => void;
  setexistingProduct: (val: ProductProp) => void;
  setisProductTemplate: (val: boolean) => void;
}

function ProductTemplatesModal({
  setproductTemplatesModalVisible,
  setexistingProduct,
  setisProductTemplate,
}: ProductTemplatesModalProps) {
  const { width, height } = useWindowSize();
  const catalog = productTemplates;
  const [selectedCategory, setselectedCategory] = useState<string | null>();

  useEffect(() => {
    catalog.products.map((product) => {
      if (product.category === selectedCategory) {
        const getItem = document.getElementById(product.id);
        if (getItem) {
          getItem.style.display = "flex";
        }
      } else if (!selectedCategory) {
        const getItem = document.getElementById(product.id);
        if (getItem) {
          getItem.style.display = "flex";
        }
      } else {
        const getItem = document.getElementById(product.id);
        if (getItem) {
          getItem.style.display = "none";
        }
      }
    });
  }, [selectedCategory]);

  return (
    <button
      onClick={() => {
        setproductTemplatesModalVisible(false);
        setisProductTemplate(false);
      }}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: height,
        width: width,
        border: "none",
        background: "none",
        cursor: "default",
        padding: 0,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: "default" }}
      >
        <div
          style={{
            ...styles.container,
            height: height * 0.9,
            width: width * 0.7,
            padding: 20,
          }}
        >
          <div style={styles.topRow}>
            <span style={styles.productManagementTxt}>
              Product Management
            </span>
            <button
              style={styles.templateBtn}
              onClick={() => {
                setproductTemplatesModalVisible(false);
                setisProductTemplate(false);
              }}
            >
              <IoClose style={styles.chevronDownIcon} />
            </button>
          </div>
          <div style={styles.categoriesScrollView}>
            <div
              style={styles.categoriesScrollView_contentContainerStyle}
            >
              {catalog.categories.map((category, index) => (
                <button
                  key={index}
                  style={{
                    marginRight: 35,
                    ...(selectedCategory === category
                      ? { borderBottom: "2px solid black" }
                      : { borderBottom: "2px solid grey" }),
                    background: "none",
                    border: "none",
                    borderBottomStyle: "solid",
                    borderBottomWidth: 2,
                    borderBottomColor:
                      selectedCategory === category ? "black" : "grey",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  onClick={() =>
                    setselectedCategory((prev) =>
                      prev === category ? null : category ?? null
                    )
                  }
                >
                  <span
                    style={{
                      ...styles.categoryOpt1Txt,
                      color:
                        selectedCategory === category ? "black" : "grey",
                    }}
                  >
                    {category}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div style={styles.scrollArea}>
            <div
              style={{
                ...styles.scrollArea_contentContainerStyle,
                overflow: "auto",
                height: "100%",
              }}
            >
              <div style={styles.productsMap}>
                {catalog.products.map((product, index) => {
                  const newProduct: ProductProp = {
                    ...product,
                    isTemplate: true,
                    id: Math.random().toString(36).substr(2, 9),
                    name: product.name,
                    price: product.price,
                    options: product.options ?? [],
                    description: product.description,
                  };

                  return (
                    <div key={index} id={product.id}>
                      <ProductOptionBox
                        style={styles.productOptionBox}
                        product={newProduct}
                        setexistingProduct={(val) => {
                          setexistingProduct(val);
                          setisProductTemplate(true);
                          setproductTemplatesModalVisible(false);
                        }}
                        isTemplate={true}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    border: "1px solid #e6e6e6",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-around",
  },
  topRow: {
    width: "95%",
    height: 49,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productManagementTxt: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 16,
  },
  templateBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#1c294e",
    borderRadius: 20,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  chevronDownIcon: {
    color: "rgba(255,255,255,1)",
    fontSize: 30,
  },
  categoriesScrollView: {
    width: "85%",
    marginBottom: 30,
    overflow: "auto",
  },
  categoriesScrollView_contentContainerStyle: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
  },
  categoryOpt1Txt: {
    color: "grey",
    padding: 10,
    display: "inline-block",
  },
  scrollArea: {
    flex: 1,
    width: "95%",
    overflow: "hidden",
  },
  scrollArea_contentContainerStyle: {
    flexGrow: 1,
    display: "flex",
    justifyContent: "flex-start",
  },
  productsMap: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productOptionBox: {
    height: 285,
    width: 215,
    marginLeft: 0,
    marginBottom: 30,
    marginRight: 30,
  },
};

export default ProductTemplatesModal;
