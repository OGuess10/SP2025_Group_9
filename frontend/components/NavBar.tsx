import React, { useState } from "react";
import { View, TouchableOpacity, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import tw from "tailwind-react-native-classnames";
import { MaterialCommunityIcons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";

const pastelGreen = "#A5D6A7";
const pastelGreenLight = "#E8F5E9";

type RootStackParamList = {
  Home: { user: any };
  Leaderboard: { user: any };
  Friends: { user: any };
  Activity: { user: any };
};

const NavBar: React.FC<{ user: any }> = ({ user }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [scaleAnim] = useState(new Animated.Value(1));

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

  const buttons = [
    { name: "Home", icon: <MaterialCommunityIcons name="tree" size={28} />, route: "Home" },
    { name: "Leaderboard", icon: <MaterialIcons name="show-chart" size={28} />, route: "Leaderboard" },
    { name: "Activity", icon: <AntDesign name="pluscircleo" size={24} />, route: "Activity" },
    { name: "Friends", icon: <MaterialIcons name="people" size={28} />, route: "Friends" },
  ];

  return (
    <View style={tw`flex flex-row items-center justify-between w-5/6 bg-white shadow-lg rounded-full px-5 py-3 my-4`}>
      {buttons.map(({ name, icon, route }) => {
        const isActive = route === name;

        return (
          <Animated.View key={name} style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[tw`p-2 rounded-lg`, isActive && { backgroundColor: pastelGreenLight }]}
              onPress={() => navigation.navigate(route as keyof RootStackParamList, { user })}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              {React.cloneElement(icon, { color: isActive ? "#2E7D32" : "black" })}
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity style={tw`p-2 rounded-lg`}>
          <FontAwesome name="bars" size={28} color="black" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default NavBar;