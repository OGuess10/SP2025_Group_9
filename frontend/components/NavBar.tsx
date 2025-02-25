import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import tw from "tailwind-react-native-classnames";
import { MaterialCommunityIcons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

export type RootStackParamList = {
  Home: { user: any };
  NavBar: undefined;
};

const NavBar: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "NavBar">>();
  const route = useRoute();

  // Type-safe way to access `user` param
  const user = (route.params as { user?: any })?.user || null;

  return (
    <View style={tw`flex flex-row items-center justify-center my-4 w-5/6 bg-white shadow-lg h-16 px-4`}>
      <TouchableOpacity
        style={tw`bg-white m-2 p-2 rounded-lg`}
        onPress={() => navigation.navigate("Home", { user })}
      >
        <MaterialCommunityIcons name="tree" size={32} color="black" />
      </TouchableOpacity>
      <TouchableOpacity
        style={tw`bg-white m-2 p-2 rounded-lg`}
        onPress={() => navigation.navigate("Leaderboard", { user })}
      >
        <MaterialIcons name="show-chart" size={32} color="black" />
      </TouchableOpacity>
      <TouchableOpacity
        style={tw`bg-white m-2 p-2 rounded-lg`}
      >
        <FontAwesome name="camera" size={32} color="black" />
      </TouchableOpacity>
      <TouchableOpacity
        style={tw`bg-white m-2 p-2 rounded-lg`}
        onPress={() => navigation.navigate("Friends", { user })}
      >
        <MaterialIcons name="people" size={32} color="black" />
      </TouchableOpacity>
      <TouchableOpacity
        style={tw`bg-white m-2 p-2 rounded-lg`}
      >
        <FontAwesome name="bars" size={32} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default NavBar;
