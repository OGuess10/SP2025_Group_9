import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";

//DONT NEED IT ANYMORE 
export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (loading) return; // Prevent multiple requests
    setLoading(true);
    console.log("Sign Up button clicked");

    // Call the Flask backend API for sign-up
    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          username,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("User created successfully");
        Alert.alert("Success", data.message);
        navigation.navigate("Login"); // Navigate to login screen
      } else {
        console.log("Signup error:", data.error);
        Alert.alert("Error", data.error);
      }
    } catch (error) {
      console.log("Signup error:", error.message);
      Alert.alert("Error", error.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
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
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: { width: 250, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5 },
});
