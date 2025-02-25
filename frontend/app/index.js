import React, { useState, useEffect } from "react";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import * as SplashScreen from 'expo-splash-screen';


import SplashScreenComponent from "./screens/SplashScreen"; 
import IntroScreen from "./screens/IntroScreen";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import LoadingScreen from "./screens/LoadingScreen";
import HomeScreen from "./screens/HomeScreen";
import Leaderboard from "./screens/Leaderboard";


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
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Loading" component={LoadingScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Leaderboard" component={Leaderboard} />
    </Stack.Navigator>
  );
}

