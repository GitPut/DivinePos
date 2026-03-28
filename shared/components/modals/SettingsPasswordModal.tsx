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
    if (password === storeDetails.settingsPassword) {
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
        alertP.success("Settings password has been sent to your account email");
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
          <div style={styles.header}>
            <span style={styles.title}>Settings</span>
            <span style={styles.subtitle}>Authorization</span>
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
                Password is incorrect
              </span>
            )}
          </div>
          <div style={styles.bottomSection}>
            <button
              onClick={tryAuthorize}
              style={{
                ...styles.enterBtn,
                ...(password.length < 1 && { opacity: 0.5 }),
              }}
              disabled={password.length < 1}
            >
              <span style={styles.enterBtnTxt}>Enter</span>
            </button>
            <button
              onClick={SendEmail}
              style={styles.forgotButton}
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
  bottomSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  enterBtn: {
    width: "100%",
    height: 44,
    backgroundColor: "#1D294E",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  enterBtnTxt: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 15,
  },
  forgotButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  forgotPasswordTxt: {
    fontSize: 13,
    color: "#94a3b8",
    textDecoration: "underline",
  },
};
