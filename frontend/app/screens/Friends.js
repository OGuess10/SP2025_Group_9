// FriendScreen.js
import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import tw from "../../components/tailwind";
import { Image } from 'expo-image';
import NavBar from '../../components/NavBar';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

const imageMap = {
    "kangaroo": require("../../assets/user_icons/kangaroo.png"),
    "koala": require("../../assets/user_icons/koala.png"),
    "sloth": require("../../assets/user_icons/sloth.png"),
    "default": require("../../assets/user_icons/sloth.png")
};

const UserCard = ({ user, actions }) => (
    <View style={tw`flex-row justify-between items-center p-4 border-b border-gray-200`}>
        <View style={tw`flex-row items-center`}>
            <Image source={imageMap[user.icon] || imageMap.default} style={tw`w-8 h-8 rounded-full mr-4`} />
            <Text style={tw`text-base`}>{user.user_name}</Text>
        </View>
        <View style={tw`flex-row`}>
            {actions.map(({ label, onPress, disabled }, index) => (
                <TouchableOpacity
                    key={index}
                    onPress={onPress}
                    disabled={disabled}
                    style={[
                        tw`ml-2 px-3 py-1 rounded`,
                        label === "Pending" && tw`border border-green-600 border-dotted bg-transparent`,
                        label === "Deny" && tw`bg-pink-200`,
                        label === "✕" && tw`bg-transparent`,
                        label === "Accept" && tw`bg-green-100`,
                        label === "Request" && tw`bg-green-100`,
                    ]}
                >
                    <Text style={[
                        tw`text-sm`,
                        label === "Pending" && tw`text-green-600`,
                        label === "Deny" && tw`text-red-700`,
                        label === "✕" && tw`text-black`
                    ]}>
                        {label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    </View>
);

const FriendScreen = ({ route, navigation }) => {
    const { user } = route.params;
    const [searchText, setSearchText] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [friendships, setFriendships] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchUsersAndFriendships = async () => {
        try {
            setRefreshing(true);
            const [usersRes, friendsRes] = await Promise.all([
                fetch(`${BACKEND_URL}/user/get_all_users`),
                fetch(`${BACKEND_URL}/user/get_friends?user_id=${user.user_id}`)
            ]);

            const usersData = await usersRes.json();
            const friendshipsData = await friendsRes.json();

            setAllUsers(usersData);
            setFriendships(friendshipsData.friendships);
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsersAndFriendships();
    }, []);

    const friendMap = {};
    friendships.forEach(f => {
        const isMeSender = f.user_id == user.user_id;
        const friendId = isMeSender ? f.friend_id : f.user_id;
        friendMap[friendId] = { ...f, isMeSender };
    });

    const acceptRequest = async (friendshipId) => {
        await fetch(`${BACKEND_URL}/user/accept_friend_request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ friendship_id: friendshipId })
        });
        fetchUsersAndFriendships();
    };

    const denyRequest = async (friendshipId) => {
        await fetch(`${BACKEND_URL}/user/deny_friend_request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ friendship_id: friendshipId })
        });
        fetchUsersAndFriendships();
    };

    const sendRequest = async (friendId) => {
        await fetch(`${BACKEND_URL}/user/send_friend_request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.user_id, friend_id: friendId })
        });
        fetchUsersAndFriendships();
    };

    const filteredUsers = allUsers.filter(u =>
        u.user_name && u.user_name.trim() !== "" &&
        u.user_name.toLowerCase().includes(searchText.toLowerCase()) &&
        u.user_id !== user.user_id
    );

    const friendRequests = filteredUsers.filter(u => friendMap[u.user_id]?.status === "Pending" && !friendMap[u.user_id].isMeSender);
    const pendingRequests = filteredUsers.filter(u => friendMap[u.user_id]?.status === "Pending" && friendMap[u.user_id].isMeSender);
    const suggestedUsers = filteredUsers.filter(u => !friendMap[u.user_id]);

    return (
        <SafeAreaView style={tw`flex items-center justify-between bg-white w-full h-full`}>
            <View style={tw`rounded-full m-2 p-2 bg-white shadow-lg`}>
                <Image style={tw`w-12 h-12`} source={imageMap[user.icon] || imageMap["default"]} />
            </View>
            <View style={tw`flex pt-10 w-5/6 justify-center`}>
                <TextInput
                    style={tw`px-4 py-2 border border-gray-300 rounded-full`}
                    placeholder="Search users..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            {refreshing ? (
                <ActivityIndicator size="large" color="#32a852" />
            ) : (
                <ScrollView style={tw`w-full`} contentContainerStyle={tw`items-center`}>

                    <View style={tw`flex w-5/6 justify-center`}>

                        {friendRequests.length > 0 && (
                            <Text style={tw`text-lg font-bold mt-4 mb-2`}>Friend Requests</Text>
                        )}
                        {friendRequests.map(user => (
                            <UserCard
                                key={user.user_id}
                                user={user}
                                actions={[
                                    { label: "Accept", onPress: () => acceptRequest(friendMap[user.user_id].id) },
                                    { label: "Deny", onPress: () => denyRequest(friendMap[user.user_id].id) }
                                ]}
                            />
                        ))}

                        {pendingRequests.length > 0 && (
                            <Text style={tw`text-lg font-bold mt-6 mb-2`}>Pending Requests</Text>
                        )}
                        {pendingRequests.map(user => (
                            <UserCard
                                key={user.user_id}
                                user={user}
                                actions={[{ label: "Pending", disabled: true }]}
                            />
                        ))}

                        {suggestedUsers.length > 0 && (
                            <Text style={tw`text-lg font-bold mt-6 mb-2`}>Suggested For You</Text>
                        )}
                        {suggestedUsers.map(user => (
                            <UserCard
                                key={user.user_id}
                                user={user}
                                actions={[
                                    { label: "Request", onPress: () => sendRequest(user.user_id) },
                                    { label: "✕", onPress: () => { /* Optional: remove from list */ } }
                                ]}
                            />
                        ))}
                    </View>
                </ScrollView>
            )}
            <View />
            <NavBar user={user} />
        </SafeAreaView >
    );
};

export default FriendScreen;
