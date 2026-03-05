import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { FiChevronLeft, FiArrowLeft } from "react-icons/fi";
import Axios from "axios";
import { useAlert } from "react-alert";
import useWindowSize from "shared/hooks/useWindowSize";
import backgroundImg from "assets/images/background.png";
import logoImg from "assets/dpos-logo-black.png";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const history = useHistory();
  const { width } = useWindowSize();
  const [useSmallDesign, setuseSmallDesign] = useState(width < 1024);
  const alertP = useAlert();

  useEffect(() => {
    const third = width / 3;
    if (third < 200) {
      setuseSmallDesign(true);
    } else {
      setuseSmallDesign(false);
    }
  }, [width]);

  const submit = () => {
    if (email === "") {
      alertP.error("Please enter an email address");
      return;
    }
    const data = JSON.stringify({
      email: email,
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://us-central1-posmate-5fc0a.cloudfunctions.net/sendPasswordResetEmail",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    Axios(config)
      .then(function () {
        alertP.success("We've sent a link to reset your password.");
      })
      .catch(function () {
        alertP.error("There was an error resetting your password.");
      });
    setEmail("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submit();
    }
  };

  return (
    <div
      style={{
        ...styles.container,
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      key={"background"}
    >
      <div
        style={{
          ...styles.headerContainer,
          ...(useSmallDesign ? { width: "90%" } : {}),
        }}
      >
        <button
          onClick={() => history.push("/log-in")}
          style={{
            position: "absolute",
            left: 0,
            bottom: 24,
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          <div style={styles.backBtn}>
            {useSmallDesign ? (
              <FiChevronLeft style={styles.leftIcon} />
            ) : (
              <FiArrowLeft style={styles.leftIcon} />
            )}
            {!useSmallDesign && <span style={styles.backTxt}>Back</span>}
          </div>
        </button>
        <a href="https://divinepos.com" style={{ textDecoration: "none" }}>
          <img
            src={logoImg}
            style={styles.logo}
            key={"logo"}
            alt=""
          />
        </a>
      </div>
      <div style={styles.mainPageContainer}>
        <div
          style={{
            ...styles.resetPasswordContainer,
            ...(useSmallDesign ? { width: "90%" } : {}),
          }}
        >
          <span style={styles.resetPassword}>Reset password</span>
          <div style={styles.bottomContainer}>
            <div style={styles.inputsContainer}>
              <span style={styles.txt}>
                Please enter in your account email and we will send you a
                password reset link to your email
              </span>
              <div style={styles.emailInputGroup}>
                <span style={styles.emailAddress}>Email address</span>
                <input
                  style={styles.emailInput}
                  placeholder="Enter email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value.replace(/\s/g, ""))
                  }
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
            <div style={styles.btnBottomContainer}>
              <button style={styles.submitBtn} onClick={submit}>
                <span style={styles.submit}>Submit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  mainPageContainer: {
    width: "90%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 100,
    display: "flex",
    flexDirection: "column",
  },
  headerContainer: {
    width: "70%",
    height: "15%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    display: "flex",
    position: "relative",
  },
  headerInnerContainer: {
    width: "60%",
    height: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
  },
  backBtn: {
    width: 72,
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
  },
  leftIcon: {
    color: "rgba(0,0,0,1)",
    fontSize: 30,
  },
  backTxt: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 16,
  },
  logo: {
    height: 68,
    width: 196,
    objectFit: "contain",
  },
  resetPasswordContainer: {
    width: 423,
    height: 408,
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  resetPassword: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 36,
  },
  bottomContainer: {
    width: "100%",
    height: 318,
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
  },
  inputsContainer: {
    width: "100%",
    height: 159,
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
  },
  txt: {
    display: "block",
    color: "#121212",
    fontSize: 16,
    width: "100%",
    height: 48,
    textAlign: "justify",
  },
  emailInputGroup: {
    width: "100%",
    height: 80,
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
  },
  emailAddress: {
    fontWeight: "700",
    color: "#333333",
    fontSize: 15,
  },
  emailInput: {
    width: "100%",
    height: 51,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cccccc",
    borderStyle: "solid",
    padding: 10,
    boxSizing: "border-box",
  },
  btnBottomContainer: {
    width: "100%",
    height: 109,
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  submitBtn: {
    width: "100%",
    height: 44,
    backgroundColor: "#1c294e",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  submit: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 16,
  },
};

export default ResetPassword;
