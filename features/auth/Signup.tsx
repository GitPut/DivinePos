import React, { useEffect, useState } from "react";
import { signUp } from "services/firebase/functions";
import { useHistory } from "react-router-dom";
import { FiChevronLeft, FiArrowLeft, FiEyeOff, FiEye } from "react-icons/fi";
import { useAlert } from "react-alert";
import useWindowSize from "shared/hooks/useWindowSize";
import backgroundImg from "assets/images/background.png";
import logoImg from "assets/dpos-logo-black.png";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setname] = useState("");
  const [phoneNumber, setphoneNumber] = useState("");
  const history = useHistory();
  const { width } = useWindowSize();
  const [useSmallDesign, setuseSmallDesign] = useState(width < 1024);
  const [secureEntry, setsecureEntry] = useState(true);
  const alertP = useAlert();

  useEffect(() => {
    const third = width / 3;
    if (third < 200) {
      setuseSmallDesign(true);
    } else {
      setuseSmallDesign(false);
    }
  }, [width]);

  const attemptSignUp = () => {
    if (email && password) {
      signUp(email, password, name, phoneNumber).catch(() => {
        alertP.error("There was a issue signing up. Please try again.");
      });
    } else {
      alertP.error("Please enter your email and password");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      attemptSignUp();
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
      <div style={styles.scrollContainer}>
        <div
          style={{
            ...styles.headerContainer,
            ...(useSmallDesign ? { width: "90%" } : {}),
            height: 110,
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
              ...styles.logInContainer,
              ...(useSmallDesign ? { width: "90%" } : {}),
            }}
          >
            <span style={styles.logIn}>Sign Up</span>
            <div style={styles.bottomContainer}>
              <div style={styles.inputsContainer}>
                <div style={styles.emailInputGroup}>
                  <span style={styles.emailAddress}>Full name</span>
                  <input
                    style={styles.emailInput}
                    placeholder="Enter name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setname(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div style={styles.emailInputGroup}>
                  <span style={styles.emailAddress}>Phone number</span>
                  <input
                    style={styles.emailInput}
                    placeholder="Enter phone number"
                    autoComplete="tel"
                    value={phoneNumber}
                    onChange={(e) =>
                      setphoneNumber(e.target.value.replace(/\s/g, ""))
                    }
                    onKeyDown={handleKeyDown}
                  />
                </div>
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
                <div style={styles.emailInputGroup}>
                  <span style={styles.password}>Password</span>
                  <div style={{ position: "relative" }}>
                    <input
                      style={styles.passwordInput}
                      placeholder="Enter password"
                      type={secureEntry ? "password" : "text"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value.replace(/\s/g, ""))
                      }
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      onClick={() => setsecureEntry(!secureEntry)}
                      style={{
                        position: "absolute",
                        right: 15,
                        top: 15,
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                      }}
                    >
                      {secureEntry ? (
                        <FiEyeOff style={{ fontSize: 20, color: "#333333" }} />
                      ) : (
                        <FiEye style={{ fontSize: 20, color: "#333333" }} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div style={styles.btnBottomContainer}>
                <a
                  href="https://divinepos.com/terms-conditions/"
                  style={{ textDecoration: "none", marginBottom: 25 }}
                >
                  <span style={styles.signUpTxt}>
                    By creating an account, I agree to Divine POS&apos;s terms
                    of service
                  </span>
                </a>
                <button style={styles.loginBtn} onClick={attemptSignUp}>
                  <span style={styles.loginTxt}>Sign Up</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    justifyContent: "flex-start",
    alignItems: "center",
    minHeight: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
  },
  scrollContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  mainPageContainer: {
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 50,
    display: "flex",
    flexDirection: "column",
  },
  headerContainer: {
    width: "70%",
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
  logInContainer: {
    width: 423,
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  logIn: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 36,
  },
  bottomContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
  },
  inputsContainer: {
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  emailInputGroup: {
    width: "100%",
    height: 80,
    justifyContent: "space-between",
    marginBottom: 25,
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
  passwordInputGroup: {
    width: "100%",
    height: 80,
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
  },
  password: {
    fontWeight: "700",
    color: "#333333",
    fontSize: 15,
  },
  passwordInput: {
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 25,
    display: "flex",
    flexDirection: "column",
  },
  loginBtn: {
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
  loginTxt: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 16,
  },
  signUpTxt: {
    color: "#313b47",
    fontSize: 16,
  },
  forgotPassword: {
    color: "#313b47",
    fontSize: 16,
  },
};

export default Signup;
