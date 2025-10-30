import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface PayForOnlineStoreProps {
  payOnlineStore: () => void;
}

function PayForOnlineStore({ payOnlineStore }: PayForOnlineStoreProps) {
  return (
    <ImageBackground
      source={require("../assets/gradient.png")}
      style={styles.container}
      key={"payForOnlineStore"}
    >
      <View style={styles.innerContainer}>
        <View style={styles.innerTopContainer}>
          <View style={styles.mainTopContainer}>
            <View style={styles.topContainer}>
              <View style={styles.topRow}>
                <MaterialCommunityIcons name="store" style={styles.storeIcon} />
                <Text style={styles.onlineStoreTxt}>Online Store</Text>
              </View>
              <View style={styles.bottomGroup}>
                <Text style={styles.informationTxt}>
                  Take your business to the next level with an online store
                </Text>
                <View style={styles.pricePerMonthRow}>
                  <Text style={styles.priceTxt}>$40</Text>
                  <Text style={styles.perMonth}>Per Month</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.divider}></View>
          <View style={styles.benefitsContainer}>
            <View style={styles.benefit1}>
              <MaterialCommunityIcons name="check" style={styles.checkIcon1} />
              <Text style={styles.informationTxt1}>
                Manage straight from pos
              </Text>
            </View>
            <View style={styles.benefit2}>
              <MaterialCommunityIcons name="check" style={styles.checkIcon4} />
              <Text style={styles.informationTxt2}>24/7 Support</Text>
            </View>
            <View style={styles.benefit3}>
              <MaterialCommunityIcons name="check" style={styles.checkIcon5} />
              <Text style={styles.informationTxt3}>Simple and powerful</Text>
            </View>
          </View>
        </View>
        <Pressable style={styles.getStartedBox} onPress={payOnlineStore}>
          <Text style={styles.getStartedTxt}>Get Started</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "flex-end",
    width: 388,
    height: 446,
  },
  innerContainer: {
    width: 336,
    height: 397,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  innerTopContainer: {
    width: 336,
    height: 312,
    justifyContent: "space-between",
    alignItems: "center",
  },
  mainTopContainer: {
    width: 336,
    height: 158,
  },
  topContainer: {
    width: 246,
    height: 158,
    justifyContent: "space-between",
  },
  topRow: {
    width: 150,
    height: 34,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  storeIcon: {
    color: "rgba(0,0,0,1)",
    fontSize: 30,
  },
  onlineStoreTxt: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
  },
  bottomGroup: {
    width: 246,
    height: 98,
    justifyContent: "space-between",
  },
  informationTxt: {
    fontWeight: "300",
    color: "#121212",
    fontSize: 15,
    width: 239,
    height: 40,
  },
  pricePerMonthRow: {
    width: 150,
    height: 47,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  priceTxt: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 40,
    height: 47,
  },
  perMonth: {
    fontWeight: "300",
    color: "#08090a",
    marginBottom: 5,
  },
  divider: {
    width: 300,
    height: 1,
    backgroundColor: "#bbc6f9",
  },
  benefitsContainer: {
    width: 336,
    height: 109,
    justifyContent: "space-between",
  },
  benefit1: {
    width: 336,
    height: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  checkIcon1: {
    color: "rgba(255,248,248,1)",
    fontSize: 40,
    marginRight: 10,
  },
  informationTxt1: {
    color: "#fff8f8",
    fontSize: 15,
  },
  benefit2: {
    width: 336,
    height: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  checkIcon4: {
    color: "rgba(255,248,248,1)",
    fontSize: 40,
    marginRight: 10,
  },
  informationTxt2: {
    color: "#fff8f8",
    fontSize: 15,
  },
  benefit3: {
    width: 336,
    height: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  checkIcon5: {
    color: "rgba(255,248,248,1)",
    fontSize: 40,
    marginRight: 10,
  },
  informationTxt3: {
    color: "#fff8f8",
    fontSize: 15,
  },
  getStartedBox: {
    width: 172,
    height: 48,
    backgroundColor: "#1c294e",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  getStartedTxt: {
    fontWeight: "700",
    color: "#ffffff",
  },
});

export default PayForOnlineStore;
