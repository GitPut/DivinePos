import React, { useState } from "react";
import DropdownMenuButton from "./components/DropdownMenuButton";
import { Route, useHistory, useLocation, withRouter } from "react-router-dom";
import firebase from "firebase/compat/app";
import MenuButton from "./components/MenuButton";
import index from "./index";
import { useAlert } from "react-alert";
import Header from "shared/components/header/Header";
import useWindowSize from "shared/hooks/useWindowSize";
import dashboardLblImg from "assets/images/dashboardLbl.png";
import menuLblImg from "assets/images/menuLbl.png";
import reportsLblImg from "assets/images/reportsLbl.png";
import storeSettingsLblImg from "assets/images/storeSettingsLbl.png";
import helpLblImg from "assets/images/helpLbl.png";
import loadingGif from "assets/loading.gif";

function AdminContainer(props: { match: { url: string } }) {
  const { match } = props;
  const [isSideMenu, setSideMenu] = useState("");
  const history = useHistory();
  const [fadeVisible, setFadeVisible] = useState(false);
  const [viewVisible, setviewVisible] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  const { height, width } = useWindowSize();
  const alertP = useAlert();

  const resetLoader = () => {
    setviewVisible(true);
    setTimeout(() => setFadeVisible(true), 10);
  };

  const Manage = () => {
    resetLoader();
    firebase
      .functions()
      .httpsCallable("ext-firestore-stripe-payments-createPortalLink")({
        returnUrl: `${window.location.href}`,
        locale: "auto",
      })
      .then((response) => {
        window.location = response.data.url;
      })
      .catch((error) => {
        alertP.error("Unknown error has occured: ", error);
      });
  };

  return (
    <div style={styles.container}>
      <Header
        onPressLogo={() => {
          history.push("/authed/dashboard");
          setSideMenu("");
        }}
        isPosHeader={true}
      />
      <div style={{ ...styles.bottom, height: height - 75, paddingTop: 50 }}>
        <div style={styles.leftMenu}>
          <div style={{ ...styles.menuOptionsContainer, height: "100%" }}>
            <MenuButton
              labelImg={dashboardLblImg}
              labelImgStyle={{
                height: 18,
                width: 107,
              }}
              active={pathname.includes("dashboard")}
              onPress={() => {
                history.push("/authed/dashboard");
                setSideMenu("");
              }}
            />
            <DropdownMenuButton
              active={pathname.includes("/authed/product")}
              dropDownOpen={isSideMenu === "product"}
              toggleDropdown={() =>
                setSideMenu((prev) => (prev === "product" ? "" : "product"))
              }
              labelImg={menuLblImg}
              labelImgStyle={{
                height: 18,
                width: 70,
              }}
              options={[
                {
                  label: "Category Management",
                  link: "/authed/product/categorylist-product",
                  active: pathname.includes("categorylist"),
                },
                {
                  label: "Product Management",
                  link: "/authed/product/productlist-product",
                  active: pathname.includes("productlist-"),
                },
              ]}
            />
            <DropdownMenuButton
              active={pathname.includes("/authed/inventory")}
              dropDownOpen={isSideMenu === "inventory"}
              toggleDropdown={() =>
                setSideMenu((prev) => (prev === "inventory" ? "" : "inventory"))
              }
              labelText="Inventory"
              options={[
                {
                  label: "Ingredients",
                  link: "/authed/inventory/ingredients",
                  active: pathname.includes("/inventory/ingredients"),
                },
                {
                  label: "Product Stock",
                  link: "/authed/inventory/stocklevels",
                  active: pathname.includes("/inventory/stocklevels"),
                },
              ]}
            />
            <DropdownMenuButton
              active={pathname.includes("/authed/report")}
              dropDownOpen={isSideMenu === "report"}
              toggleDropdown={() =>
                setSideMenu((prev) => (prev === "report" ? "" : "report"))
              }
              labelImg={reportsLblImg}
              labelImgStyle={{
                height: 18,
                width: 87,
              }}
              options={[
                {
                  label: "Invoice Report",
                  link: "/authed/report/invoicereport",
                  active: pathname.includes("invoicereport"),
                },
                {
                  label: "Employees Report",
                  link: "/authed/report/employeesreport",
                  active: pathname.includes("employeesreport"),
                },
              ]}
            />
            <DropdownMenuButton
              active={pathname.includes("/authed/settings")}
              dropDownOpen={isSideMenu === "settings"}
              toggleDropdown={() =>
                setSideMenu((prev) => (prev === "settings" ? "" : "settings"))
              }
              labelImg={storeSettingsLblImg}
              labelImgStyle={{
                height: 18,
                width: 132,
              }}
              options={[
                {
                  label: "General Settings",
                  link: "/authed/settings/generalsettings",
                  active: pathname.includes("generalsettings"),
                },
                {
                  label: "Device Settings",
                  link: "/authed/settings/devicesettings",
                  active: pathname.includes("devicesettings"),
                },
                {
                  label: "Online Store Settings",
                  link: "/authed/settings/onlinestoresettings",
                  active: pathname.includes("onlinestoresettings"),
                },
                {
                  label: "WooCommerce",
                  link: "/authed/settings/woocommerce",
                  active: pathname.includes("woocommerce"),
                },
                {
                  label: "Manage Billing",
                  link: () => Manage(),
                  active: false,
                },
              ]}
            />
            <DropdownMenuButton
              labelImg={helpLblImg}
              labelImgStyle={{
                height: 18,
                width: 63,
              }}
              active={pathname.includes("help")}
              dropDownOpen={isSideMenu === "help"}
              toggleDropdown={() =>
                setSideMenu((prev) => (prev === "help" ? "" : "help"))
              }
              options={[
                {
                  label: "Getting Started",
                  link: "/authed/help/1",
                  active: pathname.includes("help/1"),
                },
                {
                  label: "Device & Store Settings",
                  link: "/authed/help/2",
                  active: pathname.includes("help/2"),
                },
                {
                  label: "Dashboard & Analytics",
                  link: "/authed/help/3",
                  active: pathname.includes("help/3"),
                },
                {
                  label: "Building Products",
                  link: "/authed/help/4",
                  active: pathname.includes("help/4"),
                },
                {
                  label: "Managing Reports",
                  link: "/authed/help/5",
                  active: pathname.includes("help/5"),
                },
              ]}
            />
          </div>
        </div>
        <div
          style={{
            ...styles.rightSide,
            ...(pathname.includes("dashboard") ? {
              width: width < 1300 ? "73%" : "80%",
              backgroundColor: "grey",
            } : {}),
          }}
        >
          <div style={{ height: "100%" }}>
            <div
              style={{
                ...(!pathname.includes("employeesreport") &&
                  !pathname.includes("editemployee") &&
                  !pathname.includes("onlinestoresettings") &&
                  !pathname.includes("dashboard")
                  ? styles.page
                  : {}),
                ...(pathname.includes("dashboard") ? {
                  backgroundColor: "rgba(238, 242, 255, 1)",
                  height: "100%",
                  width: "100%",
                } : {}),
              }}
            >
              {index &&
                index.map((route, key) => (
                  <Route
                    key={key}
                    path={`${match.url}/${route.path}`}
                    component={route.component}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
      {viewVisible && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "white",
              position: "absolute",
              opacity: fadeVisible ? 1 : 0,
              transition: "opacity 0.5s",
              height: "100%",
              width: "100%",
            }}
          >
            <img
              src={loadingGif}
              alt=""
              style={{ width: 450, height: 450, objectFit: "contain" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    backgroundColor: "#eef2ff",
    minHeight: "100vh",
  },
  header: {
    height: 75,
    backgroundColor: "rgba(255,255,255,1)",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottom: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(238,242,255,1)",
  },
  logo: {
    height: 70,
    width: 222,
    marginRight: 20,
    marginLeft: 20,
  },
  rightSideRow: {
    height: 39,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 50,
  },
  backToPOSBtn: {
    width: 140,
    height: 32,
    backgroundColor: "#1c294e",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 30,
  },
  pos: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 18,
  },
  userBtn: {
    height: 39,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconWithNameGroup: {
    height: 39,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userIcon: {
    height: 39,
    width: 40,
    marginRight: 10,
  },
  username: {
    color: "#435869",
    fontSize: 15,
    marginRight: 10,
  },
  chevronDownIcon: {
    color: "rgba(128,128,128,1)",
    fontSize: 30,
  },
  leftMenu: {
    width: 278,
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  menuOptionsContainer: {
    width: 201,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 0,
    marginLeft: 15,
  },
  rightSide: {
    width: "78%",
    height: "100%",
    display: "flex",
    justifyContent: "flex-end",
  },
  page: {
    width: "100%",
    backgroundColor: "#ffffff",
    boxShadow: "3px 3px 15px rgba(0,0,0,0.2)",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  logoutFromAccount: {
    fontWeight: "700",
    color: "#121212",
  },
  logoutIcon: {
    color: "rgba(0,0,0,1)",
    fontSize: 26,
  },
};

export default withRouter(AdminContainer);
