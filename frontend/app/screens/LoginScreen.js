import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const BACKEND_URL = "http://127.0.0.1:5000";  // Replace with your Flask server IP

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle send OTP
  const handleSendOtp = async () => {
    if (!email) {
      alert('Email is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);  // OTP sent, show OTP input
        alert('OTP sent successfully!');
      } else {
        alert(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Something went wrong, please try again');
    } finally {
      setLoading(false);
    }
  };

  // Handle verify OTP
  const handleVerifyOtp = async () => {
    if (!otp || !email) {
      alert('Please enter both email and OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/verify_otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Login successful');
        // Handle successful login, e.g., navigate to another screen
      } else {
        alert(data.error || 'Invalid or expired OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Something went wrong, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* Login Form */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        {!otpSent ? (
          <Button title="Send OTP" onPress={handleSendOtp} disabled={!email || loading} />
        ) : (
          <>
            <TextInput
              placeholder="Enter OTP"
              value={otp}
              onChangeText={setOtp}
              style={styles.input}
              keyboardType="numeric"
            />
            <Button title="Verify OTP" onPress={handleVerifyOtp} disabled={!otp || loading} />
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
});