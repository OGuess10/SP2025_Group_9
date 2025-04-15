import React, { useState, useRef, useEffect } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, Animated, Alert } from "react-native";
import GrowingTree from "../../components/GrowingTree";
import { Image } from "expo-image";
import NavBar from "../../components/NavBar";
import tw from "../../components/tailwind";
import { StatusBar } from "react-native";
import { Pencil } from "lucide-react-native";
import { useFocusEffect } from '@react-navigation/native';
import { Modal } from "react-native";
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { FontAwesome5 } from '@expo/vector-icons';
import Avatar, { genConfig } from "@zamplyy/react-native-nice-avatar";





const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

const pastelGreen = "#A5D6A7";
const pastelGreenLight = "#E8F5E9";


const HomeScreen = ({ route, navigation }) => {
  const { user_id } = route.params;
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [friendCount, setFriendCount] = useState(0);
  const [showFriends, setShowFriends] = useState(false);
  const [friendsList, setFriendsList] = useState([]);


  const [showShareModal, setShowShareModal] = useState(false);
  const viewShotRef = useRef();

  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.log("Share error", error);
    }
  };

  const handleSaveToPhotos = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please allow media access to save photos.");
        return;
      }
      const uri = await viewShotRef.current.capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Success!", "Photo has been saved! 📸");
    } catch (error) {
      console.log("Save error", error);
    }
  };

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
          const friendsRes = await fetch(`${BACKEND_URL}/user/get_accepted_friends?user_id=${user_id}`);
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
  const isDefaultIcon = user?.icon && ["koala", "kangaroo", "sloth", "default"].includes(user.icon);
  const isCustomAvatar = user?.icon && typeof user.icon === "string" && user.icon.trim().startsWith("{"

  );

  let avatarConfig = {};
  try {
    avatarConfig = isCustomAvatar ? JSON.parse(user.icon) : {};
  } catch (e) {
    avatarConfig = {};
  }

  const avatarBgColor = isDefaultIcon
    ? "#FFFFFF"
    : (avatarConfig?.bgColor || "#FFFFFF");


  return user ? (
    <SafeAreaView style={[tw`flex items-center w-full h-full`, { backgroundColor: "#FFFFFF" }]}>
      <StatusBar barStyle="light-content" />
      <View style={tw`flex-row items-center justify-between mt-6 px-6`}>
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate("ChangeUsername", { user })}
            style={[
              tw`rounded-full m-2 p-2 shadow-lg`,
              { backgroundColor: avatarBgColor }
            ]}
          >
            <View style={tw`w-20 h-20 rounded-full overflow-hidden`}>
              {isDefaultIcon ? (
                <Image
                  source={imageMap[user.icon] || imageMap["default"]}
                  style={tw`w-full h-full`}
                  resizeMode="cover"
                />
              ) : (
                <Avatar
                  style={tw`w-full h-full`}
                  {...avatarConfig}
                />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("ChangeUsername", { user })}
            style={[tw`absolute`, { bottom: 5, left: 75, backgroundColor: pastelGreenLight, borderRadius: 999, padding: 4 }]}
          >
            <Pencil size={18} color="#1B5E20" />
          </TouchableOpacity>
        </View>

        <View style={tw`flex-row justify-around flex-1 ml-6`}>
          <TouchableOpacity onPress={() => navigation.navigate("UserPhotos", { userId: user.user_id })} style={tw`items-center`}>
            <Text style={[tw`text-xl font-bold`, { fontFamily: "Nunito_700Bold" }]}>{postCount}</Text>
            <Text style={[tw`text-sm`, { fontFamily: "Nunito_400Regular" }]}>Actions</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("UserFriends", { userId: user.user_id })} style={tw`items-center`}>
            <Text style={[tw`text-xl font-bold`, { fontFamily: "Nunito_700Bold" }]}>{friendCount}</Text>
            <Text style={[tw`text-sm`, { fontFamily: "Nunito_400Regular" }]}>Friends</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Username and Help Button*/}
      <View style={tw`w-full px-10 mt-2 flex-row justify-between`}>
        <Text style={[tw`text-lg`, { fontFamily: "Nunito_700Bold", color: "#1B5E20" }]}>{user.user_name}</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Onboarding", { user_id: user.user_id })} style={[tw`items-center shadow-lg`, { backgroundColor: "#fff", borderRadius: 999 }]}>
          <Text style={[tw`text-xl font-bold px-2`, { fontFamily: "Nunito_700Bold", color: "#1B5E20" }]}>?</Text>
        </TouchableOpacity>
      </View>

      {/* Tree Display */}
      <View style={[tw`w-5/6 rounded-xl shadow-lg items-start p-3 mt-6`, { backgroundColor: pastelGreenLight }]}>
        <View style={tw`flex-row justify-between items-center w-full mb-4`}>
          <Text style={[tw`text-lg`, { fontFamily: "Nunito_400Regular", color: "#1B5E20" }]}>Points: {points}</Text>
          <TouchableOpacity onPress={() => setShowShareModal(true)} style={tw`px-2 py-2 rounded-lg `}>
            <FontAwesome5 name="download" size={16} color="#1B5E20" />
          </TouchableOpacity>
        </View>
        <GrowingTree seed={12345} points={points} />
      </View>

      <NavBar user={user} />

      {/* Share Modal */}
      <Modal visible={showShareModal} animationType="slide" transparent={true}>
        <View style={tw`flex-1 justify-center items-center bg-white px-4`}>
          <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1.0 }} style={[tw`rounded-xl shadow-lg`, { backgroundColor: pastelGreenLight }]}>
            <View style={tw`p-4 rounded-lg shadow-lg`}>
              <Text style={[tw`text-xl`, { fontFamily: "Nunito_700Bold" }]}>{user.user_name}'s Tree</Text>
              <Text style={[tw`text-base`, { fontFamily: "Nunito_400Regular", color: "#1B5E20" }]}>Points: {points}</Text>
              <GrowingTree seed={12345} points={points} />
            </View>
            <View style={tw`flex-row justify-between items-center`}>
              <Text style={[tw`text-xs text-gray-600 py-3 px-3`, { fontFamily: "Nunito_400Regular", fontStyle: "italic" }]}>
                {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </View>
          </ViewShot>

          <TouchableOpacity style={tw`mt-6 w-5/6 py-3 bg-green-100 rounded-lg shadow-lg items-center`} onPress={handleShare}>
            <Text style={[tw`text-base`, { fontFamily: "Nunito_600SemiBold" }]}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={tw`mt-4 w-5/6 py-3 bg-blue-100 rounded-lg shadow-lg items-center`} onPress={handleSaveToPhotos}>
            <Text style={[tw`text-base`, { fontFamily: "Nunito_600SemiBold" }]}>Save to Photos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={tw`mt-4 w-5/6 py-3 bg-gray-100 rounded-lg shadow-lg items-center`} onPress={() => setShowShareModal(false)}>
            <Text style={[tw`text-base`, { fontFamily: "Nunito_600SemiBold" }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  ) : (
    <View />
  );
};

export default HomeScreen;
