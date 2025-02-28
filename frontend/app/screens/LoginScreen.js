import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Dimensions,
} from "react-native";
import LottieView from "lottie-react-native";
import { sendOtp, verifyOtp } from "../auth/Auth_Api";

const { width, height } = Dimensions.get("window");
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleSendOtp = async () => {
    setLoading(true);
    try {
      await sendOtp(email);  // Trigger Supabase to send the OTP
      setOtpSent(true);
      Alert.alert("OTP Sent", "Check your email for the OTP.");
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", error.message);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const result = await verifyOtp(email, otp);
      setLoading(false);

      if (result.success) {
        Alert.alert("Login Successful", result.message);
        navigation.replace("Home"); // Navigate to Home screen
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* Lottie Animation pinned to the very top */}
      <LottieView
        source={require("../../assets/lottie/login-background.json")}
        autoPlay
        loop
        style={styles.lottie}
      />

      {/* Login Form placed below the animation */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        {!otpSent ? (
          <Button title="Send OTP" onPress={handleSendOtp} disabled={loading || !email} />
        ) : (
          <>
            <TextInput
              placeholder="Enter OTP"
              value={otp}
              onChangeText={setOtp}
              style={styles.input}
              keyboardType="numeric"
            />
            <Button title="Verify OTP" onPress={handleVerifyOtp} disabled={!otp} />
          </>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  lottie: {
    position: "absolute", // Use absolute positioning
    top: 0,             // Pin to the top edge
    left: 0,
    width: width,       // Full screen width
    height: height * 0.31, // 40% of the screen height (adjust as needed)
    transform: [{ scaleY: -1 }],
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: height * 0.1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: 250,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: { width: 250, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5 },
});
