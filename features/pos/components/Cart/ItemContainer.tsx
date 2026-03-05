import React from "react";
import { addCartState, cartState, setProductBuilderState } from "store/appState";
import ProductImage from "shared/components/ui/ProductImage";
import { FiPlus } from "react-icons/fi";
import { ProductProp } from "types";

interface ItemContainerProps {
  product: ProductProp;
  onLayout?: () => void;
  width: number;
}

function ItemContainer({ product, onLayout, width }: ItemContainerProps) {
  const cart = cartState.use();

  return (
    <div id={product.id} style={{ visibility: "hidden", position: "absolute", height: 0, overflow: "hidden", pointerEvents: "none" }}>
      <button
        onClick={() => {
          if (product.options.length > 0) {
            setProductBuilderState({
              product: product,
              itemIndex: null,
              imageUrl: product.imageUrl ? product.imageUrl : null,
              isOpen: true,
            });
          } else {
            addCartState(
              {
                name: product.name,
                price: product.price,
                description: product.description,
                options: [],
                extraDetails: null,
                imageUrl: product.imageUrl ? product.imageUrl : null,
              },
              cart
            );
          }
        }}
        style={width > 1250 ? styles.container : styles.containerMobile}
      >
        {product.hasImage && product.imageUrl && (
          <ProductImage
            key={product.id}
            source={product.imageUrl}
            style={width < 1250 ? styles.itemImgSmall : styles.itemImg}
            alt={product.name}
          />
        )}
        <div style={styles.rightSide}>
          <span style={styles.familyCombo}>{product.name}</span>
          <div
            style={{
              width: "90%",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: 10,
              paddingTop: 10,
              marginBottom: 20,
              display: "flex",
            }}
          >
            <span style={styles.price}>${product.price}</span>
            <div style={styles.openBtn}>
              <FiPlus size={30} color="rgba(0,0,0,1)" />
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 160,
    width: "100%",
    paddingLeft: 10,
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  containerMobile: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    height: 240,
    width: "100%",
    paddingLeft: 10,
    paddingTop: 10,
    display: "flex",
    flexDirection: "column",
    border: "none",
    cursor: "pointer",
  },
  itemImg: {
    height: 133,
    width: 117,
  },
  itemImgSmall: {
    height: 100,
    width: 117,
  },
  rightSide: {
    flex: 1,
    justifyContent: "space-between",
    marginTop: 14,
    alignSelf: "stretch",
    height: 150,
    display: "flex",
    flexDirection: "column",
  },
  familyCombo: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 18,
    alignSelf: "stretch",
    width: "90%",
    display: "inline-block",
  },
  price: {
    fontWeight: "700",
    color: "#00c93b",
    fontSize: 18,
  },
  openBtn: {
    width: 35,
    height: 35,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 100,
    boxShadow: "3px 3px 10px rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
};

export default ItemContainer;
