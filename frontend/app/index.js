import React, { useState, useEffect } from "react";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { supabase } from "../supabaseClient";
import { Session } from "@supabase/supabase-js";
import * as SplashScreen from 'expo-splash-screen';

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


export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
  });


  useEffect(() => {
    async function prepare() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, [fontsLoaded]);


  if (!fontsLoaded) {
    return null;
  }


  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreenComponent} />
      <Stack.Screen
        name="Intro"
        component={IntroScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
        }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
        }}
      />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen
        name="Loading"
        component={LoadingScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
        }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
        }}
      />
      <Stack.Screen name="Leaderboard" component={Leaderboard} />
      <Stack.Screen name="Friends" component={Friends} />
      <Stack.Screen name="Activity" component={Activity} />
    </Stack.Navigator>
  );
}

