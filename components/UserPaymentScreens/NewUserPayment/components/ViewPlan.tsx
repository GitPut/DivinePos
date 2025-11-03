import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

interface PlanProps {
  planType: string | null;
  paymentTerm: string;
  setstageNum: (stageNum: number) => void;
}

const ViewPlan = ({ planType, paymentTerm, setstageNum }: PlanProps) => {
  const [planName, setplanName] = useState<string | null>(null);
  const [planPrice, setplanPrice] = useState<string | null>(null);
  const [planPeriodDesc, setplanPeriodDesc] = useState<string | null>(null);
  const [planDescription, setplanDescription] = useState<string | null>(null);
  const [recurence, setrecurence] = useState<string | null>(null);

  useEffect(() => {
    if (planType === "freeTrial") {
      setplanName("Free Trial");
      setplanPrice("0");
      setplanPeriodDesc("For 1 month");
      setplanDescription(
        `
- Data Anylitics on your store
- Universal Device Compatibility
- Personalize Your Products
- 1 station, and 1 location
- 24/7 support
`
      );
    } else if (planType === "standard") {
      setplanName("STANDARD");
      setplanPrice(paymentTerm === "monthly" ? "50" : "40");
      setplanPeriodDesc("Auto-renews unless cancelled");
      setplanDescription(
        `
- Data Anylitics on your store
- Universal Device Compatibility
- Personalize Your Products
- 1 station, and 1 location
- 24/7 support
- We setup Your Store for You
- Add a extra station for $10 a month
              `
      );
      setrecurence("/ Monthly");
    } else if (planType === "premium") {
      setplanName("PREMIUM");
      setplanPrice(paymentTerm === "monthly" ? "90" : "80");
      setplanPeriodDesc("Auto-renews unless cancelled");
      setplanDescription(
        `
- Data Anylitics on your store
- Universal Device Compatibility
- Personalize Your Products
- 2 stations, and 1 location
- 24/7 Support
- Online Store
- We setup Your Store for You
- Add a extra station for $10 a month
              `
      );
      setrecurence("/ Monthly");
    }
  }, [paymentTerm, planType]);

  return (
    <View
      style={[
        styles.container,
        {
          height: 430,
          borderTopWidth: 10,
          borderTopColor: "#1D294E",
        },
      ]}
    >
      <View
        style={{
          height: 250,
          // justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={styles.planPriceDetailsGroup}>
          <Text style={styles.planName}>{planName}</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            <Text style={styles.planPrice}>${planPrice}</Text>
            <Text style={styles.recurence}>{recurence}</Text>
          </View>
          <Text style={styles.planPeriodDesc}>{planPeriodDesc}</Text>
        </View>
        <View style={styles.planDivider} />
        <Text style={styles.planDescription}>{planDescription}</Text>
      </View>
      <TouchableOpacity
        style={[styles.selectPlanBtn, { backgroundColor: "#1c294e" }]}
        onPress={() => setstageNum(1)}
      >
        <Text style={[styles.selectPlan, { color: "white" }]}>Change Plan</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    justifyContent: "space-between",
    alignItems: "center",
    height: 384,
    width: 275,
    shadowColor: "rgba(0,0,0,1)",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 30,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    padding: 20,
  },
  planPriceDetailsGroup: {
    height: 93,
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: 220,
  },
  planName: {
    fontWeight: "700",
    color: "#1c294e",
    fontSize: 25,
  },
  planPrice: {
    fontWeight: "700",
    color: "#1c294e",
    fontSize: 35,
  },
  recurence: {
    fontWeight: "700",
    color: "#1c294e",
    fontSize: 16,
    marginLeft: 2,
    marginBottom: 5,
  },
  planPeriodDesc: {
    color: "#1c294e",
    fontSize: 16,
  },
  planDivider: {
    width: 257,
    height: 1,
    backgroundColor: "#E6E6E6",
    marginTop: 20,
  },
  planDescription: {
    color: "#121212",
    width: 220,
    lineHeight: 20,
  },
  selectPlanBtn: {
    width: 190,
    height: 38,
    backgroundColor: "#eef2ff",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  selectPlan: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 22,
  },
});

export default ViewPlan;
