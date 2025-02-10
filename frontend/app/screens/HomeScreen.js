import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  const [test, setTest] = useState("");
  useEffect(() => {
    fetch('http://127.0.0.1:5000/')
    .then(response => response.json())
    .then(data => setTest(data.message));
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Home Page</Text>
      <Text>{test}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold" },
});
