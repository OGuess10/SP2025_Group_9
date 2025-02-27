import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";

const Loading = () => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: "https://i.pinimg.com/originals/18/42/81/184281f0fe87517a950beb8112c308dd.gif" }} style={styles.loadingGif} />
    </View>
  );
<<<<<<< Updated upstream
};

const GoHome = ({navigation, userData}) => {
  useEffect(() => {
    navigation.navigate('Home', {user: userData});
=======
<<<<<<< Updated upstream
=======
};

const GoHome = ({ navigation, userData }) => {
  useEffect(() => {
    navigation.navigate('Home', { user: userData });
>>>>>>> Stashed changes
  }, []);
  return;
};

export default function LoadingScreen({ navigation, route }) {
  // Route used to get userId later
  // ex. route.params.userId

  // Retrieve user data
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/get_user?user_id=0');
        const data = await response.json();
        setUser(data); // Set the fetched data to state
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchData();
  }, []);

  if (!user) {
<<<<<<< Updated upstream
    return <Loading/>
  }
  else {
    return <GoHome navigation={navigation} userData={user}/>
  }
=======
    return <Loading />
  }
  else {
    return <GoHome navigation={navigation} userData={user} />
  }
>>>>>>> Stashed changes
>>>>>>> Stashed changes
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  loadingGif: { width: 200, height: 200 },
});
