import React, { useEffect, useState } from "react";
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
import { FiPlus, FiMonitor, FiDownload, FiTrash2 } from "react-icons/fi";
import { IoKey } from "react-icons/io5";
import ReactSelect from "react-select";
import { GooglePlacesStyles } from "utils/googlePlacesStyles";
import { useAlert } from "react-alert";
import windowsDownloadImg from "assets/images/image_E3zi..png";
import macDownloadImg from "assets/images/image_F2vF..png";

interface OtherDeviceOptionsProp {
  value: string;
  label: string;
}

function DeviceSettings() {
  const deviceTree = deviceTreeState.use();
  const myDeviceID = deviceIdState.use();
  const activePlan = activePlanState.use();
  const [selectedDevice, setselectedDevice] = useState(0);
  const [otherDeviceOptions, setOtherDeviceOptions] = useState<
    OtherDeviceOptionsProp[]
  >([]);
  const alertP = useAlert();

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

  const canAddDevice =
    activePlan === "professional" || deviceTree.devices.length < 1;

  const handleAddDevice = () => {
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
        setselectedDevice(clone.devices.length - 1);
      });
  };

  const handleSaveDevice = () => {
    db.collection("users")
      .doc(auth?.currentUser?.uid)
      .collection("devices")
      .doc(deviceTree.devices[selectedDevice].docID)
      .update({
        ...deviceTree.devices[selectedDevice],
        printOnlineOrders:
          deviceTree.devices[selectedDevice].printOnlineOrders ?? false,
      });
    if (deviceTree.devices[selectedDevice].id === myDeviceID) {
      setDeviceState({
        ...deviceTree.devices[selectedDevice],
        printOnlineOrders:
          deviceTree.devices[selectedDevice].printOnlineOrders ?? false,
      });
    }
    alertP.success("Device Updated!");
  };

  const handleDeleteDevice = () => {
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
          deviceSearch.docID !== deviceTree.devices[selectedDevice].docID,
      ),
    };
    setDeviceTreeState(clone);
    setselectedDevice((prev) => (prev > 0 ? prev - 1 : 0));
    resetDeviceState();
  };

  const handleSetToMyID = () => {
    const deviceBatch = db.batch();
    const oldDevice = deviceTree.devices.find((d) => d.id === myDeviceID);
    if (oldDevice) {
      deviceBatch.update(
        db
          .collection("users")
          .doc(auth?.currentUser?.uid)
          .collection("devices")
          .doc(oldDevice.docID),
        { id: null },
      );
    }
    deviceBatch.update(
      db
        .collection("users")
        .doc(auth?.currentUser?.uid)
        .collection("devices")
        .doc(deviceTree.devices[selectedDevice].docID),
      { id: myDeviceID },
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
        deviceTree.devices[selectedDevice].useDifferentDeviceToPrint,
      printToPrinter: deviceTree.devices[selectedDevice].printToPrinter,
      sendPrintToUserID:
        deviceTree.devices[selectedDevice].sendPrintToUserID,
      printOnlineOrders:
        deviceTree.devices[selectedDevice].printOnlineOrders,
    });
  };

  const device = deviceTree.devices[selectedDevice];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <span style={styles.title}>Device Settings</span>
          <span style={styles.subtitle}>
            {deviceTree.devices.length} device
            {deviceTree.devices.length !== 1 ? "s" : ""} registered
          </span>
        </div>
        {canAddDevice && (
          <button style={styles.addBtn} onClick={handleAddDevice}>
            <FiPlus size={18} color="#fff" />
            <span style={styles.addBtnText}>Add Device</span>
          </button>
        )}
      </div>

      {/* Scrollable content */}
      <div style={styles.scrollArea}>
        {/* Device Tabs */}
        {deviceTree.devices.length > 0 && (
          <div style={styles.tabsRow}>
            {deviceTree.devices.map((d, i) => (
              <button
                key={d.docID}
                style={{
                  ...styles.tab,
                  ...(i === selectedDevice ? styles.tabActive : {}),
                }}
                onClick={() => setselectedDevice(i)}
              >
                <FiMonitor
                  size={14}
                  color={i === selectedDevice ? "#1470ef" : "#94a3b8"}
                />
                <span
                  style={{
                    ...styles.tabText,
                    color: i === selectedDevice ? "#1470ef" : "#64748b",
                    fontWeight: i === selectedDevice ? "600" : "500",
                  }}
                >
                  {d.name || `Device ${i + 1}`}
                </span>
                {d.id === myDeviceID && (
                  <span style={styles.currentBadge}>Current</span>
                )}
              </button>
            ))}
            {!canAddDevice && activePlan !== "professional" && (
              <span style={styles.upgradeHint}>
                Upgrade to Professional for more devices
              </span>
            )}
          </div>
        )}

        {deviceTree.devices.length > 0 && device ? (
          <>
            {/* Device Info Card */}
            <div style={styles.card}>
              <span style={styles.cardTitle}>Device Information</span>
              <div style={styles.fieldGrid}>
                <div style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Device Name</span>
                  <input
                    style={styles.input}
                    placeholder="Enter device name"
                    value={device.name}
                    onChange={(e) => {
                      const clone = { ...deviceTree };
                      clone.devices[selectedDevice].name = e.target.value;
                      setDeviceTreeState(clone);
                    }}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Device ID</span>
                  <div style={styles.deviceIdRow}>
                    <span style={styles.deviceIdText}>
                      {device.id
                        ? device.id.toUpperCase()
                        : "No device ID set"}
                    </span>
                    <button
                      style={styles.setIdBtn}
                      onClick={handleSetToMyID}
                      title="Set to this browser's device ID"
                    >
                      <IoKey size={14} color="#fff" />
                      <span style={styles.setIdBtnText}>Set to This Device</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Print Settings Card */}
            <div style={styles.card}>
              <span style={styles.cardTitle}>Print Settings</span>
              <div style={styles.switchRow}>
                <div>
                  <span style={styles.switchLabel}>Print Online Orders</span>
                  <span style={styles.switchDescription}>
                    Automatically print orders received from the online store
                  </span>
                </div>
                <Switch
                  isActive={device.printOnlineOrders}
                  toggleSwitch={() => {
                    const clone = { ...deviceTree };
                    clone.devices[selectedDevice].printOnlineOrders =
                      !device.printOnlineOrders;
                    setDeviceTreeState(clone);
                  }}
                />
              </div>
              <div style={styles.switchRow}>
                <div>
                  <span style={styles.switchLabel}>
                    Use Different Device to Print
                  </span>
                  <span style={styles.switchDescription}>
                    Send print jobs to another registered device
                  </span>
                </div>
                <Switch
                  isActive={device.useDifferentDeviceToPrint ?? false}
                  toggleSwitch={() => {
                    const clone = { ...deviceTree };
                    clone.devices[selectedDevice].useDifferentDeviceToPrint =
                      !device.useDifferentDeviceToPrint;
                    setDeviceTreeState(clone);
                  }}
                />
              </div>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>
                  {device.useDifferentDeviceToPrint
                    ? "Send Print To"
                    : "Printer Name"}
                </span>
                {!device.useDifferentDeviceToPrint ? (
                  <input
                    style={styles.input}
                    placeholder="Enter printer name"
                    value={device.printToPrinter ?? ""}
                    onChange={(e) => {
                      const clone = { ...deviceTree };
                      clone.devices[selectedDevice].printToPrinter =
                        e.target.value;
                      setDeviceTreeState(clone);
                    }}
                  />
                ) : (
                  <ReactSelect
                    options={otherDeviceOptions}
                    value={device.sendPrintToUserID}
                    onChange={(val) => {
                      const clone = { ...deviceTree };
                      clone.devices[selectedDevice].sendPrintToUserID = val;
                      setDeviceTreeState(clone);
                    }}
                    placeholder="Choose device to send print to"
                    menuPortalTarget={document.body}
                    styles={{
                      ...GooglePlacesStyles,
                      control: (base) => ({
                        ...base,
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        alignItems: "center",
                        minHeight: 42,
                        borderColor: "#e2e8f0",
                        borderRadius: 8,
                        boxShadow: "none",
                      }),
                      input: (provided) => ({
                        ...provided,
                        fontFamily: "sans-serif",
                        width: "100%",
                        height: 36,
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

            {/* Actions */}
            <div style={styles.actionsRow}>
              <button style={styles.saveBtn} onClick={handleSaveDevice}>
                Save Device
              </button>
              <button style={styles.deleteBtn} onClick={handleDeleteDevice}>
                <FiTrash2 size={14} />
                Delete Device
              </button>
            </div>
          </>
        ) : (
          <div style={styles.emptyState}>
            <FiMonitor size={40} color="#cbd5e1" />
            <span style={styles.emptyTitle}>No Devices Found</span>
            <span style={styles.emptyText}>
              Add a device to get started with printing
            </span>
          </div>
        )}

        {/* Download Helper Card */}
        <div style={styles.card}>
          <div style={styles.downloadHeader}>
            <FiDownload size={18} color="#1470ef" />
            <span style={styles.cardTitle}>Printer Helper Software</span>
          </div>
          <span style={styles.downloadDescription}>
            Download our helper software to enable seamless integration of your
            printer with our service.
          </span>
          <div style={styles.downloadBtns}>
            <a
              href="https://divinepos.com/wp-content/uploads/Divine%20POS%20Helper.exe"
              download="Divine Pos Helper.exe"
              style={styles.downloadLink}
            >
              <img
                src={windowsDownloadImg}
                alt="Download for Windows"
                style={styles.downloadImg}
              />
            </a>
            <a
              href="https://divinepos.com/wp-content/uploads/Divine%20POS%20Helper.pkg"
              download="Divine Pos Helper.pkg"
              style={styles.downloadLink}
            >
              <img
                src={macDownloadImg}
                alt="Download for Mac"
                style={styles.downloadImg}
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: 30,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    flexShrink: 0,
  },
  title: {
    fontWeight: "700",
    fontSize: 24,
    color: "#0f172a",
    display: "block",
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 4,
    display: "block",
  },
  addBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    backgroundColor: "#1470ef",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
  },
  addBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollArea: {
    flex: 1,
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    paddingBottom: 20,
  },
  tabsRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    flexShrink: 0,
  },
  tab: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    cursor: "pointer",
  },
  tabActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#1470ef",
  },
  tabText: {
    fontSize: 13,
  },
  currentBadge: {
    fontSize: 10,
    fontWeight: "600",
    color: "#065f46",
    backgroundColor: "#d1fae5",
    padding: "2px 6px",
    borderRadius: 4,
    marginLeft: 4,
  },
  upgradeHint: {
    fontSize: 12,
    color: "#94a3b8",
    marginLeft: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  fieldGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: "1 1 calc(50% - 8px)",
    minWidth: 240,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  input: {
    height: 42,
    padding: "0 12px",
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    outline: "none",
    boxSizing: "border-box",
  },
  deviceIdRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 42,
  },
  deviceIdText: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "monospace",
    letterSpacing: 0.5,
  },
  setIdBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    backgroundColor: "#1c294e",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  setIdBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  switchRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    display: "block",
  },
  switchDescription: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
    display: "block",
  },
  actionsRow: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    flexShrink: 0,
  },
  saveBtn: {
    padding: "10px 24px",
    backgroundColor: "#1470ef",
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
  },
  deleteBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: "10px 20px",
    backgroundColor: "#fff",
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "600",
    border: "1px solid #fecaca",
    borderRadius: 10,
    cursor: "pointer",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },
  emptyText: {
    fontSize: 13,
    color: "#94a3b8",
  },
  downloadHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  downloadDescription: {
    fontSize: 14,
    color: "#475569",
    lineHeight: "1.5",
  },
  downloadBtns: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  downloadLink: {
    display: "flex",
  },
  downloadImg: {
    height: 44,
    width: 132,
    objectFit: "contain",
  },
};

export default DeviceSettings;
