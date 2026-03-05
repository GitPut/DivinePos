import React, { useState } from "react";
import FieldInput from "./FieldInput";
import { useAlert } from "react-alert";
import { orderDetailsState, setOrderDetailsState } from "store/appState";
import useWindowSize from "shared/hooks/useWindowSize";

function PickupDetails() {
  const orderDetails = orderDetailsState.use();
  const [localName, setlocalName] = useState(orderDetails.customer.name);
  const [localPhoneNumber, setlocalPhoneNumber] = useState(
    orderDetails.customer.phone
  );
  const alertP = useAlert();
  const { width } = useWindowSize();

  return (
    <>
      <div
        style={{
          ...styles.fieldsGroup,
          ...(width < 1000 ? { width: width * 0.9 } : {}),
        }}
      >
        <FieldInput
          txtInput="Name"
          label="Name*"
          style={styles.nameField}
          value={localName}
          onChangeText={(text) => setlocalName(text)}
          textContentType="name"
          maxLength={25}
        />
        <FieldInput
          txtInput="(123) 456-7890"
          label="Phone Number*"
          style={styles.addressField}
          value={localPhoneNumber}
          onChangeText={(text) => setlocalPhoneNumber(text)}
          textContentType="telephoneNumber"
          maxLength={10}
        />
      </div>
      <button
        style={{
          ...styles.continueBtn,
          ...((localName === "" || localPhoneNumber === "") ? { opacity: 0.8 } : {}),
        }}
        disabled={localName === "" || localPhoneNumber === ""}
        onClick={() => {
          if (localName === "" || localPhoneNumber === "")
            return alertP.error("Please fill in all fields");
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
        <span style={styles.continueBtnTxt}>CONTINUE</span>
      </button>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  fieldsGroup: {
    width: 380,
    height: 179,
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
  },
  nameField: {
    height: 70,
    width: "100%",
  },
  addressField: {
    height: 70,
    width: "100%",
  },
  buzzCodeAndPhoneRow: {
    width: "100%",
    height: 70,
    flexDirection: "row",
    justifyContent: "space-between",
    display: "flex",
  },
  buzzCodeField: {
    height: 70,
    width: 175,
  },
  phoneNumberField: {
    height: 70,
    width: 175,
  },
  continueBtn: {
    width: 219,
    height: 60,
    backgroundColor: "rgba(238,125,67,1)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "3px 3px 10px rgba(0,0,0,0.2)",
    marginTop: 20,
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  continueBtnTxt: {
    color: "rgba(255,255,255,1)",
    fontSize: 18,
    fontWeight: "700",
  },
};

export default PickupDetails;
