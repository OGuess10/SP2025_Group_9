import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, FlatList, Modal, Alert, Image, TextInput } from 'react-native';
import tw from "../../components/tailwind";
// import { Image } from 'expo-image';
import NavBar from '../../components/NavBar';
import { FontAwesome5 } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import MediaLibrary from 'expo-media-library';
import { Animated } from 'react-native';
import Avatar, { genConfig } from "@zamplyy/react-native-nice-avatar";
import * as Haptics from 'expo-haptics';


const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

const ecoActions = [
    { id: '1', icon: 'recycle', label: 'Recycle', points: 5, info: 'Recycle paper, plastic, glass, or metal responsibly.' },
    { id: '2', icon: 'tree', label: 'Plant a Tree', points: 30, info: 'Plant a tree to absorb CO₂ and support biodiversity.' },
    { id: '3', icon: 'trash', label: 'Litter Cleanup', points: 15, info: 'Pick up trash from a park, street, or outdoor area.' },
    { id: '4', icon: 'solar-panel', label: 'Use Solar Energy', points: 15, info: 'Use solar-powered devices or energy at home.' },
    { id: '5', icon: 'bicycle', label: 'Bike', points: 25, info: 'Ride a bike instead of driving to reduce emissions.' },
    { id: '6', icon: 'shopping-bag', label: 'Bring a Reusable Bag', points: 10, info: 'Use a reusable bag while shopping to avoid plastic waste.' },
    { id: '7', icon: 'tint', label: 'Use a Reusable Water Bottle', points: 10, info: 'Avoid single-use plastic bottles by refilling your own.' },
    { id: '8', icon: 'shower', label: 'Shorten Your Shower', points: 10, info: 'Take a quick shower to conserve water and energy.' },
    { id: '9', icon: 'subway', label: 'Use Public Transport', points: 15, info: 'Take a bus, train, or subway instead of driving alone.' },
    { id: '10', icon: 'recycle', label: 'Compost Food Waste', points: 20, info: 'Compost leftover food to reduce landfill waste and enrich soil.' },
    { id: '11', icon: 'tshirt', label: 'Upcycle an Item', points: 30, info: 'Give new life to old clothing or items instead of throwing them away.' },
    { id: '12', icon: 'seedling', label: 'Plant in a Garden', points: 25, info: 'Plant herbs, veggies, or flowers to support local pollinators.' },
    { id: '13', icon: 'clock', label: 'Use Appliances at Off-Peak Times', points: 25, info: 'Run appliances during off-peak hours to reduce grid strain.' },
    { id: '14', icon: 'carrot', label: 'Buy Local Produce', points: 25, info: 'Purchase fruits or vegetables from local farmers or markets.' },
    { id: '15', icon: 'tshirt', label: 'Buy Secondhand Item', points: 25, info: 'Purchase an item used or from a secondhand store.' }
  ];
  
const ConfirmationPopup = ({ visible, points, onDone }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
        // Start scale animation
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
        }).start();

        // Trigger haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Auto-dismiss after 1.5 seconds
        const timer = setTimeout(() => {
            scaleAnim.setValue(0);
            onDone();
        }, 1500);

        return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <View style={tw`absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-black bg-opacity-40 z-50`}>
        <Animated.View style={[tw`bg-white p-8 rounded-full shadow-lg items-center`, { transform: [{ scale: scaleAnim }] }]}>
            <FontAwesome5 name="check-circle" size={60} color="green" />
            <Text style={[tw`mt-4 text-xl text-green-800`, { fontFamily: "Nunito_700Bold" }]}>
            +{points} points!
            </Text>
        </Animated.View>
        </View>
    );
};
  
  

const imageMap = {
    "kanagroo": require("../../assets/user_icons/kangaroo.png"),
    "koala": require("../../assets/user_icons/koala.png"),
    "sloth": require("../../assets/user_icons/sloth.png"),
    "default": require("../../assets/user_icons/sloth.png")
};

const CameraScreen = ({ userId, action, visible, onClose, onImageUploaded }) => {

    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);
    const [facing, setFacing] = useState('back');
    const [capturedPhoto, setCapturedPhoto] = useState(null);

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [earnedPoints, setEarnedPoints] = useState(0);


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

            setEarnedPoints(result.action_points);
            setShowConfirmation(true);

            setCapturedPhoto(null); // Clear the preview

            setTimeout(() => {
                setCapturedPhoto(null);
                onClose();
              }, 1500);
              
        } catch (error) {
            console.log("Upload failed:", error);
            Alert.alert("Error","Failed to submit photo. Please check your network connection.");
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
                                    <View>
                                        <TouchableOpacity style={tw`p-2 self-end`} onPress={toggleCameraFacing}>
                                            <FontAwesome5 name="sync-alt" size={24} color="black" />
                                        </TouchableOpacity>
                                    </View>
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
                <ConfirmationPopup
                visible={showConfirmation}
                points={earnedPoints}
                onDone={() => setShowConfirmation(false)}
                />
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
    const [searchText, setSearchText] = useState("");

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [earnedPoints, setEarnedPoints] = useState(0);

    const filteredActions = ecoActions.filter(action =>
        action.label.toLowerCase().includes(searchText.toLowerCase())
      );
      


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
            setEarnedPoints(action.points);
            setShowConfirmation(true);
        } catch (error) {
            console.log('Error logging action:', error);
            Alert.alert('Error', 'Something went wrong while adding the action. Please check your network connection.');
        }
    };


    return (
        <View style={tw`flex-1 px-4`}>
          {/* Search bar */}
          <View style={tw`flex pt-6 justify-center`}>
            <TextInput
              style={tw`px-4 py-2 border border-gray-300 rounded-full`}
              placeholder="Search activities..."
              placeholderTextColor="#909090"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
      
          {/* List of actions */}
          <FlatList
            data={filteredActions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={tw`border-b border-gray-300 py-4 w-full`}>
                <TouchableOpacity
                  style={tw`flex-row justify-between items-center w-full px-4`}
                  onPress={() => setSelectedAction(item)}
                >
                  <View style={tw`flex-row items-center ml-0 w-2/3`}>
                    <FontAwesome5 name={item.icon} size={24} color="black" style={tw`mr-4`} />
                    <Text style={[tw`text-lg`, { fontFamily: "Nunito_400Regular" }]}>{item.label}</Text>
                  </View>
      
                  <Text style={[tw`text-sm text-green-700`, { fontFamily: "Nunito_700Bold" }]}>
                    +{item.points} pts
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
      
          {/* Action Details Modal */}
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
      
                <View style={tw`justify-center items-center h-1/2`}>
                  {selectedAction && (
                    <>
                      <FontAwesome5 name={selectedAction.icon} size={80} color="green" />
                      <Text style={[tw`text-2xl mt-6`, { fontFamily: "Nunito_700Bold" }]}>
                        {selectedAction.label}
                      </Text>
                      <Text style={[tw`text-sm text-green-700`, { fontFamily: "Nunito_700Bold" }]}>
                        +{selectedAction.points} pts
                      </Text>
                      <Text style={[tw`text-xl pt-6 text-center`, { fontFamily: "Nunito_500Regular" }]}>
                        {selectedAction.info}
                      </Text>
                    </>
                  )}
                </View>
      
                <View style={tw`justify-center items-center w-full`}>
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
                    <Text style={[tw`text-lg font-bold`, { fontFamily: "Nunito_400Regular" }]}>
                      Take Photo
                    </Text>
                  </TouchableOpacity>
      
                  <TouchableOpacity
                    onPress={() => {
                      handleActionSelect(selectedAction);
                      setSelectedAction(null);
                    }}
                    style={tw`bg-white justify-center items-center w-5/6 mt-8 py-2 shadow-lg`}
                  >
                    <Text style={[tw`text-lg font-bold`, { fontFamily: "Nunito_400Regular" }]}>
                      Add
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
      
            <CameraScreen
              userId={user.user_id}
              action={selectedAction}
              setImage={setImage}
              visible={showCamera}
              onClose={() => {
                setShowCamera(false);
                setSelectedAction(null);
              }}
            />
      
            <Modal
              visible={showImage && image !== ""}
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
                  <Image source={{ uri: 'file://' + image }} style={{ width: '100%', height: '80%' }} />
                </View>
              </View>
            </Modal>
          </Modal>
          <ConfirmationPopup
            visible={showConfirmation}
            points={earnedPoints}
            onDone={() => setShowConfirmation(false)}
          />
        </View>
      );      
};

const Activity = ({ route, navigation }) => {
    const { user } = route.params || {};
    const [userPoints, setUserPoints] = useState(user.points);

    useEffect(() => {
        setUserPoints(user.points);
    }, [user.points]);

    const isCustomAvatar = user.icon && user.icon.startsWith('{');
    let parsedAvatar = null;
    try {
        if (isCustomAvatar) {
            parsedAvatar = JSON.parse(user.icon);
        }
    } catch (error) {
        console.log("Failed to parse custom avatar:", error);
    }


    return (
        user ?
            <SafeAreaView style={tw`flex items-center justify-start bg-white w-full h-full`}>
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
            <View><Text>Loading...</Text></View>
    );
};

export default Activity;