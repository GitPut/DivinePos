import {
  StyleSheet,
  Pressable,
  View,
  TextInput,
  Text,
  useWindowDimensions,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import React, { useState } from "react";
import { storeDetailState } from "state/state";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFonts } from "expo-font";
import Modal from "react-native-modal-web";
import { posHomeState, updatePosHomeState } from "state/posHomeState";

const AuthPasswordModal = () => {
  const { height, width } = useWindowDimensions();
  const [password, setpassword] = useState("");
  const storeDetails = storeDetailState.use();
  const [inccorectPass, setinccorectPass] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { authPasswordModal } = posHomeState.use();

  const Authorize = () => {
    if (
      (storeDetails.settingsPassword?.length > 0 &&
        storeDetails.settingsPassword === password) ||
      storeDetails.settingsPassword?.length === 0
    ) {
      updatePosHomeState({
        managerAuthorizedStatus: true,
        authPasswordModal: false,
      });
      setpassword("");
      setinccorectPass(false);
      setShowPassword(false);
    } else {
      setinccorectPass(true);
    }
  };

  const handleKeyDown = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (e.nativeEvent.key === "Enter") {
      Authorize();
    }
  };

  useFonts({
    Password: require("/assets/password.ttf"),
  });

  return (
    <Modal
      isVisible={authPasswordModal}
      animationIn="fadeIn"
      animationOut="fadeOut"
    >
      <View
        style={{
          flex: 1,
          height: "100%",
          width: "100%",
          position: "absolute",
          left: 0,
          top: 0,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={() => {
            updatePosHomeState({
              authPasswordModal: false,
              pendingAuthAction: "",
            });
          }}
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: height,
            width: width,
          }}
        >
          <Pressable>
            <div style={{ cursor: "default" }}>
              <View style={styles.container}>
                <View style={styles.topLabelSectionContainer}>
                  <Text style={styles.settingsLabel}>Manager Code</Text>
                  <Text style={styles.authorizationLabel}>Authorization</Text>
                </View>
                <View>
                  <TextInput
                    placeholder="Enter Password"
                    style={[
                      styles.passwordTxtInput,
                      !showPassword &&
                        password.length !== 0 && { fontFamily: "Password" },
                    ]}
                    value={password}
                    onChangeText={(val) => setpassword(val)}
                    textContentType="none"
                    autoCorrect={false}
                    onKeyPress={handleKeyDown}
                    autoFocus={true}
                  />
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      position: "absolute",
                      right: 5,
                      top: 0,
                    }}
                  >
                    {!showPassword ? (
                      <Ionicons
                        name="eye"
                        size={32}
                        color="rgba(74,74,74,1)"
                        onPress={() => setShowPassword((prev) => !prev)}
                      />
                    ) : (
                      <Ionicons
                        name="eye-off"
                        size={32}
                        color="rgba(74,74,74,1)"
                        onPress={() => setShowPassword((prev) => !prev)}
                      />
                    )}
                  </View>
                </View>
                {inccorectPass && (
                  <Text style={{ marginBottom: 10 }}>
                    Manager code is inccorect!
                  </Text>
                )}
                <View style={styles.bottomSectionContainer}>
                  <Pressable
                    onPress={() => {
                      Authorize();
                    }}
                    style={styles.goBtn}
                  >
                    <Text style={styles.goBtnTxt}>Enter</Text>
                  </Pressable>
                </View>
              </View>
            </div>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
};

export default AuthPasswordModal;

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,1)",
    justifyContent: "space-between",
    width: 366,
    height: 288,
  },
  topLabelSectionContainer: {
    height: 51,
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 29,
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
  },
  bottomSectionContainer: {
    width: 132,
    height: 65,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  goBtn: {
    width: 132,
    height: 36,
    backgroundColor: "#1d284e",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  goBtnTxt: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 20,
  },
  forgotPasswordTxt: {
    color: "#8b8484",
    textDecorationLine: "underline",
  },
});
