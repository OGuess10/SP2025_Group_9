import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";

export default function LoadingScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace("Home");
    }, 5000); // Simulating a 5-second loading time
  }, []);

  return (
    <View style={styles.container}>
      <Image source={{ uri: "https://i.pinimg.com/originals/18/42/81/184281f0fe87517a950beb8112c308dd.gif" }} style={styles.loadingGif} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  loadingGif: { width: 200, height: 200 },
});
