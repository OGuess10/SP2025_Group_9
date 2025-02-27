import React, { useState } from "react";
<<<<<<< Updated upstream
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Dimensions,
} from "react-native";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");
=======
<<<<<<< Updated upstream
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
>>>>>>> Stashed changes

=======
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";
import LottieView from "lottie-react-native";
import { sendOtp, verifyOtp } from "../auth/authService";

const { width, height } = Dimensions.get("window");
>>>>>>> Stashed changes
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleSendOtp = async () => {
    setLoading(true);
    try {
      await sendOtp(email);  // This will trigger Supabase to send the OTP
      setOtpSent(true);
      Alert.alert("OTP Sent", "Check your email for the OTP.");
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", error.message);
    }
  };

<<<<<<< Updated upstream
  return (
<<<<<<< Updated upstream
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
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <Button title="Login" onPress={handleLogin} />
      </View>
=======
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Login" onPress={handleLogin} />
=======

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
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
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
>>>>>>> Stashed changes
>>>>>>> Stashed changes
    </View>
  );
}
const styles = StyleSheet.create({
<<<<<<< Updated upstream
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
=======
<<<<<<< Updated upstream
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: { width: 250, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5 },
>>>>>>> Stashed changes
});
=======
  mainContainer: {
    flex: 1,
  },
  lottie: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: height * 0.31,
    transform: [{ scaleY: -1 }],
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
});
>>>>>>> Stashed changes
