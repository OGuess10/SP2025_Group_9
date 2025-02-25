import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, View, Text } from "react-native";
import LottieView from "lottie-react-native";
import * as Animatable from "react-native-animatable";
import { useNavigation } from "@react-navigation/native";
import tw from "../../components/tailwind";


const SplashScreen = () => {
  const navigation = useNavigation();
  const [fadeOut, setFadeOut] = useState(false);
  const animationRef = useRef(null);


  useEffect(() => {
    animationRef.current?.play();


    const fadeTimeout = setTimeout(() => {
      setFadeOut(true);
    }, 3000); // Wait 3 seconds before fade out


    const navTimeout = setTimeout(() => {
      navigation.replace("Intro");
    }, 4000); // 1 second fade-out duration


    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(navTimeout);
    };
  }, [navigation]);


  return (
    <Animatable.View
      animation={fadeOut ? "fadeOut" : "fadeIn"}
      duration={1000}
      style={tw`flex items-center justify-center bg-white w-full h-full`}
    >
      {/* Main title and animation */}
      <View style={tw`flex-row items-center`}>
        <Animatable.Text
          animation="fadeIn"
          duration={1}
          style={[tw`text-black text-4xl font-bold mr-1`, { fontsize: 12, fontFamily: "MarkerFelt-Wide" }]}
        >
         GROUP
        </Animatable.Text>
        <LottieView 
          source={require("../../assets/lottie/nine2-lottie.json")} 
          autoPlay
          loop={false}
          style={tw`w-20 h-20`} 

        />
      </View>


      {/* Subtitle */}
      {/*
      <Animatable.Text
        animation="fadeIn"
        duration={2000}
        delay={500}
        style={[tw`text-black text-lg mt-4 text-center`, { fontFamily: "Nunito_400Regular" }]}
      >
        CSE 437S
      </Animatable.Text>    */}
    </Animatable.View>
  );
};


export default SplashScreen;

