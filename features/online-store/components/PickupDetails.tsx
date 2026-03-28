import React, { useState } from "react";
import FieldInput from "./FieldInput";
import { useAlert } from "react-alert";
import { orderDetailsState, setOrderDetailsState } from "store/appState";
import useWindowSize from "shared/hooks/useWindowSize";
import { sanitizePhone, isValidPhone, isValidFullName } from "utils/phoneValidation";

function PickupDetails({ contrast }: { contrast?: any }) {
  const orderDetails = orderDetailsState.use();
  const [localName, setlocalName] = useState(orderDetails.customer.name);
  const [localPhoneNumber, setlocalPhoneNumber] = useState(
    orderDetails.customer.phone
  );
  const alertP = useAlert();
  const { width } = useWindowSize();

  const isDisabled = localName === "" || localPhoneNumber === "";

  return (
    <div style={styles.wrapper}>
      <div style={styles.fieldsGroup}>
        <FieldInput
          txtInput="Your full name"
          label="Name"
          style={styles.field}
          value={localName}
          onChangeText={(text) => setlocalName(text)}
          textContentType="name"
          maxLength={25}
          contrast={contrast}
        />
        <FieldInput
          txtInput="(123) 456-7890"
          label="Phone Number"
          style={styles.field}
          value={localPhoneNumber}
          onChangeText={(text) => setlocalPhoneNumber(sanitizePhone(text))}
          textContentType="telephoneNumber"
          maxLength={10}
          contrast={contrast}
        />
      </div>
      <button
        style={{
          ...styles.continueBtn,
          ...(contrast ? { backgroundColor: contrast.btnBg } : {}),
          ...(isDisabled ? { opacity: 0.5, cursor: "not-allowed" } : {}),
        }}
        disabled={isDisabled}
        onClick={() => {
          if (localName === "" || localPhoneNumber === "")
            return alertP.error("Please fill in all fields");
          if (!isValidFullName(localName))
            return alertP.error("Please enter your full name (first and last)");
          if (!isValidPhone(localPhoneNumber))
            return alertP.error("Please enter a valid 10-digit phone number");
          setOrderDetailsState({
            customer: {
              ...orderDetails.customer,
              phone: localPhoneNumber,
              name: localName,
            },
            delivery: false,
          });
          setOrderDetailsState({ page: 4 });
        }}
      >
        <span style={{ ...styles.continueBtnTxt, ...(contrast ? { color: contrast.btnText } : {}) }}>Continue</span>
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    width: "100%",
    alignItems: "center",
    gap: 24,
    display: "flex",
    flexDirection: "column",
  },
  fieldsGroup: {
    width: "100%",
    gap: 16,
    display: "flex",
    flexDirection: "column",
  },
  field: {
    width: "100%",
  },
  continueBtn: {
    width: "100%",
    height: 52,
    backgroundColor: "#fff",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    border: "none",
    cursor: "pointer",
    transition: "opacity 0.2s ease",
  },
  continueBtnTxt: {
    color: "#1D294E",
    fontSize: 16,
    fontWeight: "700",
  },
};

export default PickupDetails;
