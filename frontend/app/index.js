<<<<<<< Updated upstream
import React, { useState, useEffect } from "react";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import * as SplashScreen from 'expo-splash-screen';
=======
<<<<<<< Updated upstream
import React from "react";
=======
import React, { useState, useEffect } from "react";
>>>>>>> Stashed changes
import { createStackNavigator } from "@react-navigation/stack";
>>>>>>> Stashed changes


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
<<<<<<< Updated upstream
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreenComponent} />
      <Stack.Screen
        name="Intro"
        component={IntroScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter, 
        }}
      />
=======
<<<<<<< Updated upstream
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
=======
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Intro" component={IntroScreen} />
>>>>>>> Stashed changes
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Loading" component={LoadingScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Leaderboard" component={Leaderboard} />
<<<<<<< Updated upstream
      <Stack.Screen name="Friends" component={Friends} />
      <Stack.Screen name="Activity" component={Activity} />
    </Stack.Navigator>
=======
    </Stack.Navigator>
>>>>>>> Stashed changes
>>>>>>> Stashed changes
  );
}

