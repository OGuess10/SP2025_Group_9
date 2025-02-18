import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, ActivityIndicator, Dimensions } from 'react-native';
import tw from "../../components/tailwind";
import { Image } from 'expo-image';
import NavBar from '../../components/NavBar';
import { LineChart } from "react-native-chart-kit";
import { format, parseISO } from "date-fns";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;


const Chart = () => {
    const [activity, setActivity] = useState(null);
    const [activityLoading, setActivityLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/get_activity?user_id=0');
            const data = await response.json();
            const formattedData = Object.keys(data.data).map((date) => ({
                date,
                value: data.data[date],
            }));
            setActivity(formattedData);
            setActivityLoading(false);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
        };
        fetchData();
    }, []);

    if (activityLoading) {
        return (
          <View style={tw`flex-1 justify-center items-center`}>
            <ActivityIndicator size="large" color="#ADD8E6" />
          </View>
        );
    }

    const monthlyData = {};
    activity.forEach(({date, value}) => {
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
                width={screenWidth * 5/6} 
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

const Leaderboard = ({route, navigation}) => {
    // const [friendActivity, setFriendActivity] = useState(null);
    // useEffect(() => {
    //     const fetchData = async () => {
    //     try {
    //         const response = await fetch('http://127.0.0.1:5000/get_friends?user_id=0');
    //         const data = await response.json();
    //         setActivity(data); // Set the fetched data to state
    //     } catch (error) {
    //         console.error("Error fetching user data:", error);
    //     }
    //     };
    //     fetchData();
    // }, []);

    const {user} = route.params;
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
                <Image style={tw`w-12 h-12`} source={imageMap[user.icon] || imageMap["default"]}/>
            </View>
            <View style={tw`flex w-5/6 h-3/4 justify-center`}>

                <View style={tw`flex-1 mb-4`}>
                    <View style={tw`flex flex-row items-center justify-between my-2`}>
                    <Text style={[tw`text-2xl`, { fontFamily: "Nunito_700Bold" }]}>Your Activity</Text>
                    <Text style={[tw`text-lg`, { fontFamily: "Nunito_400Regular" }]}>Points: {user.points}</Text>
                    </View>
                    <View style={tw`flex-1 rounded-lg bg-white shadow-lg items-center`}>
                        <Chart></Chart>
                    </View>
                </View>

                <View style={tw`flex-1`}>
                    <Text style={[tw`text-2xl my-2`, { fontFamily: "Nunito_700Bold" }]}>Leaderboard</Text>
                    <View style={tw`flex-1 bg-white shadow-lg`}>
                    </View>
                </View>
            </View>
        <NavBar user={user}/>
        </SafeAreaView>
        :
        <View></View>
    );
};

export default Leaderboard;
