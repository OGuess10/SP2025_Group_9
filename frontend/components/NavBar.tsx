import React from "react";
import { View, TouchableOpacity, Animated } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import tw from "tailwind-react-native-classnames";
import { MaterialCommunityIcons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

const pastelGreen = "#A5D6A7"; 
const pastelGreenLight = "#E8F5E9"; 

export type RootStackParamList = {
  Home: { user: any };
  NavBar: undefined;
  Leaderboard: { user: any };
  Friends: { user: any };
};


const NavBar: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "NavBar">>();
  const route = useRoute();


  // Type-safe way to access `user` param
  const user = (route.params as { user?: any })?.user || null;


  const scaleAnim = new Animated.Value(1);


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


  const activePage = route.name;


  return (
    <View style={tw`flex flex-row items-center justify-between w-5/6 bg-white shadow-lg rounded-full px-5 py-3 my-4`}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[tw`p-2 rounded-lg`, activePage === "Home" && {backgroundColor: pastelGreenLight}, ]}
          onPress={() => navigation.navigate("Home", { user })}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <MaterialCommunityIcons name="tree" size={28} color={activePage === "Home" ? "#2E7D32" : "black"} />
        </TouchableOpacity>
      </Animated.View>


      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[tw`p-2 rounded-lg`, activePage === "Leaderboard" && {backgroundColor: pastelGreenLight}]}
          onPress={() => navigation.navigate("Leaderboard", { user })}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <MaterialIcons name="show-chart" size={28} color={activePage === "Leaderboard" ? "#2E7D32" : "black"} />
        </TouchableOpacity>
      </Animated.View>


      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={tw`p-2 rounded-lg`}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <FontAwesome name="camera" size={28} color="black" />
        </TouchableOpacity>
      </Animated.View>


      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={tw`p-2 rounded-lg`, activePage === "Friends" && {backgroundColor: pastelGreenLight}]}
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

