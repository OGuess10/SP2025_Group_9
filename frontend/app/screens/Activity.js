import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';
import tw from "../../components/tailwind";
import { Image } from 'expo-image';
import NavBar from '../../components/NavBar';
import { FontAwesome5 } from '@expo/vector-icons';

const BACKEND_URL = "http://127.0.0.1:5000";  // Replace with your Flask server IP

const ecoActions = [
    { id: '1', icon: 'recycle', label: 'Recycling', points: 20 },
    { id: '2', icon: 'tree', label: 'Plant a Tree', points: 30 },
    { id: '3', icon: 'trash', label: 'Litter Cleanup', points: 15 },
    { id: '4', icon: 'solar-panel', label: 'Use Solar Energy', points: 15 },
    { id: '5', icon: 'bicycle', label: 'Bike Instead of Drive', points: 25 }
];

const ActivityList = ({ user, setUserPoints }) => {
    const [selectedAction, setSelectedAction] = useState(null);

    const handleActionSelect = async (action) => {
        setSelectedAction(action);
        const newPoints = user.points + action.points;
        setUserPoints(newPoints);
    
        try {
            console.log("Sending request to update points:", newPoints);
            const response = await fetch(`${BACKEND_URL}/update_points`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: user.user_id, points: newPoints }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to update points');
            }
    
            const data = await response.json();
            console.log("Response from server:", data);
            if (data.success) {
                Alert.alert('Success', 'Points updated successfully');
            } else {
                Alert.alert('Error', 'Failed to update points');
            }
        } catch (error) {
            console.error('Error updating points:', error);
            Alert.alert('Error', 'Failed to update points');
        }
    };

    return (
        <View style={tw`flex-1 px-4`}> 
            <FlatList
                data={ecoActions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                <View style={tw`border-b border-gray-300 flex py-4 items-center`}>
                    <TouchableOpacity style={tw`flex w-full flex-row`}
                                onPress={() => handleActionSelect(item)}>
                        <FontAwesome5 name={item.icon} size={24} color="black" style={tw`mr-4`} />
                        <Text style={[tw`text-lg`, { fontFamily: "Nunito_400Regular" }]}>{item.label}</Text>
                    </TouchableOpacity>
                </View>
                )}
            />

            <Modal
                    visible={!!selectedAction}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setSelectedAction(null)}
                >
                    <View style={tw`flex-1 justify-center items-center bg-black/50`}>
                    <View style={tw`bg-white justify-center items-center p-6 shadow-lg w-5/6 h-5/6 rounded-lg`}>
                        <TouchableOpacity
                        style={tw`absolute top-4 left-4 p-2`}
                        onPress={() => setSelectedAction(null)}
                        >
                        <FontAwesome5 name="times" size={24} color="black" />
                        </TouchableOpacity>

                        {selectedAction && (
                        <>
                            <FontAwesome5 name={selectedAction.icon} size={80} color="green" />
                            <Text style={[tw`text-2xl mt-6 font-bold`, { fontFamily: "Nunito_700Bold" }]}>
                            {selectedAction.label}
                            </Text>
                        </>
                        )}
                    </View>
                    </View>
                </Modal>
        </View>
    );
};

const Activity = ({ route, navigation }) => {
    const { user } = route.params || {};
    const [userPoints, setUserPoints] = useState(user.points);

    useEffect(() => {
        setUserPoints(user.points);
    }, [user.points]);

    const imageMap = {
        "kanagroo": require("../../assets/user_icons/kangaroo.png"),
        "koala": require("../../assets/user_icons/koala.png"),
        "sloth": require("../../assets/user_icons/sloth.png"),
        "default": require("../../assets/user_icons/sloth.png")
    };

    if (!user) {
        return <View><Text>Loading...</Text></View>;
    }

    return (
        user ? 
        <SafeAreaView style={tw`flex items-center justify-start bg-white w-full h-full`}>
            <View style={tw`rounded-full m-2 p-2 bg-white shadow-lg`}>
                <Image style={tw`w-12 h-12`} source={imageMap[user.icon] || imageMap["default"]}/>
            </View>
            <View style={tw`flex w-5/6 h-3/4 justify-center`}>
                <View style={tw`mb-4 my-2`}>
                    <Text style={[tw`text-2xl`, { fontFamily: "Nunito_700Bold" }]}>Choose Activity</Text>
                </View>
                <View style={tw`bg-white shadow-lg flex-1 h-5/6`}>
                    <ActivityList user={user} setUserPoints={setUserPoints} />
                </View>
            </View>
            <NavBar user={{ ...user, points: userPoints }} />
        </SafeAreaView>
        :
        <View></View>
    );
};

export default Activity;