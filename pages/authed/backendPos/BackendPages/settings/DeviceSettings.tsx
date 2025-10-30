import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Modal,
  Pressable,
  TextInput,
} from "react-native";
import {
  deviceIdState,
  deviceTreeState,
  resetMyDeviceDetailsState,
  setDeviceTreeState,
  setMyDeviceDetailsState,
} from "state/state";
import { auth, db } from "state/firebaseConfig";
import { loadStripe } from "@stripe/stripe-js";
import { Image } from "react-native";
import GeneralSwitch from "components/GeneralSwitch";
import { Entypo, Ionicons } from "@expo/vector-icons";
import "react-select2-wrapper/css/select2.css";
import ReactSelect from "react-select";
import { GooglePlacesStyles } from "components/functional/GooglePlacesStyles";
import { useAlert } from "react-alert";

interface OtherDeviceOptionsProp {
  value: string;
  label: string;
}

function Index() {
  const deviceTree = deviceTreeState.use();
  const myDeviceID = deviceIdState.use();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [viewVisible, setviewVisible] = useState(false);
  const [selectedDevice, setselectedDevice] = useState(0);
  const [otherDeviceOptions, setOtherDeviceOptions] = useState<
    OtherDeviceOptionsProp[]
  >([]);
  const alertP = useAlert();

  const fadeIn = () => {
    // Will change fadeAnim value to 0 in 3 seconds
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const resetLoader = () => {
    setviewVisible(true);
    fadeIn();
  };

  const AddNewDevice = async () => {
    await db
      .collection("users")
      .doc(auth?.currentUser?.uid)
      .collection("checkout_sessions")
      .add({
        price: "price_1Oj9NZCIw3L7DOwI7DKAhIve", // todo price Id from your products price in the Stripe Dashboard
        quantity: 1,
        success_url: window.location.href, // return user to this screen on successful purchase
        cancel_url: window.location.href, // return user to this screen on failed purchase
      })
      .then((docRef) => {
        // Wait for the checkoutSession to get attached by the extension
        docRef.onSnapshot(async (snap) => {
          const { error, sessionId } = snap.data() ?? {};
          if (error) {
            // Show an error to your customer and inspect
            // your Cloud Function logs in the Firebase console.
            alertP.error("An error occured, please try again later.");
          }

          if (sessionId) {
            // We have a session, let's redirect to Checkout
            // Init Stripe
            const stripe = await loadStripe(
              "pk_live_51MHqrvCIw3L7DOwI0ol9CTCSH7mQXTLKpxTWKzmwOY1MdKwaYwhdJq6WTpkWdBeql3sS44JmybynlRnaO2nSa1FK001dHiEOZO" // todo enter your public stripe key here
            );
            if (!stripe) return;
            await stripe.redirectToCheckout({ sessionId });
          }
        });
      });
  };

  useEffect(() => {
    console.log("Extra device paying for: ", deviceTree.extraDevicesPayingFor);
    if (deviceTree.devices.length > 0) {
      setOtherDeviceOptions([]);
      deviceTree.devices.map((deviceSearch) => {
        if (deviceSearch.id !== deviceTree.devices[selectedDevice].id) {
          setOtherDeviceOptions((prev) => [
            ...prev,
            { value: deviceSearch.docID, label: deviceSearch.name },
          ]);
        }
      });
    }
  }, [selectedDevice, deviceTree.devices]);

  useEffect(() => {
    if (deviceTree.devices.length > 1) {
      // console.log("deviceTree.devices", deviceTree.devices);
      const newDeviceTreeDevices = [];
      for (let index = 0; index < deviceTree.devices.length; index++) {
        const element = deviceTree.devices[index];

        if (element.id === myDeviceID) {
          // Put element to the beginning of newDeviceTreeDevices
          newDeviceTreeDevices.unshift(element);
        } else {
          newDeviceTreeDevices.push(element);
        }
      }
      setDeviceTreeState({ ...deviceTree, devices: newDeviceTreeDevices });
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.pageLbl}>Device Settings</Text>
      <ScrollView
        style={{ height: "100%", width: "100%" }}
        persistentScrollbar={true}
      >
        <View style={styles.group}>
          <View style={styles.deviceScrollContainer}>
            {selectedDevice > 0 ? (
              <Pressable
                style={styles.nextDeviceBtn}
                onPress={() => setselectedDevice((prev) => prev - 1)}
              >
                <Entypo name="chevron-left" style={styles.icon} />
              </Pressable>
            ) : (
              <View style={styles.backBtn} />
            )}
            {deviceTree.devices.length > 0 ? (
              <View style={styles.deviceContainer}>
                <View style={styles.topGroup}>
                  <View style={styles.deviceNameInputGroup}>
                    <Text style={styles.deviceName}>Device Name</Text>
                    <TextInput
                      style={styles.deviceNameInput}
                      placeholder="Enter device name"
                      value={deviceTree.devices[selectedDevice].name}
                      onChangeText={(val) => {
                        const clone = { ...deviceTree };
                        clone.devices[selectedDevice].name = val;
                        setDeviceTreeState(clone);
                      }}
                    />
                  </View>
                  <View style={styles.deviceIDRow}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text style={styles.deviceIdLbl}>Device ID:</Text>
                      <Text style={styles.deviceId}>
                        {deviceTree.devices[selectedDevice].id
                          ? deviceTree.devices[selectedDevice].id?.toUpperCase()
                          : "No device ID set"}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.setToMyIDBtn}
                      onPress={() => {
                        if (
                          deviceTree.devices.filter(
                            (deviceSearch) => deviceSearch.id === myDeviceID
                          ).length > 0
                        ) {
                          db.collection("users")
                            .doc(auth?.currentUser?.uid)
                            .collection("devices")
                            .doc(
                              deviceTree.devices.filter(
                                (deviceSearch) => deviceSearch.id === myDeviceID
                              )[0].docID
                            )
                            .update({ id: null });
                          const clone = { ...deviceTree };
                          clone.devices.filter(
                            (deviceSearch) => deviceSearch.id === myDeviceID
                          )[0].id = null;
                          setDeviceTreeState(clone);
                        }
                        db.collection("users")
                          .doc(auth?.currentUser?.uid)
                          .collection("devices")
                          .doc(deviceTree.devices[selectedDevice].docID)
                          .update({ id: myDeviceID });
                        const clone = { ...deviceTree };
                        clone.devices[selectedDevice].id = myDeviceID;
                        setDeviceTreeState(clone);
                        setMyDeviceDetailsState({
                          name: deviceTree.devices[selectedDevice].name,
                          id: deviceTree.devices[selectedDevice].id,
                          docID: deviceTree.devices[selectedDevice].docID,
                          useDifferentDeviceToPrint:
                            deviceTree.devices[selectedDevice]
                              .useDifferentDeviceToPrint,
                          printToPrinter:
                            deviceTree.devices[selectedDevice].printToPrinter,
                          sendPrintToUserID:
                            deviceTree.devices[selectedDevice]
                              .sendPrintToUserID,
                          printOnlineOrders:
                            deviceTree.devices[selectedDevice]
                              .printOnlineOrders,
                        });
                      }}
                    >
                      <Ionicons name="key" style={styles.setToMyIDIcon} />
                    </Pressable>
                  </View>
                  <View style={styles.printOnlineOrderRow}>
                    <Text style={styles.printOnlineOrdersLbl}>
                      Print Online Orders:
                    </Text>
                    <GeneralSwitch
                      isActive={
                        deviceTree.devices[selectedDevice].printOnlineOrders
                      }
                      toggleSwitch={() => {
                        const clone = { ...deviceTree };
                        clone.devices[selectedDevice].printOnlineOrders =
                          !deviceTree.devices[selectedDevice].printOnlineOrders;
                        setDeviceTreeState(clone);
                      }}
                    />
                  </View>
                  <View style={styles.useDifferentDeviceRow}>
                    <Text style={styles.useDifferentDeviceLbl}>
                      Use Different Device To Print:
                    </Text>
                    <GeneralSwitch
                      isActive={
                        deviceTree.devices[selectedDevice]
                          .useDifferentDeviceToPrint ?? false
                      }
                      toggleSwitch={() => {
                        const clone = { ...deviceTree };
                        clone.devices[
                          selectedDevice
                        ].useDifferentDeviceToPrint =
                          !deviceTree.devices[selectedDevice]
                            .useDifferentDeviceToPrint;
                        setDeviceTreeState(clone);
                      }}
                    />
                  </View>
                  <View style={styles.printerToPrinterInputGroup}>
                    <Text style={styles.printToPrinterLbl}>
                      Print to Printer
                    </Text>
                    {!deviceTree.devices[selectedDevice]
                      .useDifferentDeviceToPrint ? (
                      <TextInput
                        style={styles.printToPrintInput}
                        placeholder="Enter printer name"
                        value={
                          deviceTree.devices[selectedDevice].printToPrinter ??
                          ""
                        }
                        onChangeText={(val) => {
                          const clone = { ...deviceTree };
                          clone.devices[selectedDevice].printToPrinter = val;
                          setDeviceTreeState(clone);
                        }}
                      />
                    ) : (
                      <ReactSelect
                        options={otherDeviceOptions}
                        value={
                          deviceTree.devices[selectedDevice].sendPrintToUserID
                        }
                        onChange={(val) => {
                          const clone = { ...deviceTree };
                          clone.devices[selectedDevice].sendPrintToUserID = val;
                          setDeviceTreeState(clone);
                        }}
                        placeholder={"Choose Device To Send Print To"}
                        menuPortalTarget={document.body}
                        styles={{
                          ...GooglePlacesStyles,
                          input: (provided) => ({
                            ...provided,
                            fontFamily: "sans-serif",
                            width: "100%",
                            height: 40,
                            borderRadius: 5,
                            paddingTop: 5,
                          }),
                        }}
                        menuPlacement="auto"
                        menuPosition="fixed"
                      />
                    )}
                  </View>
                </View>
                <View style={styles.btnsRow}>
                  <Pressable
                    style={styles.updateDeviceBtn}
                    onPress={() => {
                      db.collection("users")
                        .doc(auth?.currentUser?.uid)
                        .collection("devices")
                        .doc(deviceTree.devices[selectedDevice].docID)
                        .update({
                          ...deviceTree.devices[selectedDevice],
                          printOnlineOrders:
                            deviceTree.devices[selectedDevice]
                              .printOnlineOrders ?? false,
                        });
                      if (
                        deviceTree.devices[selectedDevice].id === myDeviceID
                      ) {
                        setMyDeviceDetailsState({
                          ...deviceTree.devices[selectedDevice],
                          printOnlineOrders:
                            deviceTree.devices[selectedDevice]
                              .printOnlineOrders ?? false,
                        });
                      }
                      alertP.success("Device Updated!");
                    }}
                  >
                    <Text style={styles.saveDevice}>Save Device</Text>
                  </Pressable>
                  <Pressable
                    style={styles.deleteDeviceBtn}
                    onPress={() => {
                      db.collection("users")
                        .doc(auth?.currentUser?.uid)
                        .collection("devices")
                        .doc(deviceTree.devices[selectedDevice].docID)
                        .delete();
                      let clone = { ...deviceTree };
                      clone = {
                        ...clone,
                        devices: clone.devices.filter(
                          (deviceSearch) =>
                            deviceSearch.docID !==
                            deviceTree.devices[selectedDevice].docID
                        ),
                      };
                      setDeviceTreeState(clone);
                      setselectedDevice((prev) => (prev > 0 ? prev - 1 : 0));
                      resetMyDeviceDetailsState();
                    }}
                  >
                    <Text style={styles.deleteDevice}>Delete Device</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View
                style={{
                  height: 400,
                  width: 358,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text>No Devices Found</Text>
              </View>
            )}
            {selectedDevice < deviceTree.devices.length - 1 ? (
              <Pressable
                style={styles.nextDeviceBtn}
                onPress={() => setselectedDevice((prev) => prev + 1)}
              >
                <Entypo name="chevron-right" style={styles.icon} />
              </Pressable>
            ) : (
              <Pressable
                style={styles.nextDeviceBtn}
                onPress={() => {
                  if (
                    deviceTree.devices.length <
                    1 + deviceTree.extraDevicesPayingFor
                  ) {
                    db.collection("users")
                      .doc(auth?.currentUser?.uid)
                      .collection("devices")
                      .add({
                        name: `Device${deviceTree.devices.length}`,
                        id: null,
                        printToPrinter: null,
                      })
                      .then((docRef) => {
                        const clone = { ...deviceTree };
                        clone.devices.push({
                          name: "",
                          id: null,
                          printToPrinter: null,
                          sendPrintToUserID: null,
                          docID: docRef.id,
                          printOnlineOrders: false,
                          useDifferentDeviceToPrint: false,
                        });
                        setDeviceTreeState(clone);
                      });
                  } else {
                    resetLoader();
                    AddNewDevice();
                  }
                }}
              >
                <Entypo name="plus" style={styles.icon} />
              </Pressable>
            )}
          </View>
          <View style={styles.downloadRow}>
            <View style={styles.downloadGroup}>
              <Text style={styles.downloadTxt}>
                Download our helper software to enable seamless integration of
                your printer with our service.
              </Text>
              <View style={styles.downloadsBtnsRow}>
                <a
                  href="https://divinepos.com/wp-content/uploads/Divine%20POS%20Helper.exe"
                  download="Divine Pos Helper.exe"
                >
                  <Image
                    source={require("./assets/images/image_E3zi..png")}
                    resizeMode="contain"
                    style={styles.windowsDownloadImg}
                    key={"windowsDownloadImg"}
                  />
                </a>
                <a
                  href="https://divinepos.com/wp-content/uploads/Divine%20POS%20Helper.pkg"
                  download="Divine Pos Helper.pkg"
                >
                  <Image
                    source={require("./assets/images/image_F2vF..png")}
                    resizeMode="contain"
                    style={styles.macDownloadImg}
                    key={"macDownloadImg"}
                  />
                </a>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      {viewVisible && (
        <Modal visible={true}>
          <Animated.View
            style={{
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "white",
              position: "absolute",
              opacity: fadeAnim,
              height: "100%",
              width: "100%",
            }}
          >
            <Image
              source={require("assets/loading.gif")}
              style={{ width: 450, height: 450, resizeMode: "contain" }}
              key={"loading"}
            />
          </Animated.View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    width: "100%",
    height: "100%",
  },
  pageLbl: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 16,
    margin: 20,
  },
  group: {
    alignSelf: "stretch",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  deviceScrollContainer: {
    width: 639,
    // height: 591,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 20,
  },
  backBtn: {
    width: 50,
    height: 50,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  deviceContainer: {
    width: 358,
    height: 468,
    justifyContent: "space-between",
    alignItems: "center",
  },
  topGroup: {
    width: 358,
    height: 360,
    justifyContent: "space-between",
  },
  deviceNameInputGroup: {
    width: 358,
    height: 88,
    justifyContent: "space-between",
  },
  deviceName: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 17,
  },
  deviceNameInput: {
    width: 358,
    height: 51,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#a0a0a0",
    padding: 10,
  },
  deviceIDRow: {
    width: 354,
    height: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deviceIdLbl: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 17,
    marginRight: 10,
  },
  deviceId: {
    fontWeight: "300",
    color: "#121212",
    fontSize: 14,
  },
  setToMyIDBtn: {
    width: 30,
    height: 30,
    backgroundColor: "#1c294e",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  setToMyIDIcon: {
    color: "rgba(255,255,255,1)",
    fontSize: 25,
  },
  printOnlineOrderRow: {
    width: 356,
    height: 21,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  printOnlineOrdersLbl: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 17,
  },
  printOnlineSwitch: {
    width: 40,
    height: 20,
    backgroundColor: "#E6E6E6",
  },
  useDifferentDeviceRow: {
    width: 356,
    height: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  useDifferentDeviceLbl: {
    fontWeight: "700",
    color: "#111111",
    fontSize: 17,
  },
  useDiffrentDeviceSwitch: {
    width: 40,
    height: 20,
    backgroundColor: "#E6E6E6",
  },
  printerToPrinterInputGroup: {
    width: 358,
    height: 88,
    justifyContent: "space-between",
  },
  printToPrinterLbl: {
    fontWeight: "700",
    color: "#111111",
    fontSize: 17,
  },
  printToPrintInput: {
    width: 358,
    height: 51,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#a0a0a0",
    padding: 10,
  },
  btnsRow: {
    width: 356,
    height: 49,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  updateDeviceBtn: {
    width: 170,
    height: 48,
    backgroundColor: "rgba(76,175,80,1)",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveDevice: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 16,
  },
  deleteDeviceBtn: {
    width: 170,
    height: 48,
    backgroundColor: "rgba(244,67,54,1)",
    borderRadius: 20,
    opacity: 0.61,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteDevice: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 16,
  },
  nextDeviceBtn: {
    width: 50,
    height: 50,
    backgroundColor: "#1c294e",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    color: "rgba(255,255,255,1)",
    fontSize: 40,
  },
  downloadRow: {
    width: "95%",
  },
  downloadGroup: {
    justifyContent: "space-between",
  },
  downloadTxt: {
    color: "#121212",
    fontSize: 17,
    lineHeight: 14,
    marginBottom: 10,
    marginTop: 10,
  },
  downloadsBtnsRow: {
    width: 289,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  windowsDownloadImg: {
    height: 50,
    width: 132,
  },
  macDownloadImg: {
    height: 50,
    width: 132,
  },
});

export default Index;
