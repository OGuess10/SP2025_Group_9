import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';
import tw from "../../components/tailwind";
import { Image } from 'expo-image';
import NavBar from '../../components/NavBar';
import { FontAwesome5 } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import MediaLibrary from 'expo-media-library';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

const ecoActions = [
    { id: '1', icon: 'recycle', label: 'Recycling', points: 20 },
    { id: '2', icon: 'tree', label: 'Plant a Tree', points: 30 },
    { id: '3', icon: 'trash', label: 'Litter Cleanup', points: 15 },
    { id: '4', icon: 'solar-panel', label: 'Use Solar Energy', points: 15 },
    { id: '5', icon: 'bicycle', label: 'Bike Instead of Drive', points: 25 }
];

const CameraScreen = ({ userId, action, visible, onClose }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);
    const [facing, setFacing] = useState('back');

    useEffect(() => {
        const checkPermission = async () => {
            if (!permission?.granted) {
                const { granted } = await requestPermission();
                if (!granted) {
                    console.log('Camera permission denied');
                    return;
                }
            }
        };
    
        checkPermission();
    }, []);

    const takePhoto = async () => {
        console.log("taking photo...");
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync({ base64: true });
        
            try {
                const response = await fetch(`${BACKEND_URL}/upload`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ image: photo.base64, action: action.id, userId: userId }),
                });
        
                const result = await response.json();
                console.log("Upload success:", result);
                Alert.alert('Success', 'Photo taken successfully');
                onClose();
            } catch (error) {
                console.log("Upload failed:", error);
            }
        } else {
            console.log("Camera not ready, photo not taken.");
        }            
    };

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    return (
        visible ? (
            <Modal
                transparent
                animationType="fade"
            >
                {permission?.granted ? (
                    <View style={tw`flex-1 justify-center items-center bg-white`}>
                    <View style={tw`flex bg-white justify-center items-center p-6 shadow-lg w-5/6 h-5/6 rounded-lg`}>
                        <TouchableOpacity
                            style={tw`absolute top-4 left-4 p-2`}
                            onPress={onClose}
                        >
                            <FontAwesome5 name="times" size={24} color="black" />
                        </TouchableOpacity>
                        <CameraView ref={cameraRef} style={tw`flex w-full h-2/3 items-end`} facing={facing}>
                            <View>
                                <TouchableOpacity style={tw`p-2`} onPress={toggleCameraFacing}>
                                    <FontAwesome5 name="sync-alt" size={24} color="black" />
                                </TouchableOpacity>
                            </View>
                        </CameraView>
                        <TouchableOpacity style={tw`py-2 px-10 mt-10 shadow-lg bg-white rounded-lg`} onPress={takePhoto}>
                            <Text style={[tw`text-lg`, { fontfamily: "Nunito_700Bold" }]}>Take Photo</Text>
                        </TouchableOpacity>
                    </View>
                    </View>
                ) : (
                    <View>
                    <Modal
                        transparent
                        animationType="fade"
                    >
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <View style={tw`bg-white p-10 rounded-lg items-center`}>
                            <Text style={[tw`text-xl`, { fontFamily: "Nunito_500Regular" }]}>Camera permission is required</Text>
                            <TouchableOpacity style={tw`mt-10 py-2 px-10 shadow-lg bg-white`} onPress={onClose}>
                                <Text style={[tw`text-lg`,{ fontFamily: "Nunito_700Bold" }]} >OK</Text>
                            </TouchableOpacity>
                        </View>
                        </View>
                    </Modal>
                    </View>
                )}
            </Modal>
        ) : null
    );
};

const ActivityList = ({ user, setUserPoints }) => {
    const [selectedAction, setSelectedAction] = useState(null);
    const [showCamera, setShowCamera] = useState(false);

    const handleActionSelect = async (action) => {
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
                        onPress={() => setSelectedAction(item)}>
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
                <View style={tw`flex-1 justify-center items-center bg-white`}>
                <View style={tw`bg-white justify-center items-center p-6 shadow-lg w-5/6 h-5/6 rounded-lg`}>
                    <TouchableOpacity
                    style={tw`absolute top-4 left-4 p-2`}
                    onPress={() => setSelectedAction(null)}
                    >
                        <FontAwesome5 name="times" size={24} color="black" />
                    </TouchableOpacity>

                    <View style={tw`justify-center items-center`}>
                        {selectedAction && (
                        <>
                            <FontAwesome5 name={selectedAction.icon} size={80} color="green" />
                            <Text style={[tw`text-2xl mt-6`, { fontFamily: "Nunito_700Bold" }]}>
                            {selectedAction.label}
                            </Text>
                        </>
                        )}
                    </View>
                    
                    <View style={tw`justify-center items-center w-full mt-32`}>
                        <TouchableOpacity
                        style={tw`bg-white justify-center items-center w-5/6 py-2 shadow-lg`}
                        onPress={() => setShowCamera(true)}
                        >
                            <Text style={[tw`text-lg font-bold`, { fontFamily: "Nunito_400Regular" }]}>Take Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                        onPress={() => {
                            handleActionSelect(selectedAction);
                            setSelectedAction(null);
                        }}
                        style={tw`bg-white justify-center items-center w-5/6 mt-8 py-2 shadow-lg`}>
                            <Text style={[tw`text-lg font-bold`, { fontFamily: "Nunito_400Regular" }]}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                </View>

                <CameraScreen userId={user.user_id} action={selectedAction} visible={showCamera} onClose={() => setShowCamera(false)} />
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