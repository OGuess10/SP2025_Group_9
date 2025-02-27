<<<<<<< Updated upstream
import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, StatusBar, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Nunito_400Regular, Nunito_700Bold } from "@expo-google-fonts/nunito";
=======
import React from "react";
import { View, Text, Button, Image, StyleSheet } from "react-native";
import { supabase } from "../../supabaseClient";

>>>>>>> Stashed changes

export default function IntroScreen({ navigation }) {
  let [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
  });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const loginScaleAnim = useRef(new Animated.Value(1)).current;
  const signUpScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in animation when screen loads
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = (animation) => {
    Animated.spring(animation, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (animation) => {
    Animated.spring(animation, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient colors={["#E8F5E9", "#FFFFFF"]} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Animated Wrapper*/}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

        {/* App Logo 
        <Image source={require("../assets/logo.png")} style={styles.logo} />*/}

        {/* App Name */}
        <Text style={styles.appName}>Eco-Something</Text>

        {/* Login Button */}
        <Animated.View style={{ transform: [{ scale: loginScaleAnim }] }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.7}
            onPressIn={() => handlePressIn(loginScaleAnim)}
            onPressOut={() => handlePressOut(loginScaleAnim)}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Sign Up Button */}
        <Animated.View style={{ transform: [{ scale: signUpScaleAnim }] }}>
          <TouchableOpacity
            style={[styles.button, styles.signUpButton]}
            onPress={() => navigation.navigate("SignUp")}
            activeOpacity={0.7}
            onPressIn={() => handlePressIn(signUpScaleAnim)}
            onPressOut={() => handlePressOut(signUpScaleAnim)}
          >
            <Text style={[styles.buttonText, styles.signUpText]}>Sign Up</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    tintColor: "#4CAF50", 
  },
  appName: {
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
    color: "#2E7D32",
    marginBottom: 40,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  button: {
    width: 220,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: "#A5D6A7", 
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    shadowColor: "#A5D6A7",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2, 
  },
  signUpButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#81C784",
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: "#1B5E20",
    textTransform: "uppercase",
  },
  signUpText: {
    color: "#1B5E20",
  },
});
