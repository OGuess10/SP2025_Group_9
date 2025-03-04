import React, { useState, useEffect } from "react";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { supabase } from "../supabaseClient";
import { Session } from "@supabase/supabase-js";
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from "react-native";
import { useAuth } from "../app/auth/AuthContext";

import SplashScreenComponent from "./screens/SplashScreen";
import IntroScreen from "./screens/IntroScreen";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import LoadingScreen from "./screens/LoadingScreen";
import HomeScreen from "./screens/HomeScreen";
import Leaderboard from "./screens/Leaderboard";
import Friends from "./screens/Friends";
import Activity from "./screens/Activity";


import { useFonts, Nunito_400Regular, Nunito_700Bold } from "@expo-google-fonts/nunito";


const Stack = createStackNavigator();


const StackNavigator = () => {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
  });
  // const [isAuthenticated, setIsAuthenticated] = useState(null);
  // const [userID, setUserID] = useState(null);
  
  const { isAuthenticated, userId } = useAuth();

  useEffect(() => {
    async function prepare() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, [fontsLoaded]);

  // useEffect(() => {
  //   const checkAuthentication = async () => {
  //     try {
  //       const token = await AsyncStorage.getItem("userID");
  //       setIsAuthenticated(!!token); // If token exists, user is authenticated
  //       setUserID(token);
  //     } catch (error) {
  //       console.error("Error checking authentication:", error);
  //       setIsAuthenticated(false);
  //     }
  //   };

  //   checkAuthentication();
  // }, []);

  if (isAuthenticated === null || !fontsLoaded) {
    return <ActivityIndicator size="large" color="#1B5E20" />; // Show loading spinner
  }

  console.log("user id: " + userId);

  return (
      <Stack.Navigator 
        screenOptions={{ headerShown: false }} 
        initialRouteName={isAuthenticated === null ? "Loading" : isAuthenticated ? "Home" : "Intro"}
      >
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Home" component={HomeScreen} initialParams={{ user_id: userId }} />
        <Stack.Screen name="Leaderboard" component={Leaderboard} />
        <Stack.Screen name="Friends" component={Friends} />
        <Stack.Screen name="Activity" component={Activity} />
      </Stack.Navigator>
  );
}

export default StackNavigator;
