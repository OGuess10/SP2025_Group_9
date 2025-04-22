import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import tw from "../../components/tailwind";
import Avatar from "@zamplyy/react-native-nice-avatar";
import { FontAwesome5 } from '@expo/vector-icons';
import GrowingTree from "../../components/GrowingTree";
import { ScrollView } from 'react-native';

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

const handleUnfriendPress = (navigation, user_id, friend_id) => {
  Alert.alert(
    'Unfriend User',
    'Are you sure you want to remove this person from your friends list?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Unfriend',
        onPress: () => unfriend(navigation, user_id, friend_id),
        style: 'destructive',
      },
    ],
    { cancelable: true }
  );
};


const unfriend = async (navigation, user_id, friend_id) => {
  try {
    const response = await fetch(`${BACKEND_URL}/user/unfriend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, friend_id })
    });

    if (!response.ok) {
      console.log("user_id: " + user_id + " friend_id: " + friend_id);
      throw new Error('Failed to unfriend user');
    }
    console.log('Unfriended successfully');
    Alert.alert("Success", "Unfriend was succesful!");
    navigation.goBack();
  } catch (error) {
    console.log('Error unfriending:', error);
    Alert.alert("Error", "Could not unfriend user. Please check your network connection and try again.");
  }
};


export default function FriendsProfile({ route, navigation }) {
  const { userId, currentUserId } = route.params;

  const [userInfo, setUserInfo] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
      setError(false);
  
    } catch (err) {
      console.log("Error loading profile data:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId, currentUserId]);

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-white`}>
        <ActivityIndicator size="large" color="#1B5E20" />
      </View>
    );
  }

  return !error ? (
    <View style={tw`flex-1 justify-center items-center bg-white`}>
      <View style={tw`bg-white shadow-lg w-5/6 rounded-lg overflow-hidden`}>
        <ScrollView contentContainerStyle={tw`items-center px-6 py-8`}>
  
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`absolute top-4 left-4 p-2 z-10`}
          >
            <FontAwesome5 name="chevron-left" size={20} color="#1B5E20" />
          </TouchableOpacity>
  
          {/* Unfriend button */}
          {isFriend && userId !== currentUserId && (
            <TouchableOpacity
              style={tw`m-2 px-3 py-1 rounded bg-pink-200 absolute top-4 right-4 z-10`}
              onPress={() => handleUnfriendPress(navigation, userId, currentUserId)}
            >
              <Text style={[tw`text-xs text-red-700`, { fontFamily: "Nunito_700Bold" }]}>
                Unfriend
              </Text>
            </TouchableOpacity>
          )}
  
          {/* Icon */}
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
              },
            ]}
          >
            <UserIcon icon={userInfo?.icon} size={64} />
          </View>
  
          {/* Username */}
          <Text style={tw`text-xl font-bold mb-2`}>{userInfo?.user_name}</Text>
  
          {/* Points */}
          <Text style={tw`text-gray-600 mb-4`}>Points: {userInfo?.points}</Text>
  
          {/* Tree */}
          {userInfo?.points > 0 && (
            <View style={[tw`w-full items-center my-6`]}>
              <View
                style={[
                  tw`w-5/6 rounded-xl shadow-lg items-center p-3`,
                  {
                    backgroundColor: '#E8F5E9',
                    overflow: 'hidden',
                    height: 300,
                  },
                ]}
              >
                <GrowingTree seed={userId + 12345} points={userInfo?.points || 0} width={260} height={260} />
              </View>
            </View>
          )}
  
          {/* Photos */}
          <FlatList
            data={photos}
            numColumns={3}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={tw`mb-4`}
            renderItem={({ item }) => (
              <Image
                source={{ uri: `${BACKEND_URL}/action/get_images/${item.id}` }}
                style={tw`w-20 h-20 m-1 rounded`}
              />
            )}
          />
  
          {/* Lock screen if not friends */}
          {!isFriend && (
          <View style={tw`my-6 items-center`}>
            <FontAwesome5 name="lock" size={32} color="#888" style={tw`mb-2`} />
            <Text style={tw`text-gray-600 text-center font-semibold`}>
              You are not friends yet
            </Text>
          </View>
        )}
        </ScrollView>
      </View>
    </View>
  ) : (
    <View style={tw`flex-1 justify-center items-center bg-white px-4`}>
      <View style={tw`rounded-xl shadow-lg bg-green-50 p-6 items-center`}>
        <Text style={[tw`text-xl mb-2 text-green-900`, { fontFamily: "Nunito_700Bold" }]}>
          ⚠️ Connection Issue
        </Text>
        <Text style={[tw`text-base text-center text-green-900`, { fontFamily: "Nunito_400Regular" }]}>
          We couldn’t connect to the server. Check your internet or try again shortly.
        </Text>
      </View>
  
      <TouchableOpacity
        style={tw`mt-6 w-5/6 py-3 bg-green-100 rounded-lg shadow-lg items-center`}
        onPress={loadData}
      >
        <Text style={[tw`text-base`, { fontFamily: "Nunito_600SemiBold" }]}>
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );  
}
