import React, { useState } from "react";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useAlert } from "react-alert";
import {
  orderDetailsState,
  setOrderDetailsState,
  storeDetailsState,
} from "store/appState";
import useWindowSize from "shared/hooks/useWindowSize";

const validateEmail = (email: string) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

function CheckOutDetails() {
  const [emailAddress, setEmailAddress] = useState("");
  const [loading, setloading] = useState(false);
  const alertP = useAlert();
  const orderDetails = orderDetailsState.use();
  const storeDetails = storeDetailsState.use();
  const { width } = useWindowSize();

  const stripe = useStripe();
  const elements = useElements();
  const currency = "cad";

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setloading(true);
    event.preventDefault();

    if (!validateEmail(emailAddress)) {
      alertP.error("Please enter a valid email address.");
      setloading(false);
      return;
    }

    if (!stripe || !elements) {
      alertP.error("Error please try again");
      setloading(false);
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    const newOrderDetails = {
      ...orderDetails,
      customer: { ...orderDetails.customer, email: emailAddress },
    };

    try {
      if (!cardNumberElement) return;

      const { token, error } = await stripe.createToken(cardNumberElement);

      if (error) {
        console.error("Error creating token:", error);
        alertP.error("Error please try again");
        setloading(false);
        return;
      }

      const response = await fetch(
        "https://us-central1-posmate-5fc0a.cloudfunctions.net/processPayment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token.id,
            amount: orderDetails.total,
            currency,
            storeUID: storeDetails.docID,
            orderDetails: newOrderDetails,
            storeDetails: storeDetails,
          }),
        }
      );

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const responseData = await response.json();
          if (responseData.success) {
            setOrderDetailsState({
              page: 6,
            });
          } else {
            console.error(
              "Payment processing failed. Server message:",
              responseData.message
            );
            alertP.error("Payment processing failed.");
            setloading(false);
          }
        } else {
          console.error("Non-JSON response received:", await response.text());
          alertP.error("Non-JSON response received.");
          setloading(false);
        }
      } else {
        throw new Error("Network response was not ok.");
      }
    } catch (jsonError) {
      console.error("Error parsing JSON response or network error:", jsonError);
      alertP.error("Payment processing failed. Please try again.");
      setloading(false);
    }
  };

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        iconColor: "#1D294E",
        color: "#0f172a",
        fontWeight: "500",
        fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
        fontSize: "15px",
        fontSmoothing: "antialiased",
        ":-webkit-autofill": {
          color: "#0f172a",
        },
        "::placeholder": {
          color: "#94a3b8",
        },
        backgroundColor: "transparent",
      },
      invalid: {
        iconColor: "#ef4444",
        color: "#ef4444",
      },
    },
    hidePostalCode: true,
  };

  const isDisabled = !stripe || !elements || loading || emailAddress === "";

  return (
    <div style={styles.formContainer}>
      {/* Email field */}
      <div style={styles.fieldGroup}>
        <span style={styles.fieldLabel}>Email Address</span>
        <input
          type="email"
          placeholder="you@example.com"
          style={{
            ...styles.textInput,
            ...(loading ? { opacity: 0.5 } : {}),
          }}
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
        />
      </div>

      {/* Card Number */}
      <div style={styles.fieldGroup}>
        <span style={styles.fieldLabel}>Card Number</span>
        <div style={styles.stripeElementWrapper}>
          <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {/* Expiry + CVC row */}
      <div style={styles.row}>
        <div style={{ ...styles.fieldGroup, flex: 1 }}>
          <span style={styles.fieldLabel}>Expiry Date</span>
          <div style={styles.stripeElementWrapper}>
            <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
        <div style={{ width: 16 }} />
        <div style={{ ...styles.fieldGroup, flex: 1 }}>
          <span style={styles.fieldLabel}>CVC</span>
          <div style={styles.stripeElementWrapper}>
            <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>

      {/* Order total */}
      {orderDetails.total != null && (
        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>Total</span>
          <span style={styles.totalValue}>
            ${(Number(orderDetails.total) / 100).toFixed(2)} CAD
          </span>
        </div>
      )}

      {/* Pay button */}
      <button
        style={{
          ...styles.payBtn,
          ...(isDisabled ? { opacity: 0.5, cursor: "not-allowed" } : {}),
        }}
        onClick={handleSubmit}
        disabled={isDisabled}
      >
        <span style={styles.payBtnTxt}>
          {loading ? "Processing..." : "Pay Now"}
        </span>
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    width: "100%",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    letterSpacing: 0.2,
  },
  textInput: {
    height: 52,
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "0 16px",
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "#fff",
    outline: "none",
    boxSizing: "border-box" as const,
    width: "100%",
    transition: "border-color 0.15s",
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  },
  stripeElementWrapper: {
    height: 52,
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "0 16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#fff",
    boxSizing: "border-box" as const,
  },
  row: {
    display: "flex",
    flexDirection: "row",
  },
  totalRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0",
    borderTop: "1px solid #f1f5f9",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    color: "#64748b",
    fontWeight: "500",
  },
  totalValue: {
    fontSize: 18,
    color: "#0f172a",
    fontWeight: "700",
  },
  payBtn: {
    width: "100%",
    height: 52,
    backgroundColor: "#1D294E",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
  payBtnTxt: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
};

export default CheckOutDetails;
