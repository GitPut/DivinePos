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
  setOnlineStoreState,
} from "store/appState";
import { ProductProp, UserStoreStateProps } from "types";
import useWindowSize from "shared/hooks/useWindowSize";

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

        const publicDoc = querySnapshot.docs[0];
        const docData = publicDoc.data();

        setStoreDetailsState({
          name: docData.storeDetails?.name ?? "",
          phoneNumber: docData.storeDetails?.phoneNumber ?? "",
          website: docData.storeDetails?.website ?? "",
          address: docData.storeDetails?.address ?? null,
          deliveryPrice: docData.storeDetails?.deliveryPrice ?? "",
          taxRate: docData.storeDetails?.taxRate ?? "13",
          hasLogo: docData.storeDetails?.hasLogo ?? false,
          logoUrl: docData.storeDetails?.logoUrl ?? null,
          settingsPassword: "",
          acceptDelivery: docData.storeDetails?.acceptDelivery ?? false,
          deliveryRange: docData.storeDetails?.deliveryRange ?? "",
          stripePublicKey: docData.stripePublicKey ?? "",
          docID: publicDoc.id,
        });

        setOnlineStoreState({
          onlineStoreActive: true,
          onlineStoreSetUp: true,
          urlEnding: docData.urlEnding ?? "",
          stripePublicKey: docData.stripePublicKey ?? null,
          stripeSecretKey: null,
          paidStatus: null,
          brandColor: docData.brandColor ?? "#0d0d0d",
          tagline: docData.tagline ?? "",
        });

        setProductBuilderState({
          isOnlineOrder: true,
          isOpen: false,
          product: null,
          itemIndex: null,
          imageUrl: null,
        });

        db.collection("public")
          .doc(publicDoc.id)
          .collection("products")
          .get()
          .then((productSnapshot) => {
            const products: ProductProp[] = [];
            productSnapshot.forEach((element) => {
              const productData = element.data();
              products.push({
                ...productData,
                options: productData.options ?? [],
                name: productData.name,
                price: productData.price,
                description: productData.description,
                id: element.id,
                category: productData.category,
                rank: productData.rank,
                imageUrl: productData.imageUrl,
                hasImage: productData.hasImage,
                dontDisplayOnOnlineStore: productData.dontDisplayOnOnlineStore,
              });
            });

            products.sort(customSort);

            const grouped: ProductProp[] = [];
            products.forEach((product, index) => {
              if (product.dontDisplayOnOnlineStore) return;
              let lastIndex = -1;
              for (let i = grouped.length - 1; i >= 0; i--) {
                if (grouped[i].category === product.category) { lastIndex = i; break; }
              }
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
    <div style={styles.container}>
      {/* Page content */}
      {page === 1 && <OnlineOrderHome />}
      {page === 2 && <OnlineOrderHomePickup />}
      {page === 3 && <OnlineOrderHomeDelivery />}
      {page === 4 && (
        <OrderCartMain
          catalog={{ categories: catalog.categories, products: data }}
        />
      )}
      {page === 5 && <OnlineOrderHomeCheckout />}
      {page === 6 && <OnlineOrderHomeCompleted />}

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
            <span style={styles.loaderText}>Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#0d0d0d",
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
    zIndex: 100,
  },
  loaderInner: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    position: "absolute",
    transition: "opacity 0.5s",
    height: "100%",
    width: "100%",
    display: "flex",
    gap: 16,
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid #e2e8f0",
    borderTopColor: "#1D294E",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loaderText: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
  },
};

export default OrderPage;
