import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
    Image,
    FlatList,
    ActivityIndicator
} from "react-native";
import tw from "../../components/tailwind";
import Avatar, { genConfig } from "@zamplyy/react-native-nice-avatar";
import { FontAwesome5 } from '@expo/vector-icons';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

const imageMap = {
    kangaroo: require("../../assets/user_icons/kangaroo.png"),
    koala: require("../../assets/user_icons/koala.png"),
    sloth: require("../../assets/user_icons/sloth.png"),
    default: require("../../assets/user_icons/sloth.png")
};

const UserFriends = ({ route , navigation}) => {
    const { userId } = route.params;
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const loadFriends = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/user/get_accepted_friends?user_id=${userId}`);
            const data = await res.json();
            const ids = data.friend_ids || [];

            const userData = await Promise.all(
                ids.map(async (id) => {
                    const uRes = await fetch(`${BACKEND_URL}/user/get_user?user_id=${id}`);
                    return await uRes.json();
                })
            );

            setFriends(userData);
            setError(false);
        } catch (err) {
            console.log("Failed to load friends:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFriends();
    }, [userId]);

    if (loading) return <ActivityIndicator size="large" color="#32a852" style={tw`mt-10`} />;

    return !error ? (
        <View style={tw`p-4 bg-white h-full`}>
            <View style={tw`flex-row items-center mb-4`}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={tw`p-2 mr-2`}
                >
                    <FontAwesome5 name="chevron-left" size={20} color="#1B5E20" />
                </TouchableOpacity>
            </View>
            <Text style={[tw`text-xl mb-4`, { fontFamily: "Nunito_700Bold" }]}>My Friends</Text>
            <FlatList
                data={friends}
                keyExtractor={(item) => item.user_id.toString()}
                renderItem={({ item }) => (
    <View>
        <TouchableOpacity
            onPress={() =>
                navigation.navigate("FriendsProfile", {
                    userId: item.user_id,
                    currentUserId: userId
                })
            }
        >
            <View style={tw`flex-row items-center py-2 border-b border-gray-200`}>
            {item.icon && typeof item.icon === "string" && item.icon.trim().startsWith("{") ? (
            <Avatar
                style={tw`w-8 h-8 mr-4`}
                {...JSON.parse(item.icon)}
            />
            ) : (
            <Image
                source={imageMap[item.icon] || imageMap["default"]}
                style={tw`w-8 h-8 rounded-full mr-4`}
            />
            )}

                <Text style={[tw`text-base`, { fontFamily: "Nunito_400Regular" }]}>{item.user_name}</Text>
            </View>
        </TouchableOpacity>
    </View>
                )}
            />
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
            onPress={loadFriends} // define this function to retry the request
          >
            <Text style={[tw`text-base`, { fontFamily: "Nunito_600SemiBold" }]}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
    );
};

export default UserFriends;
