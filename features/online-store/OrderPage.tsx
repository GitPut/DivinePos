import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "services/firebase/config";
import { useHistory } from "react-router-dom";
import OnlineOrderHome from "./pages/StoreFront";
import OrderCartMain from "./pages/Order";
import OnlineOrderHomeCompleted from "./pages/Completed";
import OnlineOrderHomePickup from "./pages/Pickup";
import OnlineOrderHomeDelivery from "./pages/Delivery";
import OnlineOrderHomeCheckout from "./pages/Checkout";
import {
  orderDetailsState,
  setProductBuilderState,
  setStoreDetailsState,
} from "store/appState";
import { ProductProp, UserStoreStateProps } from "types";
import useWindowSize from "shared/hooks/useWindowSize";
import plantImg from "assets/images/image_JqcD..png";
import wingsImg from "assets/images/image_BSgk..png";
import sideWingsImg from "assets/images/sidewings.png";
import pizzaImg from "assets/images/image_DrUG..png";

const OrderPage = () => {
  const history = useHistory();
  const { urlEnding }: { urlEnding: string } = useParams();
  const [catalog, setcatalog] = useState<UserStoreStateProps>({
    categories: [],
    products: [],
  });
  const orderDetails = orderDetailsState.use();
  const page = orderDetails.page;
  const [fadeVisible, setFadeVisible] = useState(true);
  const [loaderHidden, setLoaderHidden] = useState(false);
  const [data, setdata] = useState<ProductProp[]>([]);
  const { width: screenWidth } = useWindowSize();

  const customSort = (a: ProductProp, b: ProductProp) => {
    const rankA = parseFloat(a.rank ?? "0") || Number.MAX_SAFE_INTEGER;
    const rankB = parseFloat(b.rank ?? "0") || Number.MAX_SAFE_INTEGER;

    return rankA - rankB;
  };

  useEffect(() => {
    db.collection("public")
      .where("urlEnding", "==", urlEnding.toLowerCase())
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          history.push("/404");
          return;
        }

        if (!querySnapshot.docs[0].data().onlineStoreActive) {
          history.push("/404");
          return;
        }

        const publicDoc = querySnapshot.docs[0];

        setProductBuilderState({
          product: null,
          itemIndex: null,
          imageUrl: "",
          isOnlineOrder: true,
          isOpen: false,
        });

        setStoreDetailsState({
          ...publicDoc.data().storeDetails,
          docID: publicDoc.id,
          stripePublicKey: publicDoc.data().stripePublicKey,
        });

        publicDoc.ref
          .collection("products")
          .get()
          .then((docs) => {
            const products: ProductProp[] = [];
            if (!docs.empty) {
              docs.forEach((element) => {
                const productData = element.data();
                products.push({
                  ...productData,
                  name: productData.name,
                  price: productData.price,
                  description: productData.description,
                  options: productData.options,
                  id: productData.id,
                });
              });
            }

            const sorted = products.sort(customSort);
            const grouped: ProductProp[] = [];
            sorted.forEach((product, index) => {
              const lastIndex = grouped.reduce(
                (acc, item, i) => (item.category === product.category ? i : acc),
                -1
              );
              if (lastIndex >= 0) {
                grouped.splice(lastIndex + 1, 0, { ...product, index: index + 1 });
              } else {
                grouped.push({ ...product, index: index + 1 });
              }
            });
            setdata(grouped);

            setcatalog({
              categories: publicDoc.data().categories ?? [],
              products: products,
              docID: publicDoc.id,
            });

            fadeOut();
          });
      });
  }, []);

  const fadeOut = () => {
    setFadeVisible(false);
    setTimeout(() => {
      setLoaderHidden(true);
    }, 500);
  };

  return (
    <div style={styles.outerContainer}>
      {/* Background images for storefront/pickup/delivery/checkout/completed pages */}
      <div style={styles.backgroundContainer}>
        <div style={styles.plantImgContainer}>
          <img
            src={plantImg}
            style={{
              ...styles.plantImg,
              ...(screenWidth < 1000 ? { width: 100 } : {}),
            }}
            alt=""
          />
          <div style={styles.wingImgContainer}>
            <img
              src={
                screenWidth > 1000
                  ? wingsImg
                  : sideWingsImg
              }
              style={{
                ...styles.wingImg,
                ...(screenWidth < 1000
                  ? {
                      width: 200,
                      position: "absolute" as const,
                      right: 0,
                      bottom: "15%",
                    }
                  : {}),
              }}
              alt=""
            />
            <div style={styles.pizzaImgContainer}>
              <img
                src={pizzaImg}
                style={{
                  ...styles.pizzaImg,
                  ...(screenWidth < 1000
                    ? {
                        height: 350,
                        width: 200,
                        right: 0,
                        top: 0,
                        position: "absolute" as const,
                      }
                    : {}),
                }}
                alt=""
              />
            </div>
          </div>
        </div>
      </div>

      {/* Order page (menu browsing) */}
      <div
        style={{
          flex: 1,
          position: "absolute",
          height: "100%",
          width: "100%",
          top: 0,
          left: 0,
          display: page === 4 ? undefined : "none",
        }}
      >
        <OrderCartMain
          catalog={{ categories: catalog.categories, products: data }}
        />
      </div>

      {/* Other pages rendered over the background */}
      {(page === 1 || page === 2 || page === 3 || page === 5 || page === 6) && (
        <div
          style={{
            flex: 1,
            position: "absolute",
            height: "100%",
            width: "100%",
            top: 0,
            left: 0,
          }}
        >
          {page === 2 && <OnlineOrderHomePickup />}
          {page === 3 && <OnlineOrderHomeDelivery />}
          {page === 5 && <OnlineOrderHomeCheckout />}
          {page === 6 && <OnlineOrderHomeCompleted />}
          {page === 1 && <OnlineOrderHome />}
        </div>
      )}

      {/* Loading overlay */}
      {!loaderHidden && (
        <div style={styles.loaderOverlay}>
          <div
            style={{
              ...styles.loaderInner,
              opacity: fadeVisible ? 1 : 0,
            }}
          >
            <div style={styles.spinner} />
            <span style={styles.loaderText}>Loading store...</span>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  outerContainer: {
    flex: 1,
    height: "100%",
    width: "100%",
    backgroundColor: "#f8fafc",
    display: "flex",
    flexDirection: "column",
  },
  backgroundContainer: {
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0)",
  },
  plantImgContainer: {
    alignItems: "flex-start",
    justifyContent: "flex-end",
    height: "100%",
    width: "100%",
    display: "flex",
  },
  plantImg: {
    height: 520,
    width: 200,
    objectFit: "contain",
  },
  wingImgContainer: {
    top: 0,
    left: 0,
    position: "absolute",
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "flex-end",
    display: "flex",
  },
  wingImg: {
    height: 200,
    width: "50%",
    objectFit: "contain",
  },
  pizzaImgContainer: {
    top: 0,
    left: 0,
    position: "absolute",
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    display: "flex",
  },
  pizzaImg: {
    height: 1000,
    width: 401,
    objectFit: "contain",
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  loaderInner: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    position: "absolute",
    transition: "opacity 0.5s",
    height: "100%",
    width: "100%",
    display: "flex",
    gap: 16,
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid #e2e8f0",
    borderTopColor: "#1D294E",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loaderText: {
    fontSize: 15,
    color: "#64748b",
    fontWeight: "500",
  },
};

export default OrderPage;
