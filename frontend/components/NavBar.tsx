import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import tw from "tailwind-react-native-classnames";
import { MaterialCommunityIcons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../app/auth/AuthContext";

const pastelGreen = "#A5D6A7";
const pastelGreenLight = "#E8F5E9";

export type RootStackParamList = {
  Home: { user: any };
  NavBar: undefined;
  Leaderboard: { user: any };
  Friends: { user: any };
  Activity: { user: any };
};


const NavBar: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "NavBar">>();
  const route = useRoute();


  // Type-safe way to access `user` param
  const user = (route.params as { user?: any })?.user || null;


  const scaleAnim = new Animated.Value(1);

  const { logout } = useAuth();


  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };


  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  // const handleLogout = async () => {
  //   Alert.alert("Logout", "Are you sure you want to log out?", [
  //     { text: "Cancel", style: "cancel" },
  //     { 
  //       text: "Logout", 
  //       onPress: async () => {
  //         try {
  //           await AsyncStorage.removeItem("userId");
  //           navigation.navigate("Intro"); // Redirect to Intro screen
  //         } catch (error) {
  //           console.error("Error logging out:", error);
  //         }
  //       }
  //     }
  //   ]);
  // };
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        onPress: async () => {
          await logout(); // Calls useAuth logout instead of AsyncStorage directly
          navigation.navigate("Intro"); 
        }
      }
    ]);
  };
  


  const activePage = route.name;


  return (
    <View style={tw`flex flex-row items-center justify-between w-5/6 bg-white shadow-lg rounded-full px-5 py-3 my-4`}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[tw`p-2 rounded-lg`, activePage === "Home" && { backgroundColor: pastelGreenLight },]}
          onPress={() => navigation.navigate("Home", { user })}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <MaterialCommunityIcons name="tree" size={28} color={activePage === "Home" ? "#2E7D32" : "black"} />
        </TouchableOpacity>
      </Animated.View>


      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[tw`p-2 rounded-lg`, activePage === "Leaderboard" && { backgroundColor: pastelGreenLight }]}
          onPress={() => navigation.navigate("Leaderboard", { user })}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <MaterialIcons name="show-chart" size={28} color={activePage === "Leaderboard" ? "#2E7D32" : "black"} />
        </TouchableOpacity>
      </Animated.View>


      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[tw`p-2 rounded-lg`, activePage === "Activity" && { backgroundColor: pastelGreenLight }]}
          onPress={() => navigation.navigate("Activity", { user })}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <AntDesign name="pluscircleo" size={24} color={activePage === "Activity" ? "#2E7D32" : "black"} />
        </TouchableOpacity>
      </Animated.View>


      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[tw`p-2 rounded-lg`, activePage === "Friends" && { backgroundColor: pastelGreenLight }]}
          onPress={() => navigation.navigate("Friends", { user })}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <MaterialIcons name="people" size={28} color={activePage === "Friends" ? "#2E7D32" : "black"} />
        </TouchableOpacity>
      </Animated.View>


      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={tw`p-2 rounded-lg`}
          onPress={handleLogout}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <FontAwesome name="bars" size={28} color="black" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};


export default NavBar;

