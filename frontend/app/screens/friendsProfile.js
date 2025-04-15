import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import tw from "../../components/tailwind";
import Avatar from "@zamplyy/react-native-nice-avatar";
import { FontAwesome5 } from '@expo/vector-icons';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

const imageMap = {
  default: require("../../assets/user_icons/sloth.png"),
  sloth: require("../../assets/user_icons/sloth.png"),
  koala: require("../../assets/user_icons/koala.png"),
  kangaroo: require("../../assets/user_icons/kangaroo.png"),
};

const UserIcon = ({ icon, size = 80 }) => {
  const iconKey = icon || "default";
  const isDefault = ["koala", "kangaroo", "sloth", "default"].includes(iconKey);

  let avatarConfig = null;
  if (!isDefault && typeof icon === "string" && icon.trim().startsWith("{")) {
    try {
      avatarConfig = JSON.parse(icon);
    } catch (e) {
      console.warn("Invalid avatar JSON:", icon);
    }
  }

  return isDefault ? (
    <Image
      source={imageMap[iconKey] || imageMap.default}
      style={[tw`rounded-full`, { width: size, height: size }]}
      resizeMode="cover"
    />
  ) : (
    avatarConfig && <Avatar style={{ width: size, height: size }} {...avatarConfig} />

  );
};

export default function FriendsProfile({ route, navigation }) {
  const { userId, currentUserId } = route.params;

  const [userInfo, setUserInfo] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/user/get_user?user_id=${userId}`);
          const info = await res.json();
          setUserInfo(info);
      
          if (userId === currentUserId) {
            setIsFriend(true);
            const photoRes = await fetch(`${BACKEND_URL}/action/get_user_photos?user_id=${userId}`);
            const photoData = await photoRes.json();
            setPhotos(photoData.photos);
            return;
          }
      
          const friendsRes = await fetch(`${BACKEND_URL}/user/get_accepted_friends?user_id=${currentUserId}`);
          const friendData = await friendsRes.json();
      
          if (friendData.friend_ids.includes(userId)) {
            setIsFriend(true);
            const photoRes = await fetch(`${BACKEND_URL}/action/get_user_photos?user_id=${userId}`);
            const photoData = await photoRes.json();
            setPhotos(photoData.photos);
          }
      
        } catch (err) {
          console.error("Error loading profile data:", err);
        } finally {
          setLoading(false);
        }
      };
      

    loadData();
  }, [userId, currentUserId]);

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-white`}>
        <ActivityIndicator size="large" color="#1B5E20" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 justify-center items-center bg-white`}>
      <View style={tw`bg-white justify-center items-center p-6 shadow-lg w-5/6 h-5/6 rounded-lg`}>
      

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={tw`absolute top-4 left-4 p-2`}
        >
          <FontAwesome5 name="chevron-left" size={20} color="#1B5E20" />
        </TouchableOpacity>

        
        {/* Icon in background circle */}
        <View
  style={[
    tw`rounded-full mb-4 shadow-lg items-center justify-center`,
    {
      width: 80,
      height: 80,
      backgroundColor: (() => {
        const iconKey = userInfo?.icon || "default";
        const isDefault = ["koala", "kangaroo", "sloth", "default"].includes(iconKey);
        if (isDefault) return "#FFFFFF";
        try {
          const parsed = typeof iconKey === "string" ? JSON.parse(iconKey) : iconKey;
          return parsed?.bgColor || "#FFFFFF";
        } catch {
          return "#FFFFFF";
        }
      })(),
    }
  ]}
>
  <UserIcon icon={userInfo?.icon} size={64} />
</View>


        {/* Username */}
        <Text style={tw`text-xl font-bold mb-2`}>{userInfo?.user_name}</Text>


        {/* Points */}
        <Text style={tw`text-gray-600 mb-10`}>Points: {userInfo?.points}</Text>

        {/* Photos (if friends) */}
            <FlatList
              data={photos}
              numColumns={3}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={tw`mb-4`}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: `${BACKEND_URL}/action/get_images/${item.id}` }}
                  style={tw`w-20 h-20 m-1 rounded`}
                />
              )}
            />
            {!isFriend && (
             <View style={tw`absolute top-0 left-0 right-0 bottom-0 justify-center items-center rounded-lg`}>
            <FontAwesome5 name="lock" size={32} color="#888" style={tw`mb-2`} />
            <Text style={tw`text-gray-600 text-center font-semibold`}>You are not friends yet</Text>
            </View>
        )}
      </View>
    </View>
  );
}
