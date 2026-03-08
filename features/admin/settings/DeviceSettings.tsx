import React, { useEffect, useRef, useState } from "react";
import {
  activePlanState,
  deviceIdState,
  deviceTreeState,
  resetDeviceState,
  setDeviceTreeState,
  setDeviceState,
} from "store/appState";
import { auth, db } from "services/firebase/config";

import Switch from "shared/components/ui/Switch";
import { FiChevronLeft, FiChevronRight, FiPlus } from "react-icons/fi";
import { IoKey } from "react-icons/io5";
import "react-select2-wrapper/css/select2.css";
import ReactSelect from "react-select";
import { GooglePlacesStyles } from "utils/googlePlacesStyles";
import { useAlert } from "react-alert";
import windowsDownloadImg from "assets/images/image_E3zi..png";
import macDownloadImg from "assets/images/image_F2vF..png";
import loadingGif from "assets/loading.gif";

interface OtherDeviceOptionsProp {
  value: string;
  label: string;
}

function DeviceSettings() {
  const deviceTree = deviceTreeState.use();
  const myDeviceID = deviceIdState.use();
  const activePlan = activePlanState.use();
  const [fadeOpacity, setFadeOpacity] = useState(0);
  const [viewVisible, setviewVisible] = useState(false);
  const [selectedDevice, setselectedDevice] = useState(0);
  const [otherDeviceOptions, setOtherDeviceOptions] = useState<
    OtherDeviceOptionsProp[]
  >([]);
  const alertP = useAlert();

  const fadeIn = () => {
    setFadeOpacity(1);
  };

  const resetLoader = () => {
    setviewVisible(true);
    fadeIn();
  };

  useEffect(() => {
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
      const newDeviceTreeDevices = [];
      for (let index = 0; index < deviceTree.devices.length; index++) {
        const element = deviceTree.devices[index];

        if (element.id === myDeviceID) {
          newDeviceTreeDevices.unshift(element);
        } else {
          newDeviceTreeDevices.push(element);
        }
      }
      setDeviceTreeState({ ...deviceTree, devices: newDeviceTreeDevices });
    }
  }, []);

  return (
    <div style={styles.container}>
      <span style={styles.pageLbl}>Device Settings</span>
      <div
        style={{ height: "100%", width: "100%", overflow: "auto" }}
      >
        <div style={styles.group}>
          <div style={styles.deviceScrollContainer}>
            {selectedDevice > 0 ? (
              <button
                style={styles.nextDeviceBtn}
                onClick={() => setselectedDevice((prev) => prev - 1)}
              >
                <FiChevronLeft size={40} color="rgba(255,255,255,1)" />
              </button>
            ) : (
              <div style={styles.backBtn} />
            )}
            {deviceTree.devices.length > 0 ? (
              <div style={styles.deviceContainer}>
                <div style={styles.topGroup}>
                  <div style={styles.deviceNameInputGroup}>
                    <span style={styles.deviceName}>Device Name</span>
                    <input
                      style={styles.deviceNameInput}
                      placeholder="Enter device name"
                      value={deviceTree.devices[selectedDevice].name}
                      onChange={(e) => {
                        const clone = { ...deviceTree };
                        clone.devices[selectedDevice].name = e.target.value;
                        setDeviceTreeState(clone);
                      }}
                    />
                  </div>
                  <div style={styles.deviceIDRow}>
                    <div
                      style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
                    >
                      <span style={styles.deviceIdLbl}>Device ID:</span>
                      <span style={styles.deviceId}>
                        {deviceTree.devices[selectedDevice].id
                          ? deviceTree.devices[selectedDevice].id?.toUpperCase()
                          : "No device ID set"}
                      </span>
                    </div>
                    <button
                      style={styles.setToMyIDBtn}
                      onClick={() => {
                        const deviceBatch = db.batch();
                        const oldDevice = deviceTree.devices.find(
                          (d) => d.id === myDeviceID
                        );
                        if (oldDevice) {
                          deviceBatch.update(
                            db.collection("users").doc(auth?.currentUser?.uid).collection("devices").doc(oldDevice.docID),
                            { id: null }
                          );
                        }
                        deviceBatch.update(
                          db.collection("users").doc(auth?.currentUser?.uid).collection("devices").doc(deviceTree.devices[selectedDevice].docID),
                          { id: myDeviceID }
                        );
                        deviceBatch.commit();
                        const clone = { ...deviceTree };
                        if (oldDevice) {
                          clone.devices.find((d) => d.id === myDeviceID)!.id = null;
                        }
                        clone.devices[selectedDevice].id = myDeviceID;
                        setDeviceTreeState(clone);
                        setDeviceState({
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
                      <IoKey size={25} color="rgba(255,255,255,1)" />
                    </button>
                  </div>
                  <div style={styles.printOnlineOrderRow}>
                    <span style={styles.printOnlineOrdersLbl}>
                      Print Online Orders:
                    </span>
                    <Switch
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
                  </div>
                  <div style={styles.useDifferentDeviceRow}>
                    <span style={styles.useDifferentDeviceLbl}>
                      Use Different Device To Print:
                    </span>
                    <Switch
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
                  </div>
                  <div style={styles.printerToPrinterInputGroup}>
                    <span style={styles.printToPrinterLbl}>
                      Print to Printer
                    </span>
                    {!deviceTree.devices[selectedDevice]
                      .useDifferentDeviceToPrint ? (
                      <input
                        style={styles.printToPrintInput}
                        placeholder="Enter printer name"
                        value={
                          deviceTree.devices[selectedDevice].printToPrinter ??
                          ""
                        }
                        onChange={(e) => {
                          const clone = { ...deviceTree };
                          clone.devices[selectedDevice].printToPrinter = e.target.value;
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
                  </div>
                </div>
                <div style={styles.btnsRow}>
                  <button
                    style={styles.updateDeviceBtn}
                    onClick={() => {
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
                        setDeviceState({
                          ...deviceTree.devices[selectedDevice],
                          printOnlineOrders:
                            deviceTree.devices[selectedDevice]
                              .printOnlineOrders ?? false,
                        });
                      }
                      alertP.success("Device Updated!");
                    }}
                  >
                    <span style={styles.saveDevice}>Save Device</span>
                  </button>
                  <button
                    style={styles.deleteDeviceBtn}
                    onClick={() => {
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
                      resetDeviceState();
                    }}
                  >
                    <span style={styles.deleteDevice}>Delete Device</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  height: 400,
                  width: 358,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span>No Devices Found</span>
              </div>
            )}
            {selectedDevice < deviceTree.devices.length - 1 ? (
              <button
                style={styles.nextDeviceBtn}
                onClick={() => setselectedDevice((prev) => prev + 1)}
              >
                <FiChevronRight size={40} color="rgba(255,255,255,1)" />
              </button>
            ) : activePlan === "professional" ? (
              <button
                style={styles.nextDeviceBtn}
                onClick={() => {
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
                }}
              >
                <FiPlus size={40} color="rgba(255,255,255,1)" />
              </button>
            ) : deviceTree.devices.length < 1 ? (
              <button
                style={styles.nextDeviceBtn}
                onClick={() => {
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
                }}
              >
                <FiPlus size={40} color="rgba(255,255,255,1)" />
              </button>
            ) : (
              <div style={styles.upgradeMessage}>
                <span style={{ color: "#94a3b8", fontSize: 12, textAlign: "center" }}>
                  Upgrade to Professional for unlimited devices
                </span>
              </div>
            )}
          </div>
          <div style={styles.downloadRow}>
            <div style={styles.downloadGroup}>
              <span style={styles.downloadTxt}>
                Download our helper software to enable seamless integration of
                your printer with our service.
              </span>
              <div style={styles.downloadsBtnsRow}>
                <a
                  href="https://divinepos.com/wp-content/uploads/Divine%20POS%20Helper.exe"
                  download="Divine Pos Helper.exe"
                >
                  <img
                    src={windowsDownloadImg}
                    alt="Download for Windows"
                    style={styles.windowsDownloadImg}
                  />
                </a>
                <a
                  href="https://divinepos.com/wp-content/uploads/Divine%20POS%20Helper.pkg"
                  download="Divine Pos Helper.pkg"
                >
                  <img
                    src={macDownloadImg}
                    alt="Download for Mac"
                    style={styles.macDownloadImg}
                  />
                </a>
              </div>
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
              opacity: fadeOpacity,
              height: "100%",
              width: "100%",
              transition: "opacity 500ms",
            }}
          >
            <img
              src={loadingGif}
              alt="Loading"
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
    display: "inline-block",
  },
  group: {
    display: "flex",
    flexDirection: "column",
    alignSelf: "stretch",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  deviceScrollContainer: {
    display: "flex",
    width: 639,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 20,
  },
  backBtn: {
    display: "flex",
    width: 50,
    height: 50,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  deviceContainer: {
    display: "flex",
    flexDirection: "column",
    width: 358,
    height: 468,
    justifyContent: "space-between",
    alignItems: "center",
  },
  topGroup: {
    display: "flex",
    flexDirection: "column",
    width: 358,
    height: 360,
    justifyContent: "space-between",
  },
  deviceNameInputGroup: {
    display: "flex",
    flexDirection: "column",
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
    borderStyle: "solid",
    borderColor: "#a0a0a0",
    padding: 10,
    boxSizing: "border-box",
  },
  deviceIDRow: {
    display: "flex",
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
    display: "flex",
    width: 30,
    height: 30,
    backgroundColor: "#1c294e",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  printOnlineOrderRow: {
    display: "flex",
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
    display: "flex",
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
    display: "flex",
    flexDirection: "column",
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
    borderStyle: "solid",
    borderColor: "#a0a0a0",
    padding: 10,
    boxSizing: "border-box",
  },
  btnsRow: {
    display: "flex",
    width: 356,
    height: 49,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  updateDeviceBtn: {
    display: "flex",
    width: 170,
    height: 48,
    backgroundColor: "rgba(76,175,80,1)",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
  },
  saveDevice: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 16,
  },
  deleteDeviceBtn: {
    display: "flex",
    width: 170,
    height: 48,
    backgroundColor: "rgba(244,67,54,1)",
    borderRadius: 20,
    opacity: 0.61,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
  },
  deleteDevice: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 16,
  },
  nextDeviceBtn: {
    display: "flex",
    width: 50,
    height: 50,
    backgroundColor: "#1c294e",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  upgradeMessage: {
    display: "flex",
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  downloadRow: {
    width: "95%",
  },
  downloadGroup: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  downloadTxt: {
    color: "#121212",
    fontSize: 17,
    lineHeight: "14px",
    marginBottom: 10,
    marginTop: 10,
    display: "inline-block",
  },
  downloadsBtnsRow: {
    display: "flex",
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
    objectFit: "contain",
  },
  macDownloadImg: {
    height: 50,
    width: 132,
    objectFit: "contain",
  },
};

export default DeviceSettings;
