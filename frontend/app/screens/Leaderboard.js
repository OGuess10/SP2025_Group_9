import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, ActivityIndicator, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import tw from "../../components/tailwind";
import { Image } from 'expo-image';
import NavBar from '../../components/NavBar';
import { LineChart } from "react-native-chart-kit";
import { format, parseISO } from "date-fns";
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import Avatar, { genConfig } from "@zamplyy/react-native-nice-avatar";



const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const imageMap = {
    "kangaroo": require("../../assets/user_icons/kangaroo.png"),
    "koala": require("../../assets/user_icons/koala.png"),
    "sloth": require("../../assets/user_icons/sloth.png"),
    "default": require("../../assets/user_icons/sloth.png")
};

const Chart = ({ userId, navigation }) => {

    const [activity, setActivity] = useState(null);
    const [activityLoading, setActivityLoading] = useState(true);
    const [updatedUser, setUpdatedUser] = useState(userId);
    const [filterType, setFilterType] = useState("All Members");
    const [showFilterModal, setShowFilterModal] = useState(false);



    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                try {
                    const response = await fetch(`${BACKEND_URL}/action/get_activity?user_id=${userId}`);
                    const data = await response.json();
                    const sortedDates = Object.keys(data.data).sort();
                    let total = 0;
                    const accumulatedData = sortedDates.map((date) => {
                    total += data.data[date];
                    return {
                        date,
                        value: total,
                    };
                    });
                    setActivity(accumulatedData);

                } catch (error) {
                    console.log('Error fetching activity data:', error);
                } finally {
                    setActivityLoading(false);
                }
            };

            fetchData();
        }, [userId])
    );

    if (activityLoading) {
        return (
            <View style={tw`flex-1 justify-center items-center`}>
                <ActivityIndicator size="large" color="#ADD8E6" />
            </View>
        );
    }

    if (!activity || activity.length === 0) {
        return (
            <View style={tw`flex-1 justify-center items-center px-6`}>
                <Text style={[tw`text-lg text-center`, { fontFamily: "Nunito_600SemiBold" }]}>
                    Welcome!
                </Text>
                <Text style={[tw`text-lg text-center ml-8 mr-8 mb-4`, { fontFamily: "Nunito_600SemiBold" }]}>
                    Make environmental actions to earn points🌱 !
                </Text>

            </View >
        );
    }

    const labels = activity.map(item => format(parseISO(item.date), "MMM d"));
    const values = activity.map(item => item.value);


    return (
        <View style={tw`flex-1 p-4 items-center bg-white w-full h-full`}>
            <LineChart
                data={{
                    labels: labels,
                    datasets: [{ data: values }]
                }}
                width={screenWidth * 5 / 6}
                height={screenHeight * 0.25}
                yAxisLabel=""
                chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(50, 168, 82, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    propsForDots: { r: "4", strokeWidth: "2", stroke: "#32a852" }
                }}
                bezier
                style={{ borderRadius: 10 }}
                />

        </View>
    );
};

const FriendsList = ({ userId }) => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            const fetchFriends = async () => {
                try {
                    const response = await fetch(`${BACKEND_URL}/user/get_friends?user_id=${userId}`);
                    const friendIds = await response.json();
                    friendIds.friend_ids.push(userId);

                    const friendDataPromises = friendIds.friend_ids.map(async (friendId) => {
                        const userResponse = await fetch(`${BACKEND_URL}/user/get_user?user_id=${friendId}`);
                        return await userResponse.json();
                    });

                    const friendsData = await Promise.all(friendDataPromises);
                    const sortedFriends = friendsData.sort((a, b) => (b.points || 0) - (a.points || 0));
                    setFriends(sortedFriends);
                } catch (error) {
                    console.log('Error fetching friends:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchFriends();
        }, [userId])
    );

    if (loading) {
        return <ActivityIndicator size="large" color="#32a852" />;
    }

    return (
        <View style={tw`flex bg-white`}>
            <FlatList
                style={tw`px-4`}
                data={friends}
                keyExtractor={(item, index) => (item?.user_id ? item.user_id.toString() : `friend-${index}`)}
                renderItem={({ item }) => (
                    <View style={tw`border-b border-gray-300 flex flex-row py-4 justify-around items-center`}>
                        <View style={tw`rounded-full p-2 bg-white shadow-lg mr-4`}>
                            <Image style={tw`w-8 h-8`} source={imageMap[item.icon] || imageMap["default"]} />
                        </View>
                        <Text style={[tw`text-lg`, { fontFamily: "Nunito_400Regular" }]}>{item.user_name}</Text>
                        <Text style={[tw`text-sm`, { fontFamily: "Nunito_400Regular" }]}>{item.points}</Text>
                    </View >
                )}
            />
        </View >
    );
};

const Leaderboard = ({ route, navigation }) => {

    const { user } = route.params;
    const [filter, setFilter] = useState("All Members"); // or "Friends"
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [updatedUser, setUpdatedUser] = useState(user);
    const [error, setError] = useState(false);

    const imageMap = {
        "kangaroo": require("../../assets/user_icons/kangaroo.png"),
        "koala": require("../../assets/user_icons/koala.png"),
        "sloth": require("../../assets/user_icons/sloth.png"),
        "default": require("../../assets/user_icons/sloth.png")
    };

    const fetchLeaderboard = async () => {
        try {
            const userResponse = await fetch(`${BACKEND_URL}/user/get_user?user_id=${user.user_id}`);
            const latestUserData = await userResponse.json();
            setUpdatedUser(latestUserData);

            const endpoint =
                filter === 'Friends'
                    ? `${BACKEND_URL}/user/get_accepted_friends?user_id=${user.user_id}`
                    : `${BACKEND_URL}/user/get_all_leaderboard`;

            const res = await fetch(endpoint);
            const data = await res.json();

            if (res.ok) {
                let filteredUsers = [];

                if (filter === 'Friends') {
                    const userIds = data.friend_ids || [];
                    userIds.push(user.user_id); 

                    const friendDataPromises = userIds.map(async (id) => {
                        const res = await fetch(`${BACKEND_URL}/user/get_user?user_id=${id}`);
                        return await res.json();
                    });

                    const friendsData = await Promise.all(friendDataPromises);
                    filteredUsers = friendsData
                        .filter((u) => u.points > 0)
                        .sort((a, b) => b.points - a.points); 

                } else {
                    filteredUsers = (data.users || []).filter((u) => u.points > 0);
                }

                setLeaderboardData(filteredUsers);

                const rank = filteredUsers.findIndex((u) => u.user_id === user.user_id) + 1;
                setUserRank(rank || null);

                setError(false);
            }

        } catch (error) {
            console.log('Leaderboard fetch error:', error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchLeaderboard();
        }, [filter])
    );

    return (updatedUser && !error) ? (
        <SafeAreaView style={tw`flex items-center justify-between bg-white w-full h-full`}>
            <TouchableOpacity
                onPress={() =>
                    navigation.navigate("FriendsProfile", {
                    userId: user.user_id,
                    currentUserId: user.user_id,
                    })
                }
                activeOpacity={0.8}
                >
                <View
                    style={[
                    tw`rounded-full m-2 p-2 shadow-lg`,
                    {
                        backgroundColor:
                        user.icon === "koala" || user.icon === "kangaroo" || user.icon === "sloth" || user.icon === "default"
                            ? "#FFFFFF"
                            : (typeof user.icon === "string"
                                ? JSON.parse(user.icon).bgColor
                                : user.icon?.bgColor || "#FFFFFF")
                    }
                    ]}
                >
                    {user.icon && (user.icon === "koala" || user.icon === "kangaroo" || user.icon === "sloth" || user.icon === "default") ? (
                    <Image style={tw`w-12 h-12 rounded-full`} source={imageMap[user.icon] || imageMap["default"]} />
                    ) : (
                    <Avatar
                        style={tw`w-12 h-12`}
                        {...(typeof user.icon === "string" ? JSON.parse(user.icon) : user.icon)}
                    />
                    )}
                </View>
                </TouchableOpacity>
            <View style={tw`flex w-5/6 h-5/6 justify-center`}>

                <View style={tw`flex-1 mb-4`}>
                    <View style={tw`flex flex-row items-center justify-between my-2`}>
                        <Text style={[tw`text-2xl`, { fontFamily: "Nunito_700Bold" }]}>My Activity</Text>
                        <Text style={[tw`text-lg`, { fontFamily: "Nunito_400Regular" }]}>Points: {updatedUser.points}</Text>

                    </View>
                    <View style={tw`flex-1 rounded-lg bg-white shadow-lg items-center`}>
                        <Chart userId={user.user_id} navigation={navigation} />
                    </View>
                </View>

                {/* Leaderboard */}
                <View style={tw`flex-1`}>
                    <Text style={[tw`text-2xl my-2`, { fontFamily: "Nunito_700Bold" }]}>Leaderboard</Text>

                    <View style={tw`flex-1 bg-white shadow-lg px-4 py-2`}>

                        {/* Filter + User Rank Row (now inside box) */}
                        <View style={tw`flex-row justify-between items-center mb-2`}>
                            <TouchableOpacity onPress={() => setFilter(prev => prev === "All Members" ? "Friends" : "All Members")}>
                                <View style={tw`flex-row items-center`}>
                                    <Text style={[tw`text-base mr-1`, { fontFamily: "Nunito_700Bold" }]}>{filter}</Text>
                                    <FontAwesome5 name="chevron-down" size={14} color="black" />
                                </View>
                            </TouchableOpacity>

                            {userRank && (
                                <View style={tw`flex-row items-center`}>
                                    <FontAwesome5 name="trophy" size={16} color="#FFC107" style={tw`mr-1`} />
                                    <Text style={[tw`text-sm`, { fontFamily: "Nunito_600SemiBold" }]}>#{userRank}</Text>
                                </View>
                            )}
                        </View>

                        {/* Leaderboard list */}
                        <FlatList
                        data={leaderboardData}
                        keyExtractor={(item) => item.user_id.toString()}
                        renderItem={({ item, index }) => {
                            const iconKey = item.icon || "default";
                            const isDefaultIcon = ["koala", "kangaroo", "sloth", "default"].includes(iconKey);
                                                            let avatarConfig = null;
                            if (!isDefaultIcon && typeof item.icon === "string" && item.icon.trim().startsWith("{")) {
                                try {
                                    avatarConfig = JSON.parse(item.icon);
                                } catch (e) {
                                    console.warn("Invalid avatar JSON for user:", item.user_name, item.icon);
                                }
                            }

                            return (
                                <TouchableOpacity
                                onPress={() =>
                                navigation.navigate("FriendsProfile", {
                                    userId: item.user_id,
                                    currentUserId: user.user_id,
                                })
                                }
                                >
                                <View style={tw`flex-row justify-between items-center py-3 border-b border-gray-200`}>
                                    <View style={tw`flex-row items-center`}>
                                        <Text style={[tw`mr-2 w-6 text-right`, { fontFamily: "Nunito_700Bold" }]}>{index + 1}</Text>
                                        <View style={[
                                            tw`rounded-full p-1 mr-3`,
                                            { backgroundColor: isDefaultIcon ? "#FFFFFF" : avatarConfig?.bgColor || "#FFFFFF" }
                                        ]}>
                                            {isDefaultIcon ? (
                                                <Image
                                                    source={imageMap[item.icon] || imageMap["default"]}
                                                    style={tw`w-8 h-8 rounded-full`}
                                                />
                                            ) : (
                                                avatarConfig && <Avatar style={tw`w-8 h-8`} {...avatarConfig} />
                                            )}
                                        </View>
                                        <Text style={[tw`text-base`, { fontFamily: "Nunito_400Regular" }]}>{item.user_name}</Text>
                                    </View>
                                    <Text style={[tw`text-base`, { fontFamily: "Nunito_700Bold", color: "#1B5E20" }]}>{item.points}</Text>
                                </View>
                                </TouchableOpacity>

                            );
                        }}
                    />

                    </View>
                </View>

            </View>

            <NavBar user={user} />
        </SafeAreaView>
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
                onPress={fetchLeaderboard} // define this function to retry the request
                >
                <Text style={[tw`text-base`, { fontFamily: "Nunito_600SemiBold" }]}>
                    Try Again
                </Text>
                </TouchableOpacity>
            </View>
    );
};

export default Leaderboard;
