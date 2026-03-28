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
import FranchiseLocationSelector from "./pages/FranchiseLocationSelector";
import {
  cartState,
  setCartState,
  orderDetailsState,
  setOrderDetailsState,
  setProductBuilderState,
  setStoreDetailsState,
  storeDetailsState,
  setOnlineStoreState,
  onlineStoreState,
} from "store/appState";
import { ProductProp, UserStoreStateProps } from "types";
import useWindowSize from "shared/hooks/useWindowSize";

const CART_STORAGE_KEY = "divine-pos-online-cart";
const ORDER_STORAGE_KEY = "divine-pos-online-order";

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
  const [isFranchise, setIsFranchise] = useState(false);
  const [storeInactive, setStoreInactive] = useState(false);
  const [franchiseLocations, setFranchiseLocations] = useState<any[]>([]);
  const [franchiseHubUid, setFranchiseHubUid] = useState<string | null>(null);

  const customSort = (a: ProductProp, b: ProductProp) => {
    const rawA = parseFloat(a.rank ?? "");
    const rawB = parseFloat(b.rank ?? "");
    const hasRankA = !isNaN(rawA) && rawA > 0;
    const hasRankB = !isNaN(rawB) && rawB > 0;

    if (hasRankA && hasRankB) return rawA - rawB;
    if (hasRankA && !hasRankB) return -1;
    if (!hasRankA && hasRankB) return 1;
    return (a.name ?? "").localeCompare(b.name ?? "");
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

        // Check if online store is active
        if (docData.onlineStoreActive === false) {
          setStoreDetailsState({
            name: docData.storeDetails?.name ?? "",
            phoneNumber: docData.storeDetails?.phoneNumber ?? "",
            website: "",
            address: null,
            deliveryPrice: "",
            taxRate: "13",
            settingsPassword: "",
            acceptDelivery: false,
            deliveryRange: "",
          });
          setOnlineStoreState({
            onlineStoreActive: false,
            onlineStoreSetUp: false,
            urlEnding: "",
            stripePublicKey: null,
            stripeSecretKey: null,
            paidStatus: null,
            brandColor: docData.brandColor ?? "#0d0d0d",
          });
          setStoreInactive(true);
          fadeOut();
          return;
        }

        // Check business hours
        if (docData.businessHours) {
          const now = new Date();
          const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
          const today = dayNames[now.getDay()];
          const todayHours = docData.businessHours[today];
          if (todayHours) {
            if (todayHours.closed) {
              setStoreDetailsState({
                name: docData.storeDetails?.name ?? "",
                phoneNumber: "", website: "", address: null, deliveryPrice: "", taxRate: "13",
                settingsPassword: "", acceptDelivery: false, deliveryRange: "",
              });
              setOnlineStoreState({
                onlineStoreActive: false, onlineStoreSetUp: false, urlEnding: "",
                stripePublicKey: null, stripeSecretKey: null, paidStatus: null,
                brandColor: docData.brandColor ?? "#0d0d0d",
                businessHours: docData.businessHours,
              });
              setStoreInactive(true);
              fadeOut();
              return;
            }
            // Check if current time is within hours
            const [openH, openM] = todayHours.open.split(":").map(Number);
            const [closeH, closeM] = todayHours.close.split(":").map(Number);
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const openMinutes = openH * 60 + openM;
            const closeMinutes = closeH * 60 + closeM;
            if (currentMinutes < openMinutes || currentMinutes > closeMinutes) {
              setStoreDetailsState({
                name: docData.storeDetails?.name ?? "",
                phoneNumber: "", website: "", address: null, deliveryPrice: "", taxRate: "13",
                settingsPassword: "", acceptDelivery: false, deliveryRange: "",
              });
              setOnlineStoreState({
                onlineStoreActive: false, onlineStoreSetUp: false, urlEnding: "",
                stripePublicKey: null, stripeSecretKey: null, paidStatus: null,
                brandColor: docData.brandColor ?? "#0d0d0d",
                businessHours: docData.businessHours,
              });
              setStoreInactive(true);
              fadeOut();
              return;
            }
          }
        }

        // Detect franchise stores
        if (docData.isFranchise && docData.locations?.length > 0) {
          setIsFranchise(true);
          setFranchiseLocations(docData.locations.filter((l: any) => l.isActive !== false));
          setFranchiseHubUid(publicDoc.id);

          // Set franchise-level branding (including new customization fields)
          setOnlineStoreState({
            onlineStoreActive: true,
            onlineStoreSetUp: true,
            urlEnding: docData.urlEnding ?? "",
            stripePublicKey: docData.stripePublicKey ?? null,
            stripeSecretKey: null,
            paidStatus: null,
            brandColor: docData.brandColor ?? "#0d0d0d",
            secondaryColor: docData.secondaryColor ?? "#f59e0b",
            accentColor: docData.accentColor ?? "#10b981",
            tagline: docData.tagline ?? "",
            headline: docData.headline ?? "",
            subheadline: docData.subheadline ?? "",
            heroImageUrl: docData.heroImageUrl ?? "",
            fontStyle: docData.fontStyle ?? "modern",
            socialLinks: docData.socialLinks ?? {},
            businessHours: docData.businessHours ?? undefined,
          });

          setStoreDetailsState({
            name: docData.storeDetails?.name ?? "",
            phoneNumber: "",
            website: "",
            address: null,
            deliveryPrice: "",
            taxRate: docData.storeDetails?.taxRate ?? "13",
            hasLogo: !!(docData.logoUrl || docData.storeDetails?.hasLogo),
            logoUrl: docData.logoUrl || docData.storeDetails?.logoUrl || null,
            settingsPassword: "",
            acceptDelivery: false,
            deliveryRange: "",
            stripePublicKey: docData.stripePublicKey ?? "",
            docID: publicDoc.id,
          });

          setProductBuilderState({
            isOnlineOrder: true,
            isOpen: false,
            product: null,
            itemIndex: null,
            imageUrl: null,
          });

          // Load products from hub's public collection
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

              // Start on location selector page (page 0)
              setOrderDetailsState({ page: 0 });
              fadeOut();
            });
          return;
        }

        // Single-store flow (unchanged)
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

  // ─── Cart & order persistence (survives refresh) ──────────────────────────
  // Hydrate from sessionStorage on mount
  useEffect(() => {
    try {
      const savedCart = sessionStorage.getItem(CART_STORAGE_KEY);
      const savedOrder = sessionStorage.getItem(ORDER_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed) && parsed.length > 0) setCartState(parsed);
      }
      if (savedOrder) {
        const parsed = JSON.parse(savedOrder);
        if (parsed && parsed.page) {
          // Restore order details but skip date (not serializable) and keep page
          setOrderDetailsState({
            customer: parsed.customer,
            delivery: parsed.delivery,
            address: parsed.address,
            method: parsed.method,
            page: parsed.page > 5 ? 1 : parsed.page, // Don't restore checkout/completed
          });
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Persist cart to sessionStorage on change
  useEffect(() => {
    const cart = cartState.get();
    try {
      if (cart.length > 0) {
        sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } else {
        sessionStorage.removeItem(CART_STORAGE_KEY);
      }
    } catch {
      // Storage full — ignore
    }
  }, [cartState.use()]);

  // Persist order details on page/customer change
  useEffect(() => {
    try {
      const { customer, delivery, address, method, page } = orderDetails;
      sessionStorage.setItem(
        ORDER_STORAGE_KEY,
        JSON.stringify({ customer, delivery, address, method, page })
      );
    } catch {
      // Storage full — ignore
    }
  }, [orderDetails.page, orderDetails.customer, orderDetails.delivery]);

  // Clear persistence on order completion
  useEffect(() => {
    if (page === 6) {
      sessionStorage.removeItem(CART_STORAGE_KEY);
      sessionStorage.removeItem(ORDER_STORAGE_KEY);
    }
  }, [page]);

  const fadeOut = () => {
    setFadeVisible(false);
    setTimeout(() => {
      setLoaderHidden(true);
    }, 500);
  };

  return (
    <div style={styles.container}>
      {/* Store closed message */}
      {storeInactive && (() => {
        const onlineStore = onlineStoreState.get();
        const hours = onlineStore.businessHours;
        const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const today = dayNames[new Date().getDay()];
        const todayHours = hours?.[today];
        const nextOpenDay = hours ? dayNames.find((_, i) => {
          const idx = (dayNames.indexOf(today) + 1 + i) % 7;
          const h = hours[dayNames[idx]];
          return h && !h.closed;
        }) : null;
        const nextOpen = nextOpenDay ? hours?.[nextOpenDay] : null;

        return (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: onlineStore.brandColor || "#0d0d0d", gap: 12, padding: 24 }}>
            <span style={{ fontSize: 48, marginBottom: 8 }}>🔒</span>
            <span style={{ fontSize: 24, fontWeight: "700", color: "#fff", textAlign: "center" }}>
              {storeDetailsState.get().name || "This store"}
            </span>
            <span style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
              Online ordering is currently closed.
            </span>
            {todayHours && !todayHours.closed && (
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
                Today's hours: {todayHours.open} — {todayHours.close}
              </span>
            )}
            {todayHours?.closed && nextOpen && nextOpenDay && (
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", textAlign: "center", textTransform: "capitalize" }}>
                Opens {nextOpenDay} at {nextOpen.open}
              </span>
            )}
          </div>
        );
      })()}

      {/* Page content */}
      {!storeInactive && page === 0 && isFranchise && (
        <div key="p0" className="online-store-page">
          <FranchiseLocationSelector
            locations={franchiseLocations}
            onSelect={(location: any) => {
              // Override store details with selected location's data
              setStoreDetailsState({
                ...storeDetailsState.get(),
                name: storeDetailsState.get().name,
                phoneNumber: location.phoneNumber || "",
                address: location.address || null,
                deliveryPrice: location.deliveryPrice || "",
                acceptDelivery: location.acceptDelivery ?? false,
                deliveryRange: location.deliveryRange || "",
                stripePublicKey: location.stripePublicKey || storeDetailsState.get().stripePublicKey || "",
                docID: location.uid,
              });
              setOrderDetailsState({ selectedLocationUid: location.uid, page: 1 });
            }}
          />
        </div>
      )}
      {!storeInactive && page === 1 && <div key="p1" className="online-store-page"><OnlineOrderHome /></div>}
      {!storeInactive && page === 2 && <div key="p2" className="online-store-page"><OnlineOrderHomePickup /></div>}
      {!storeInactive && page === 3 && <div key="p3" className="online-store-page"><OnlineOrderHomeDelivery /></div>}
      {!storeInactive && page === 4 && (
        <div key="p4" className="online-store-page">
          <OrderCartMain
            catalog={{ categories: catalog.categories, products: data }}
          />
        </div>
      )}
      {!storeInactive && page === 5 && <div key="p5" className="online-store-page"><OnlineOrderHomeCheckout /></div>}
      {!storeInactive && page === 6 && <div key="p6" className="online-store-page"><OnlineOrderHomeCompleted /></div>}

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
