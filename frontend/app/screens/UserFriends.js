import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import tw from "../../components/tailwind";
import { Image } from 'expo-image';
import Avatar, { genConfig } from "@zamplyy/react-native-nice-avatar";

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

const imageMap = {
    kangaroo: require("../../assets/user_icons/kangaroo.png"),
    koala: require("../../assets/user_icons/koala.png"),
    sloth: require("../../assets/user_icons/sloth.png"),
    default: require("../../assets/user_icons/sloth.png")
};

const UserFriends = ({ route }) => {
    const { userId } = route.params;
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
            } catch (err) {
                console.error("Failed to load friends:", err);
            } finally {
                setLoading(false);
            }
        };

        loadFriends();
    }, [userId]);

    if (loading) return <ActivityIndicator size="large" color="#32a852" style={tw`mt-10`} />;

    return (
        <View style={tw`p-4 bg-white h-full`}>
            <Text style={[tw`text-xl mb-4`, { fontFamily: "Nunito_700Bold" }]}>My Friends</Text>
            <FlatList
                data={friends}
                keyExtractor={(item) => item.user_id.toString()}
                renderItem={({ item }) => (
                    <View style={tw`flex-row items-center py-2 border-b border-gray-200`}>
                        <Image
                            source={imageMap[item.icon] || imageMap["default"]}
                            style={tw`w-8 h-8 rounded-full mr-4`}
                        />
                        <Text style={[tw`text-base`, { fontFamily: "Nunito_400Regular" }]}>{item.user_name}</Text>
                    </View>
                )}
            />
        </View>
    );
};

export default UserFriends;
