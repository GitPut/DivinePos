import React from "react";
import HeaderTxt from "./HeaderTxt";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

import { GooglePlacesStyles } from "utils/googlePlacesStyles";
import ViewPlan from "./ViewPlan";
import InputWithLabel from "shared/components/ui/InputWithLabel";
import { AddressType } from "types";
const GOOGLE_API_KEY = "AIzaSyCQQghMN4w-_9fww7rdi7OZYHRrWtU4OBk";

interface DetailsStageProps {
  setstageNum: (num: number) => void;
  setstoreName: (storeName: string) => void;
  setphoneNumber: (phoneNumber: string) => void;
  setwebsite: (website: string) => void;
  setaddress: (address: AddressType) => void;
  address: AddressType | null;
  planType: string | null;
  storeName: string;
  phoneNumber: string;
  website: string;
}

function DetailsStage({
  setstageNum,
  setstoreName,
  setphoneNumber,
  setwebsite,
  setaddress,
  address,
  planType,
  storeName,
  phoneNumber,
  website,
}: DetailsStageProps) {
  return (
    <div style={styles.container}>
      <HeaderTxt
        Txt="Step 2: Enter Store Details"
        SubTxt="Fill in your store's information!"
      />
      <div style={styles.contentContainer}>
        <div style={styles.topSectionOfContainer}>
          <div style={styles.plansRow}>
            <ViewPlan
              planType={planType}
              setstageNum={setstageNum}
            />
            <div
              style={{
                width: 320,
                height: 384,
                justifyContent: "space-between",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <InputWithLabel
                lbl="Store Name *"
                placeholder="Enter store name"
                value={storeName}
                onChangeText={(val) => setstoreName(val)}
              />
              <InputWithLabel
                lbl="Phone Number *"
                placeholder="Enter store phone #"
                value={phoneNumber}
                onChangeText={(val) => setphoneNumber(val)}
              />
              <InputWithLabel
                lbl="Website"
                placeholder="Enter store website url (Optional)"
                value={website}
                onChangeText={(val) => setwebsite(val)}
              />
              <InputWithLabel
                lbl="Address *"
                CustomInput={() => (
                  <GooglePlacesAutocomplete
                    apiOptions={{
                      region: "CA",
                    }}
                    debounce={800}
                    apiKey={GOOGLE_API_KEY}
                    selectProps={{
                      value: address,
                      onChange: setaddress,
                      defaultValue: address,
                      placeholder: "Enter store address",
                      menuPortalTarget: document.body,
                      styles: GooglePlacesStyles,
                    }}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    alignItems: "center",
    justifyContent: "flex-start",
    display: "flex",
    flexDirection: "column",
    width: 898,
  },
  contentContainer: {
    width: 898,
    height: 550,
    alignItems: "center",
    justifyContent: "space-around",
    display: "flex",
    backgroundColor: "rgba(255,255,255,1)",
    boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
    borderRadius: 10,
  },
  topSectionOfContainer: {
    width: 860,
    height: 500,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  plansRow: {
    width: 700,
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  plan: {
    height: 384,
    width: 275,
    boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
  },
  plan2: {
    height: 384,
    width: 275,
    boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
  },
  plan3: {
    height: 384,
    width: 275,
    boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
  },
  buttonRow: {
    height: 50,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    display: "flex",
    width: 860,
  },
  nextBtn: {
    height: 50,
    width: 143,
  },
};

export default DetailsStage;
