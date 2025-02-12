import React from "react";
import { View, Text, Button, Image, StyleSheet } from "react-native";
import tw from "tailwind-react-native-classnames"

export default function IntroScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={tw`flex-1 items-center justify-center bg-gray-200`}>
        <Text style={tw`text-xl font-bold text-blue-500`}>Hello, Tailwind!</Text>
      </View>
      <Text style={styles.appName}>Group 9 App</Text>
      <Button title="Login" onPress={() => navigation.navigate("Login")} />
      <Button title="Sign Up" onPress={() => navigation.navigate("SignUp")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  logo: { width: 150, height: 150, marginBottom: 20 },
  appName: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
});
