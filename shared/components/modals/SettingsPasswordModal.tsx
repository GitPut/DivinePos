import React, { useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { setSettingsAuthState, storeDetailsState } from "store/appState";
import Axios from "axios";
import { auth } from "services/firebase/config";
import { useHistory } from "react-router-dom";
import Modal from "shared/components/ui/Modal";
import { posState, updatePosState } from "store/posState";
import { useAlert } from "react-alert";
import { verifyEmployeePin, logEmployeeActivity } from "utils/employeeAuth";

const SettingsPasswordModal = () => {
  const [password, setpassword] = useState("");
  const storeDetails = storeDetailsState.use();
  const [inccorectPass, setinccorectPass] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const history = useHistory();
  const { settingsPasswordModalVis } = posState.use();
  const alertP = useAlert();

  const tryAuthorize = () => {
    if (password == storeDetails.settingsPassword) {
      setSettingsAuthState(true);
      history.push("/authed/dashboard");
      localStorage.setItem("isAuthedBackend", "true");
      updatePosState({ settingsPasswordModalVis: false });
      setinccorectPass(false);
      return;
    }
    const employee = verifyEmployeePin(password, "accessBackend");
    if (employee) {
      logEmployeeActivity(employee.id, employee.name, "Accessed backend settings");
      setSettingsAuthState(true);
      history.push("/authed/dashboard");
      localStorage.setItem("isAuthedBackend", "true");
      updatePosState({ settingsPasswordModalVis: false });
      setinccorectPass(false);
      return;
    }
    setinccorectPass(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      tryAuthorize();
    }
  };

  const SendEmail = () => {
    const data = JSON.stringify({
      email: auth.currentUser?.email,
      password: storeDetails.settingsPassword,
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://us-central1-posmate-5fc0a.cloudfunctions.net/sendSettingsPass",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    Axios(config)
      .then(function () {
        alertP.error("Settings password has been sent to your account email");
      })
      .catch(function (error) {
        alertP.error(error);
      });
  };

  return (
    <Modal
      isVisible={settingsPasswordModalVis}
      onBackdropPress={() => {
        updatePosState({ settingsPasswordModalVis: false });
      }}
    >
      <div style={{ cursor: "default" }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.container}>
          <div style={styles.topLabelSectionContainer}>
            <span style={styles.settingsLabel}>Settings</span>
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
              Password is inccorect!
            </span>
          )}
          <div style={styles.bottomSectionContainer}>
            <button
              onClick={tryAuthorize}
              style={{
                ...styles.goBtn,
                ...(password.length < 1 && { opacity: 0.8 }),
              }}
              disabled={password.length < 1}
            >
              <span style={styles.goBtnTxt}>Go</span>
            </button>
            <button
              onClick={SendEmail}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <span style={styles.forgotPasswordTxt}>
                Forgot Password?
              </span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsPasswordModal;

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
    width: 87,
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
