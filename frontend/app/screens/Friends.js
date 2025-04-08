import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, FlatList, Modal, ActivityIndicator } from 'react-native';
import tw from "../../components/tailwind";
import { Image } from 'expo-image';
import NavBar from '../../components/NavBar';
import { FontAwesome5 } from '@expo/vector-icons';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;


const imageMap = {
    "kangaroo": require("../../assets/user_icons/kangaroo.png"),
    "koala": require("../../assets/user_icons/koala.png"),
    "sloth": require("../../assets/user_icons/sloth.png"),
    "default": require("../../assets/user_icons/sloth.png")
};

const FriendsList = ({ userId }) => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFriend, setSelectedFriend] = useState(null);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                // Step 1: Get the list of friend IDs
                // const response = await fetch(`http://127.0.0.1:6000/get_friends?user_id=0`);
                const response = await fetch(`${BACKEND_URL}/user/get_friends?user_id=${userId}`);
                const friendIds = await response.json();

                // Add current user to the leaderboard also
                friendIds.friend_ids.push(userId);

                // Step 2: Fetch user details for each friend ID
                const friendDataPromises = friendIds.friend_ids.map(async (friendId) => {
                    // const userResponse = await fetch(`http://127.0.0.1:6000/get_user?user_id=${friendId}`);
                    const userResponse = await fetch(`${BACKEND_URL}/user/get_user?user_id=${friendId}`);
                    return await userResponse.json();
                });

                // Step 3: Wait for all friend details to be fetched
                const friendsData = await Promise.all(friendDataPromises);
                const sortedFriends = friendsData.sort((a, b) => (b.points || 0) - (a.points || 0));

                setFriends(sortedFriends);
            } catch (error) {
                console.error("Error fetching friends:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, [userId]);

    if (loading) {
        return <ActivityIndicator size="large" color="#32a852" />;
    }

    return (
        <View style={tw`flex h-full bg-white`}>
            <FlatList
                style={tw`px-4`}
                data={friends}
                keyExtractor={(item, index) => (item?.user_id ? item.user_id.toString() : `friend-${index}`)}
                renderItem={({ item }) => (
                    <View style={tw`border-b border-gray-300 flex flex-row py-4 items-center`}>
                        <TouchableOpacity style={tw`flex w-full flex-row items-center justify-between`}
                            onPress={() => setSelectedFriend(item)}>
                            <View style={tw`flex flex-row items-center mx-2`}>
                                <View style={tw`rounded-full p-2 bg-white shadow-lg mr-4`}>
                                    <Image style={tw`w-8 h-8`} source={imageMap[item.icon] || imageMap["default"]} />
                                </View>
                                <Text style={[tw`text-lg`, { fontFamily: "Nunito_400Regular" }]}>{item.user_name}</Text>
                            </View>
                            <Text style={[tw`text-sm mx-2`, { fontFamily: "Nunito_400Regular" }]}>{item.points}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
            <Modal
                visible={!!selectedFriend}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedFriend(null)}
            >
                <View style={tw`flex-1 justify-center items-center bg-white`}>
                    <View style={tw`bg-white justify-center items-center p-6 shadow-lg w-5/6 h-5/6 rounded-lg`}>
                        <TouchableOpacity
                            style={tw`absolute top-4 left-4 p-2`}
                            onPress={() => setSelectedFriend(null)}
                        >
                            <FontAwesome5 name="times" size={24} color="black" />
                        </TouchableOpacity>

                        {selectedFriend && (
                            <>
                                <View style={tw`rounded-full p-2 bg-white shadow-lg items-center`}>
                                    <Image style={tw`w-12 h-12`} source={imageMap[selectedFriend.icon] || imageMap["default"]} />
                                </View>
                                <Text style={[tw`text-2xl mt-6 font-bold`, { fontFamily: "Nunito_700Bold" }]}>
                                    {selectedFriend.user_name}
                                </Text>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const Friends = ({ route, navigation }) => {

    const { user } = route.params;

    return (
        user ?
            <SafeAreaView style={tw`flex items-center justify-start bg-white w-full h-full`}>
                <View style={tw`rounded-full m-2 p-2 bg-white shadow-lg`}>
                    <Image style={tw`w-12 h-12`} source={imageMap[user.icon] || imageMap["default"]} />
                </View>
                <View style={tw`flex w-5/6 h-3/4 justify-center`}>
                    <View style={tw`mb-4 my-2`}>
                        <Text style={[tw`text-2xl`, { fontFamily: "Nunito_700Bold" }]}>Friends</Text>
                    </View>
                    <View style={tw`bg-white shadow-lg flex-1 h-5/6`}>
                        <FriendsList userId={user.user_id} />
                    </View>
                </View>
                <NavBar user={user} />
            </SafeAreaView>
            :
            <View></View>
    );
};

export default Friends;