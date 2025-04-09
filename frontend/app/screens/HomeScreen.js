import React, { useState, useRef, useEffect } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, Animated } from "react-native";
import GrowingTree from "../../components/GrowingTree";
import { Image } from "expo-image";
import NavBar from "../../components/NavBar";
import tw from "../../components/tailwind";
import { StatusBar } from "react-native";
import { Pencil } from "lucide-react-native";
import { useFocusEffect } from '@react-navigation/native';



const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

const pastelGreen = "#A5D6A7";
const pastelGreenLight = "#E8F5E9";


const HomeScreen = ({ route, navigation }) => {
  const { user_id } = route.params;
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [friendCount, setFriendCount] = useState(0);



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

  useFocusEffect(
    React.useCallback(() => {
      const fetchUserData = async () => {
        try {
          // Get user info
          const response = await fetch(`${BACKEND_URL}/user/get_user?user_id=${user_id}`);
          const data = await response.json();
          if (response.ok) {
            setUser(data);
            setPoints(data.points);
          }

          // Get action count
          const actionRes = await fetch(`${BACKEND_URL}/action/get_action_count?user_id=${user_id}`);
          const actionData = await actionRes.json();
          if (actionRes.ok) {
            setPostCount(actionData.count);
          }

          // Get friend count
          const friendsRes = await fetch(`${BACKEND_URL}/user/get_friends?user_id=${user_id}`);
          const friendData = await friendsRes.json();
          if (friendsRes.ok && Array.isArray(friendData.friend_ids)) {
            setFriendCount(friendData.friend_ids.length);
          }

        } catch (error) {
          Alert.alert("Error", "Failed to load user data.");
          console.error(error);
        }
      };

      fetchUserData();

    }, [user_id])
  );


  const imageMap = {
    kangaroo: require("../../assets/user_icons/kangaroo.png"),
    koala: require("../../assets/user_icons/koala.png"),
    sloth: require("../../assets/user_icons/sloth.png"),
    default: require("../../assets/user_icons/sloth.png"),
  };


  return user ? (
    <SafeAreaView style={[tw`flex items-center w-full h-full`, { backgroundColor: "#FFFFFF" }]}>
      <StatusBar barStyle="light-content" />

      {/* Header: Profile and Stats */}
      <View style={tw`flex-row items-center justify-between mt-6 px-6`}>
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate("ChangeUsername", { user })}
            style={[tw`rounded-full p-2 shadow-md`, { backgroundColor: pastelGreenLight }]}
          >
            <Image
              style={tw`w-20 h-20 rounded-full`}
              source={imageMap[user.icon] || imageMap["default"]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("ChangeUsername", { user })}
            style={[tw`absolute`, { bottom: 5, left: 75, backgroundColor: pastelGreenLight, borderRadius: 999, padding: 4 }]}
          >
            <Pencil size={18} color="#1B5E20" />
          </TouchableOpacity>
        </View>

        <View style={tw`flex-row justify-around flex-1 ml-6`}>
          <TouchableOpacity
            onPress={() => navigation.navigate("UserPhotos", { userId: user.user_id })}
            style={tw`items-center`}
          >
            <Text style={[tw`text-xl font-bold`, { fontFamily: "Nunito_700Bold" }]}>{postCount}</Text>
            <Text style={[tw`text-sm`, { fontFamily: "Nunito_400Regular" }]}>Actions</Text>
          </TouchableOpacity>

          <View style={tw`items-center`}>
            <Text style={[tw`text-xl font-bold`, { fontFamily: "Nunito_700Bold" }]}>{friendCount}</Text>
            <Text style={[tw`text-sm`, { fontFamily: "Nunito_400Regular" }]}>Friends</Text>
          </View>
        </View>
      </View>

      {/* Username */}
      <View style={tw`w-full px-12 mt-2 items-start`}>
        <Text style={[tw`text-lg`, { fontFamily: "Nunito_700Bold", color: "#1B5E20" }]}>
          {user.user_name}
        </Text>
      </View>




      {/* Tree Display */}
      <View style={[tw`w-5/6 rounded-xl shadow-lg items-start p-3 mt-6`, { backgroundColor: pastelGreenLight }]}>


        {/* Top Row: Points + Share */}
        <View style={tw`flex-row justify-between items-center w-full mb-4`}>
          <Text style={[tw`text-lg`, { fontFamily: "Nunito_400Regular", color: "#1B5E20" }]}>
            Points: {points}
          </Text>

          <TouchableOpacity
            onPress={() => console.log("Share My Tree")}
            style={tw`px-4 py-2.5 rounded-full border border-gray-300 bg-white`}
          >
            <Text style={[tw`text-sm`, { fontFamily: "Nunito_600SemiBold", color: "#1B5E20" }]}>
              Share
            </Text>
          </TouchableOpacity>
        </View>


        <GrowingTree seed={12345} points={points} />
      </View>

      <NavBar user={user} />

    </SafeAreaView>
  ) : (
    <View>
    </View>
  );
};


export default HomeScreen;

