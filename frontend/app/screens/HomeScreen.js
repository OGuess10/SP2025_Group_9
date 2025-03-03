import React, { useState, useRef, useEffect } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, Animated } from "react-native";
import GrowingTree from "../../components/GrowingTree";
import { Image } from "expo-image";
import NavBar from "../../components/NavBar";
import tw from "../../components/tailwind";
import { StatusBar } from "react-native";


const pastelGreen = "#A5D6A7";
const pastelGreenLight = "#E8F5E9";


const HomeScreen = ({ route, navigation }) => {
  const { user } = route.params;
  const [points, setPoints] = useState(user?.points || 0);


  // Button animation
  const scaleAnim = useRef(new Animated.Value(1)).current;


  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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


  const imageMap = {
    kangaroo: require("../../assets/user_icons/kangaroo.png"),
    koala: require("../../assets/user_icons/koala.png"),
    sloth: require("../../assets/user_icons/sloth.png"),
    default: require("../../assets/user_icons/sloth.png"),
  };


  return user ? (
    <SafeAreaView style={[tw`flex items-center w-full h-full`, { backgroundColor: "#FFFFFF" }]}>
      <StatusBar barStyle="light-content" />

      {/* Profile Picture*/}
      <View style={[tw`mt-6 mb-4 rounded-full p-3 shadow-md`, { backgroundColor: pastelGreenLight }]}>
        <Image style={tw`w-20 h-20`} source={imageMap[user.icon] || imageMap["default"]} />
      </View>


      {/* Points Display & Title */}
      <Text style={[tw`text-3xl mt-2`, { fontFamily: "Nunito_700Bold", color: "#2E7D32" }]}>
        Your Tree
      </Text>
      <Text style={[tw`text-lg mb-4`, { fontFamily: "Nunito_400Regular", color: "#1B5E20" }]}>
        Points: {points}
      </Text>


      {/* Tree Display */}
      <View style={[tw`w-5/6 rounded-xl shadow-lg items-center p-5`, { backgroundColor: pastelGreenLight }]}>
        <GrowingTree seed={12345} points={points} />
      </View>


      {/* Earn Points Button 
      <Animated.View style={[tw`mt-5 w-5/6`, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={[tw`w-full py-4 rounded-full shadow-md`, { backgroundColor: pastelGreen }]}
          activeOpacity={0.7}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => setPoints(prev => Math.min(prev + 100, 1000))}
        >
          <Text style={[tw`text-lg uppercase`, { fontFamily: "Nunito_700Bold", color: "#1B5E20" }]}>
            Earn Points
          </Text>
        </TouchableOpacity>
      </Animated.View>*/}


      {/* Navigation Bar */}
      <NavBar user={user} />
    </SafeAreaView>
  ) : (
    <View></View>
  );
};


export default HomeScreen;

