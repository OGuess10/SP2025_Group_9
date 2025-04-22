import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

const Loading = () => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: "https://i.pinimg.com/originals/18/42/81/184281f0fe87517a950beb8112c308dd.gif" }} style={styles.loadingGif} />
    </View>
  );
};

const GoHome = ({ navigation, userData }) => {
  useEffect(() => {
    navigation.navigate('Home', { user_id: userData.user_id });
  }, []);
  return null;
};



export default function LoadingScreen({ navigation, route }) {
  // For instance, route.params might contain the authenticated user's id.
  const userId = route.params?.userId;
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Use /user/get_user endpoint
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/user/get_user?user_id=${userId}`);
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    };
    fetchData();
  }, [userId]);

  if (!user) {
    return <Loading />;
  } else {
    return <GoHome navigation={navigation} userData={user} />;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  loadingGif: { width: 200, height: 200 },
});
