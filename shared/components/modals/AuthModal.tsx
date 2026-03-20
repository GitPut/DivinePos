import React, { useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { storeDetailsState } from "store/appState";
import Modal from "shared/components/ui/Modal";
import { posState, updatePosState } from "store/posState";
import { verifyEmployeePin, logEmployeeActivity, PermissionKey } from "utils/employeeAuth";

const AuthModal = () => {
  const [password, setpassword] = useState("");
  const storeDetails = storeDetailsState.use();
  const [inccorectPass, setinccorectPass] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { authPasswordModal, pendingAuthAction, pendingAuthPermission } = posState.use();

  const Authorize = () => {
    // Manager code check
    if (
      (storeDetails.settingsPassword?.length > 0 &&
        storeDetails.settingsPassword === password) ||
      storeDetails.settingsPassword?.length === 0
    ) {
      updatePosState({
        managerAuthorizedStatus: true,
        authPasswordModal: false,
      });
      setpassword("");
      setinccorectPass(false);
      setShowPassword(false);
      return;
    }
    // Employee PIN check
    if (pendingAuthPermission) {
      const employee = verifyEmployeePin(password, pendingAuthPermission as PermissionKey);
      if (employee) {
        logEmployeeActivity(employee.id, employee.name, pendingAuthAction);
        updatePosState({
          managerAuthorizedStatus: true,
          authPasswordModal: false,
        });
        setpassword("");
        setinccorectPass(false);
        setShowPassword(false);
        return;
      }
    }
    setinccorectPass(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      Authorize();
    }
  };

  return (
    <Modal
      isVisible={authPasswordModal}
      onBackdropPress={() => {
        updatePosState({
          authPasswordModal: false,
          pendingAuthAction: "",
          pendingAuthPermission: "",
        });
      }}
    >
      <div style={{ cursor: "default" }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.container}>
          <div style={styles.header}>
            <span style={styles.title}>Authorization</span>
            <span style={styles.subtitle}>Enter manager code or employee PIN</span>
          </div>
          <div style={styles.inputSection}>
            <span style={styles.label}>Password</span>
            <div style={styles.inputWrapper}>
              <input
                placeholder="Enter password"
                style={{
                  ...styles.input,
                  ...(!showPassword &&
                    password.length !== 0 && { fontFamily: "Password" }),
                }}
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus={true}
              />
              <button
                onClick={() => setShowPassword((prev) => !prev)}
                style={styles.eyeButton}
              >
                {!showPassword ? (
                  <IoEye size={20} color="#94a3b8" />
                ) : (
                  <IoEyeOff size={20} color="#94a3b8" />
                )}
              </button>
            </div>
            {inccorectPass && (
              <span style={styles.errorText}>
                Manager code is incorrect
              </span>
            )}
          </div>
          <button
            onClick={() => {
              Authorize();
            }}
            style={styles.authorizeBtn}
          >
            <span style={styles.authorizeBtnTxt}>Authorize</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#fff",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    width: 380,
    padding: 28,
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
  },
  inputSection: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    width: "100%",
    height: 44,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "0 40px 0 14px",
    fontSize: 15,
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
  },
  eyeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 13,
    color: "#ef4444",
  },
  authorizeBtn: {
    width: "100%",
    height: 44,
    backgroundColor: "#1470ef",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  authorizeBtnTxt: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 15,
  },
};
