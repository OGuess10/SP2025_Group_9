import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { useAuth } from "../auth/AuthContext";

const { width, height } = Dimensions.get('window');
const BACKEND_URL = "http://127.0.0.1:5000"; // Replace with your Flask server IP

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // Cooldown timer
  const { login } = useAuth();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  let [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

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
        setOtpSent(true);
        setResendCooldown(10); // Start cooldown
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
        // alert('Login successful');
        // Store user ID to async so users don't have to login everytime
        await login(data.user.user_id.toString());
        navigation.replace("Home", { user_id: data.user.user_id });
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
    <LinearGradient colors={["#F1F8E9", "#FFFFFF"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>

        {/* Email Input */}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text.toLowerCase())}
          style={styles.input}
          placeholderTextColor="#4CAF50"
          autoCorrect={false}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* OTP Input and Buttons */}
        {!otpSent ? (
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSendOtp}
              disabled={!email || loading}
              activeOpacity={0.7}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Text style={styles.buttonText}>Send OTP</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <>
            <TextInput
              placeholder="Enter OTP"
              value={otp}
              onChangeText={setOtp}
              style={styles.input}
              keyboardType="numeric"
              placeholderTextColor="#4CAF50"
            />

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleVerifyOtp}
                disabled={!otp || loading}
                activeOpacity={0.7}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
              >
                <Text style={styles.buttonText}>Verify OTP</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Resend OTP Section */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the OTP?</Text>
              {resendCooldown > 0 ? (
                <Animated.Text style={[styles.cooldownText, { opacity: fadeAnim }]}>
                  Resend in {resendCooldown}s
                </Animated.Text>
              ) : (
                <TouchableOpacity onPress={handleSendOtp} activeOpacity={0.7}>
                  <Text style={styles.resendLink}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  formContainer: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
    color: "#2E7D32",
    marginBottom: 18,
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    fontSize: 16,
    color: "#2E7D32",
    borderColor: "#A5D6A7",
    borderWidth: 1,
    marginBottom: 14,
  },
  button: {
    width: 220,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: "#A5D6A7",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: "#1B5E20",
  },
  resendContainer: {
    marginTop: 12,
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    color: "#2E7D32",
  },
  resendLink: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "#1B5E20",
    textDecorationLine: "underline",
    marginTop: 4,
  },
  cooldownText: {
    fontSize: 14,
    color: "#A5D6A7",
    marginTop: 4,
  },
});