import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, FlatList, Modal, Alert, Image } from 'react-native';
import tw from "../../components/tailwind";
// import { Image } from 'expo-image';
import NavBar from '../../components/NavBar';
import { FontAwesome5 } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import MediaLibrary from 'expo-media-library';
import { Animated } from 'react-native';


const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

const ecoActions = [
    { id: '1', icon: 'recycle', label: 'Recycling', points: 20 },
    { id: '2', icon: 'tree', label: 'Plant a Tree', points: 30 },
    { id: '3', icon: 'trash', label: 'Litter Cleanup', points: 15 },
    { id: '4', icon: 'solar-panel', label: 'Use Solar Energy', points: 15 },
    { id: '5', icon: 'bicycle', label: 'Bike ', points: 25 }
];

const CameraScreen = ({ userId, action, visible, onClose, onImageUploaded }) => {

    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);
    const [facing, setFacing] = useState('back');
    const [capturedPhoto, setCapturedPhoto] = useState(null);


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
            const photo = await cameraRef.current.takePictureAsync();
            setCapturedPhoto(photo);
            const formData = new FormData();
            formData.append("image", {
                uri: photo.uri,
                name: `photo.jpg`,
                type: "image/jpeg",
            });
            formData.append("user_id", userId);
        } else {
            console.log("Camera not ready, photo not taken.");
        }
    };

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    const handleSubmit = async () => {
        if (!capturedPhoto) return;

        const formData = new FormData();
        formData.append("image", {
            uri: capturedPhoto.uri,
            name: "photo.jpg",
            type: "image/jpeg",
        });
        formData.append("user_id", userId);
        formData.append("action_type", action.label); // send action label
        formData.append("points", action.points.toString()); // send base points


        try {
            const response = await fetch(`${BACKEND_URL}/action/upload_image`, {
                method: "POST",
                body: formData,
                headers: { "Content-Type": "multipart/form-data" },
            });
            const result = await response.json();
            console.log("Upload success:", result);

            Alert.alert(
                "Photo uploaded!",
                `You have earned ${result.action_points} points! 🎉`
            );

            setCapturedPhoto(null); // Clear the preview
            onClose(); // Close camera modal
        } catch (error) {
            console.log("Upload failed:", error);
        }
    };

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
                            {capturedPhoto ? (
                                <View style={tw`flex-1 justify-center items-center`}>
                                    <Image source={{ uri: capturedPhoto.uri }} style={tw`w-64 h-96 rounded-lg`} />
                                    <TouchableOpacity
                                        style={tw`w-48 py-3 mt-6 bg-red-200 rounded-lg shadow-lg items-center`}
                                        onPress={() => setCapturedPhoto(null)} // Retake
                                    >
                                        <Text style={[tw`text-lg`, { fontFamily: "Nunito_400Regular" }]}>Retake</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={tw`w-48 py-3 mt-4 bg-green-200 rounded-lg shadow-lg items-center`}
                                        onPress={handleSubmit}
                                    >
                                        <Text style={[tw`text-lg`, { fontFamily: "Nunito_400Regular" }]}>Submit</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    <CameraView ref={cameraRef} style={tw`w-full h-2/3`} facing={facing}>
                                        {/* You can add a toggle button inside here if needed */}
                                    </CameraView>
                                    <TouchableOpacity
                                        style={tw`py-3 px-10 mt-10 shadow-lg bg-white rounded-lg`}
                                        onPress={takePhoto}
                                    >
                                        <Text style={[tw`text-lg`, { fontFamily: "Nunito_700Bold" }]}>Take Photo</Text>
                                    </TouchableOpacity>
                                </>
                            )}
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
                                        <Text style={[tw`text-lg`, { fontFamily: "Nunito_700Bold" }]} >OK</Text>
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

    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);


    const [selectedAction, setSelectedAction] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [image, setImage] = useState("");
    const [showImage, setShowImage] = useState(false);


    useEffect(() => {
        setImage("");
    }, [selectedAction]);

    const handleActionSelect = async (action) => {
        try {
            // Step 1: Log the action (backend will now update points too)
            const actionResponse = await fetch(`${BACKEND_URL}/action/log_action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.user_id,
                    action_type: action.label,
                    points: action.points,
                }),
            });

            if (!actionResponse.ok) throw new Error("Failed to log action");

            // Step 2: Fetch latest user info
            const updatedUserResponse = await fetch(`${BACKEND_URL}/user/get_user?user_id=${user.user_id}`);
            const updatedUser = await updatedUserResponse.json();

            // Step 3: Update UI
            setUserPoints(updatedUser.points);
            Alert.alert('Good job!', `You have earned ${action.points} points! 🎉`);

        } catch (error) {
            console.error('Error logging action:', error);
            Alert.alert('Error', 'Something went wrong while adding the action.');
        }
    };


    return (
        <View style={tw`flex-1 px-4`}>
            <FlatList
                data={ecoActions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={tw`border-b border-gray-300 py-4 w-full`}>
                        <TouchableOpacity
                            style={tw`flex-row justify-between items-center w-full px-4`}
                            onPress={() => setSelectedAction(item)}
                        >
                            {/*Icon + Label */}
                            <View style={tw`flex-row items-center ml-0`}>
                                <FontAwesome5 name={item.icon} size={24} color="black" style={tw`mr-4`} />
                                <Text style={[tw`text-lg`, { fontFamily: "Nunito_400Regular" }]}>{item.label}</Text>
                            </View>

                            {/* Points */}
                            <Text style={[tw`text-sm text-green-700`, { fontFamily: "Nunito_700Bold" }]}>
                                +{item.points} pts
                            </Text>
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
                                    <Text style={[tw`text-sm text-green-700`, { fontFamily: "Nunito_700Bold" }]}>
                                        +{selectedAction.points} pts
                                    </Text>
                                </>
                            )}
                        </View>

                        <View style={tw`justify-center items-center w-full mt-32`}>
                            <Animated.Text
                                style={[
                                    tw`text-sm text-green-700 mt-1`,
                                    { fontFamily: "Nunito_400Regular", transform: [{ scale: pulseAnim }] },
                                ]}
                            >
                                +5 bonus points!
                            </Animated.Text>

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

                <CameraScreen userId={user.user_id} action={selectedAction} setImage={setImage} visible={showCamera} onClose={() => {
                    setShowCamera(false);
                    setSelectedAction(null);
                }} />

                <Modal
                    visible={showImage && (image != "")}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowImage(false)}
                >
                    <View style={tw`flex-1 justify-center items-center bg-white`}>
                        <View style={tw`bg-white justify-center items-center p-6 shadow-lg w-5/6 h-5/6 rounded-lg`}>
                            <TouchableOpacity
                                style={tw`absolute top-4 left-4 p-2`}
                                onPress={() => setShowImage(false)}
                            >
                                <FontAwesome5 name="times" size={24} color="black" />
                            </TouchableOpacity>
                            <Image source={{ uri: 'file://' + image }}
                                style={{ width: '100%', height: '80%' }}
                            ></Image>
                        </View>
                    </View>
                </Modal>
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
                    <Image style={tw`w-12 h-12`} source={imageMap[user.icon] || imageMap["default"]} />
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