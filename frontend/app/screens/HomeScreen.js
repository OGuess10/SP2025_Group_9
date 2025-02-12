import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GrowingTree from '../../components/GrowingTree';
import tw from "../../components/tailwind";
import { Image } from 'expo-image';

const HomeScreen = ({route, navigation}) => {
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
    <SafeAreaView style={tw`flex items-center justify-center bg-white w-full h-full`}>
      <View style={tw`rounded-full m-4 p-2 bg-white shadow-lg`}>
        <Image style={tw`w-12 h-12`} source={imageMap[user.icon] || imageMap["default"]}/>
      </View>
      <View style={tw`flex flex-row items-center justify-between m-2 w-3/4`}>
        <Text style={[tw`text-3xl`, {fontFamily: "Nunito_700Bold"}]}>Your Tree</Text>
        <Text style={[tw`text-lg`, {fontFamily: "Nunito_400Regular"}]}>Points: {user.points}</Text>
      </View>
      <View style={styles.treeContainer}>
        <GrowingTree seed={12345} points={points} width={300} height={200} />
      </View>
      <Text style={styles.pointsText}>Points: {points}</Text>
      <TouchableOpacity style={styles.button} onPress={addPoints}>
        <Text style={styles.buttonText}>Add Points</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={subPoints}>
        <Text style={styles.buttonText}>Sub Points</Text>
      </TouchableOpacity>
    </SafeAreaView>
    :
    <View></View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center',},
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  treeContainer: { borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
  pointsText: { fontSize: 20, marginTop: 20, },
  button: { marginTop: 20, backgroundColor: '#00796b', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default HomeScreen;
