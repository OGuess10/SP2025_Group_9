import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
    Image
} from "react-native";
import tw from "../../components/tailwind";
import Avatar, { genConfig } from "@zamplyy/react-native-nice-avatar";
import { FontAwesome5 } from '@expo/vector-icons';


const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

const imageMap = {
    default: require("../../assets/user_icons/sloth.png"),
    koala: require("../../assets/user_icons/koala.png"),
    kangaroo: require("../../assets/user_icons/kangaroo.png"),
};

export default function ChangeUsernameScreen({ route, navigation }) {
    const { user } = route.params;
    const [newUsername, setNewUsername] = useState(user.user_name || "");
    const [statusMessage, setStatusMessage] = useState("");
    const [statusColor, setStatusColor] = useState("text-green-700");


    const [modalVisible, setModalVisible] = useState(false);
    let initialAvatar = null;
    let initialAnimal = "default";
    try {
        if (user.icon && typeof user.icon === "string" && user.icon.trim().startsWith("{")) {
            initialAvatar = JSON.parse(user.icon);
            initialAnimal = null;
        } else {
            initialAnimal = user.icon || "default";
        }
    } catch (e) {
        console.warn("Invalid user icon JSON:", user.icon);
    }

    const [selectedAnimal, setSelectedAnimal] = useState(initialAnimal);
    const [customAvatar, setCustomAvatar] = useState(initialAvatar);
    const [avatarConfig, setAvatarConfig] = useState(() =>
        genConfig({
            sex: "man",
            faceColor: "#F9C9B6",
            hairStyle: "normal",
            hairColor: "#000",
            bgColor: "#FFFFFF",
            mouthStyle: "laugh",
            shirtColor: "#32a852",
        })
    );


    const avatarOptions = {
        faceColor: ["#FFD1DC", "#FFE0BD", "#F9C9B6", "#AC6651", "#8D5524"],
        hairStyle: ["normal", "thick", "mohawk", "womanLong", "womanShort"],
        hairColor: ["#FFDCB2", "#D6B370", "#B55239", "#5C4033", "#000"],
        bgColor: ["#FFFFFF", "#FFD1DC", "#A5D6A7"],
    };
    const hairStyleLabels = {
        normal: "Short",
        thick: "Very Short",
        mohawk: "Mohawk",
        womanLong: "Long",
        womanShort: "Medium",
    };

    const mouthStyleOptions = ["laugh", "smile", "peace"];
    const mouthStyleLabels = {
        laugh: "Laugh",
        smile: "Smile",
        peace: "Peace",
    };

    //const config = genConfig(avatarConfig);
    const hairColorEditable = ["normal", "womanLong", "womanShort"].includes(avatarConfig.hairStyle);


    const handleChangeUsername = async () => {
        if (!newUsername.trim()) {
            setStatusMessage("Please enter a username.");
            setStatusColor("text-red-600");
            return;
        }

        try {
            const body = {
                user_id: user.user_id,
                new_username: newUsername,
                new_icon: customAvatar ? JSON.stringify(customAvatar) : selectedAnimal
            };
    
            const response = await fetch(`${BACKEND_URL}/auth/change_username`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
    
            const data = await response.json();
    
            if (response.ok) {
                setStatusMessage("Username and avatar updated successfully!");
                setStatusColor("text-green-700");
                setTimeout(() => {
                    navigation.goBack();
                }, 1000);
            } else {
                setStatusMessage(data.error || "Something went wrong.");
                setStatusColor("text-red-600");
            }
            } 
            catch (error) {
                console.log("Error updating profile:", error);
                setStatusMessage("Failed to update profile.");
                setStatusColor("text-red-600");
            }
    };

    return (

        <ScrollView style={tw`flex-1 bg-white px-4 py-6`}>
            <View style={tw`flex-row items-center mb-4`}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={tw`p-2 mr-2`}
                >
                    <FontAwesome5 name="chevron-left" size={20} color="#1B5E20" />
                </TouchableOpacity>
            </View>


            <View style={tw`items-center justify-center`}>
                <Text style={tw`text-2xl font-bold mb-4 text-green-800`}>Edit User Profile</Text>

                {/* Show default animal avatar if selected, otherwise just defaulton */}
                {customAvatar ? (
                    <Avatar style={tw`w-32 h-32 mb-4`} {...customAvatar} />
                ) : (
                    <Image source={imageMap[selectedAnimal]} style={tw`w-32 h-32 mb-4`} />
                )}


                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={tw`bg-green-400 px-4 py-2 rounded-full mb-6`}
                >
                    <Text style={tw`text-white font-bold`}>Customize Avatar</Text>
                </TouchableOpacity>
                {/* OR divider */}
                <Text style={tw`text-sm text-gray-500 mb-2`}>or choose a default:</Text>

                <View style={tw`flex-row justify-center mb-4`}>
                    {Object.entries(imageMap).map(([key, src]) => (
                        <TouchableOpacity
                            key={key}
                            onPress={() => {
                                setSelectedAnimal(key);
                                setCustomAvatar(null);
                            }}
                        >
                            <Image source={src} style={tw`w-12 h-12 mx-2 rounded-full`} />
                        </TouchableOpacity>
                    ))}
                </View><View style={tw`w-full items-center`}>
                    <View style={tw`flex-row items-center justify-center mb-2`}>
                        {/* Label */}
                        <Text style={tw`text-base font-bold mr-2 text-green-800`}>
                            Username:
                        </Text>

                        {/* Input */}
                        <TextInput
                            placeholder={user.user_name}
                            value={newUsername}
                            onChangeText={setNewUsername}
                            style={tw`w-40 p-2 border rounded-lg border-gray-300`}
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Status Message - move outside the row */}
                    {statusMessage !== "" && (
                        <Text style={tw`${statusColor} text-sm mt-1`}>{statusMessage}</Text>
                    )}
                </View>

                <View style={tw`w-full flex-row justify-end mt-20 pr-4`}>
                    <TouchableOpacity
                        onPress={handleChangeUsername}
                        style={tw`bg-blue-500 px-5 py-3 rounded`}
                    >
                        <Text style={tw`text-white font-bold`}>Update Changes</Text>
                    </TouchableOpacity>
                </View>

            </View>

            {/* Modal for customizing avatar */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={tw`flex-1 justify-center items-center bg-white`}>

                    <View style={tw`bg-white justify-center items-center p-6 shadow-lg w-5/6 h-5/6 rounded-lg`}>
                        <TouchableOpacity
                            style={tw`absolute top-3 right-3 z-10 p-2`}
                            onPress={() => setModalVisible(false)}
                        >
                            <FontAwesome5 name="times" size={20} color="black" />
                        </TouchableOpacity>

                        <ScrollView contentContainerStyle={tw`pb-4`}>
                            <Text style={tw`text-xl font-bold mb-4 text-center`}>Customize Avatar</Text>

                            <Avatar style={tw`w-32 h-32 self-center mb-4`} {...avatarConfig} />

                            {/* Face Color */}
                            <Text style={tw`mb-2 font-bold`}>Face Color</Text>
                            <View style={tw`flex-row mb-4`}>
                                {avatarOptions.faceColor.map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        onPress={() => setAvatarConfig({ ...avatarConfig, faceColor: color })}
                                        style={[
                                            tw`w-10 h-10 rounded-full mr-2`,
                                            { backgroundColor: color, borderWidth: avatarConfig.faceColor === color ? 2 : 0 },
                                        ]}
                                    />
                                ))}
                            </View>

                            <Text style={tw`mb-2 font-bold`}>Hair Style</Text>
                            <View style={tw`flex-row flex-wrap mb-4`}>
                                {avatarOptions.hairStyle.map((style) => (
                                    <TouchableOpacity
                                        key={style}
                                        style={tw`mr-2 mb-2 px-3 py-1.5 rounded-full ${avatarConfig.hairStyle === style ? "bg-green-400" : "bg-gray-200"}`}
                                        onPress={() => setAvatarConfig({ ...avatarConfig, hairStyle: style })}
                                    >
                                        <Text>{hairStyleLabels[style]}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>


                            {["normal", "womanLong", "womanShort"].includes(avatarConfig.hairStyle) ? (
                        <>
                            <Text style={tw`mb-2 font-bold`}>Hair Color</Text>
                            <View style={tw`flex-row mb-4`}>
                            {avatarOptions.hairColor.map((color) => (
                                <TouchableOpacity
                                key={color}
                                onPress={() => setAvatarConfig({ ...avatarConfig, hairColor: color })}
                                style={[
                                    tw`w-10 h-10 rounded-full mr-2`,
                                    { backgroundColor: color, borderWidth: avatarConfig.hairColor === color ? 2 : 0 },
                                ]}
                                />
                            ))}
                            </View>
                        </>
                        ) : (
                        <Text style={tw`mb-4 text-gray-500 italic`}>Hair color cannot be changed for this style</Text>
                        )}


                            <Text style={tw`mb-2 font-bold`}>Mouth Style</Text>
                            <View style={tw`flex-row flex-wrap mb-4`}>
                                {mouthStyleOptions.map((style) => (
                                    <TouchableOpacity
                                        key={style}
                                        style={tw`mr-2 mb-2 px-3 py-1.5 rounded-full ${avatarConfig.mouthStyle === style ? "bg-green-400" : "bg-gray-200"
                                            }`}
                                        onPress={() => setAvatarConfig({ ...avatarConfig, mouthStyle: style })}
                                    >
                                        <Text>{mouthStyleLabels[style]}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>


                            {/* Background Color */}
                            <Text style={tw`mb-2 font-bold`}>Background Color</Text>
                            <View style={tw`flex-row mb-4`}>
                                {avatarOptions.bgColor.map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        onPress={() => setAvatarConfig({ ...avatarConfig, bgColor: color })}
                                        style={[
                                            tw`w-10 h-10 rounded-full mr-2`,
                                            { backgroundColor: color, borderWidth: avatarConfig.bgColor === color ? 2 : 0 },
                                        ]}
                                    />
                                ))}
                            </View>

                            {/* Submit */}
                            <TouchableOpacity
                                onPress={() => {
                                    setCustomAvatar(avatarConfig);
                                    setSelectedAnimal(null);
                                    setModalVisible(false);
                                }}
                                style={tw`bg-green-500 px-4 py-2 rounded-full mb-6`}
                            >
                                <Text style={tw`text-white font-bold text-center`}>Save Avatar</Text>
                            </TouchableOpacity>




                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </ScrollView >
    );
}
