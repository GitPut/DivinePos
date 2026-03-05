import React, { useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { storeDetailsState } from "store/appState";
import Modal from "shared/components/ui/Modal";
import { posState, updatePosState } from "store/posState";

const AuthModal = () => {
  const [password, setpassword] = useState("");
  const storeDetails = storeDetailsState.use();
  const [inccorectPass, setinccorectPass] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { authPasswordModal } = posState.use();

  const Authorize = () => {
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
    } else {
      setinccorectPass(true);
    }
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
        });
      }}
    >
      <div style={{ cursor: "default" }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.container}>
          <div style={styles.topLabelSectionContainer}>
            <span style={styles.settingsLabel}>Manager Code</span>
            <span style={styles.authorizationLabel}>Authorization</span>
          </div>
          <div style={{ position: "relative" }}>
            <input
              placeholder="Enter Password"
              style={{
                ...styles.passwordTxtInput,
                ...(!showPassword &&
                  password.length !== 0 && { fontFamily: "Password" }),
              }}
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus={true}
            />
            <div
              style={{
                alignItems: "center",
                justifyContent: "center",
                position: "absolute",
                right: 5,
                top: 0,
                display: "flex",
              }}
            >
              {!showPassword ? (
                <button
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  <IoEye size={32} color="rgba(74,74,74,1)" />
                </button>
              ) : (
                <button
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  <IoEyeOff size={32} color="rgba(74,74,74,1)" />
                </button>
              )}
            </div>
          </div>
          {inccorectPass && (
            <span style={{ marginBottom: 10, display: "block" }}>
              Manager code is inccorect!
            </span>
          )}
          <div style={styles.bottomSectionContainer}>
            <button
              onClick={() => {
                Authorize();
              }}
              style={styles.goBtn}
            >
              <span style={styles.goBtnTxt}>Enter</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,1)",
    justifyContent: "space-between",
    width: 366,
    height: 288,
    display: "flex",
    flexDirection: "column",
  },
  topLabelSectionContainer: {
    height: 51,
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 29,
    display: "flex",
    flexDirection: "column",
  },
  settingsLabel: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 24,
  },
  authorizationLabel: {
    color: "#5f5f5f",
  },
  passwordTxtInput: {
    width: 294,
    height: 36,
    backgroundColor: "rgba(255,255,255,1)",
    borderWidth: 1,
    borderColor: "#a4a4a4",
    borderRadius: 10,
    padding: 10,
    borderStyle: "solid" as const,
    boxSizing: "border-box" as const,
  },
  bottomSectionContainer: {
    width: 132,
    height: 65,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
  },
  goBtn: {
    width: 132,
    height: 36,
    backgroundColor: "#1d284e",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  goBtnTxt: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 20,
  },
  forgotPasswordTxt: {
    color: "#8b8484",
    textDecoration: "underline",
  },
};
