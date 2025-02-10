import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  const [user, setUser] = useState([]);
  useEffect(() => {
    fetch('http://127.0.0.1:5000/get_user?user_id=0')
    .then(response => response.json())
    .then(data => setUser(data));
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Home Page</Text>
      <Text>Username: {user.user_name}</Text>
      <Text>Points: {user.points}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold" },
});
