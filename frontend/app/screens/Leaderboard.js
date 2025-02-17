import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Touchable } from 'react-native';
import GrowingTree from '../../components/GrowingTree';
import tw from "../../components/tailwind";
import { Image } from 'expo-image';
import NavBar from '../../components/NavBar';

const Leaderboard = ({route, navigation}) => {
  const [points, setPoints] = useState(0);
  const addPoints = () => setPoints(prev => Math.min(prev + 100, 1000));
  const subPoints = () => setPoints(prev => Math.max(prev - 100, 0));

  const {user} = route.params;
  const imageMap = {
    "kanagroo": require("../../assets/user_icons/kangaroo.png"),
    "koala": require("../../assets/user_icons/koala.png"),
    "sloth": require("../../assets/user_icons/sloth.png"),
    "default": require("../../assets/user_icons/sloth.png")
  };

  return (
    user ? 
    <SafeAreaView style={tw`flex items-center justify-between bg-white w-full h-full`}>
      <View style={tw`rounded-full m-2 p-2 bg-white shadow-lg`}>
        <Image style={tw`w-12 h-12`} source={imageMap[user.icon] || imageMap["default"]}/>
      </View>
      <View style={tw`flex w-5/6 h-3/4 justify-center`}>
        <View style={tw`flex flex-row items-center justify-between my-2`}>
          <Text style={[tw`text-3xl`, {fontFamily: "Nunito_700Bold"}]}>Your Activity</Text>
          <Text style={[tw`text-lg`, {fontFamily: "Nunito_400Regular"}]}>Points: {user.points}</Text>
        </View>
        <View style={tw`rounded-lg bg-white shadow-lg items-center h-5/6`}>
          <GrowingTree seed={12345} points={user.points}/>
        </View>
      </View>
      <NavBar user={user}/>
    </SafeAreaView>
    :
    <View></View>
  );
};

export default Leaderboard;
