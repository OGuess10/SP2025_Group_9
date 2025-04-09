import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, ActivityIndicator, Dimensions, FlatList } from 'react-native';
import tw from "../../components/tailwind";
import { Image } from 'expo-image';
import NavBar from '../../components/NavBar';
import { LineChart } from "react-native-chart-kit";
import { format, parseISO } from "date-fns";

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const imageMap = {
    "kangaroo": require("../../assets/user_icons/kangaroo.png"),
    "koala": require("../../assets/user_icons/koala.png"),
    "sloth": require("../../assets/user_icons/sloth.png"),
    "default": require("../../assets/user_icons/sloth.png")
};

const Chart = ({ userId }) => {

    const [activity, setActivity] = useState(null);
    const [activityLoading, setActivityLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {

                const response = await fetch(`${BACKEND_URL}/action/get_activity?user_id=${userId}`);
                const data = await response.json();
                const formattedData = Object.keys(data.data).map((date) => ({
                    date,
                    value: data.data[date],
                }));
                setActivity(formattedData);
                setActivityLoading(false);
            } catch (error) {
                console.error("Error fetching activity data:", error);
                console.log("Chart got userId:", userId)

            }
        };
        fetchData();
    }, [userId]);

    if (activityLoading) {
        return (
            <View style={tw`flex-1 justify-center items-center`}>
                <ActivityIndicator size="large" color="#ADD8E6" />
            </View>
        );
    }

    const monthlyData = {};
    activity.forEach(({ date, value }) => {
        const monthKey = format(parseISO(date), "yyyy-MM"); // Group by "YYYY-MM"
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { total: 0, count: 0 };
        }
        monthlyData[monthKey].total += value;
        monthlyData[monthKey].count += 1;
    });
    const formattedLabels = Object.keys(monthlyData).map((monthKey) => ({
        date: format(parseISO(monthKey + "-01"), "MMM yyyy"), // Convert to "Jan 2025" format
        value: Math.round(monthlyData[monthKey].total / monthlyData[monthKey].count), // Average value
    }));

    return (
        <View style={tw`flex-1 p-4 items-center bg-white w-full h-full`}>
            <LineChart
                data={{
                    labels: formattedLabels.map(item => item.date),  // Dates as labels
                    datasets: [{ data: activity.map(item => item.value) }] // Values as data
                }}
                width={screenWidth * 5 / 6}
                height={screenHeight * 0.25}
                yAxisLabel=""
                chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(50, 168, 82, ${opacity})`, // Light Green Line
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Black text
                    propsForDots: { r: "4", strokeWidth: "2", stroke: "#32a852" } // Green dots
                }}
                bezier // Smooth curved line
                style={{ borderRadius: 10 }}
            />
        </View>
    );
};

const FriendsList = ({ userId }) => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                // Step 1: Get the list of friend IDs
                const response = await fetch(`${BACKEND_URL}/user/get_friends?user_id=${userId}`);
                const friendIds = await response.json();
                // Add current user to the leaderboard also
                friendIds.friend_ids.push(userId);

                // Step 2: Fetch user details for each friend ID
                const friendDataPromises = friendIds.friend_ids.map(async (friendId) => {
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
    const imageMap = {
        "kanagroo": require("../../assets/user_icons/kangaroo.png"),
        "koala": require("../../assets/user_icons/koala.png"),
        "sloth": require("../../assets/user_icons/sloth.png"),
        "default": require("../../assets/user_icons/sloth.png")
    };

    return (
        user ?
            <SafeAreaView style={tw`flex items-center justify-between bg-white w-full h-full`}>
                <View style={tw`rounded-full m-2 p-2 bg-white shadow-lg`}>
                    <Image style={tw`w-12 h-12`} source={imageMap[user.icon] || imageMap["default"]} />
                </View>
                <View style={tw`flex w-5/6 h-3/4 justify-center`}>

                    <View style={tw`flex-1 mb-4`}>
                        <View style={tw`flex flex-row items-center justify-between my-2`}>
                            <Text style={[tw`text-2xl`, { fontFamily: "Nunito_700Bold" }]}>My Activity</Text>
                            <Text style={[tw`text-lg`, { fontFamily: "Nunito_400Regular" }]}>Points: {user.points}</Text>
                        </View>
                        <View style={tw`flex-1 rounded-lg bg-white shadow-lg items-center`}>
                            <Chart userId={user.user_id} />
                        </View>
                    </View>

                    <View style={tw`flex-1`}>
                        <Text style={[tw`text-2xl my-2`, { fontFamily: "Nunito_700Bold" }]}>Leaderboard</Text>
                        <View style={tw`flex-1 bg-white shadow-lg`}>
                            <FriendsList userId={user.user_id} />
                        </View>
                    </View>
                </View>
                <NavBar user={user} />
            </SafeAreaView>
            :
            <View></View>
    );
};

export default Leaderboard;
