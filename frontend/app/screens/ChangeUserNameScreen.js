import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet
} from "react-native";
import tw from "../../components/tailwind";

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ChangeUsernameScreen({ route }) {
    const { user } = route.params;
    const [newUsername, setNewUsername] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [statusColor, setStatusColor] = useState("text-green-700");

    const handleChangeUsername = async () => {
        if (!newUsername.trim()) {
            setStatusMessage("Please enter a username.");
            setStatusColor("text-red-600");
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/auth/change_username`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: user.user_id,
                    new_username: newUsername
                })
            });

            const data = await response.json();

            if (response.ok) {
                setStatusMessage("Username updated successfully!");
                setStatusColor("text-green-700");
            } else {
                setStatusMessage(data.error || "Something went wrong.");
                setStatusColor("text-red-600");
            }
        } catch (error) {
            console.error("Error updating username:", error);
            setStatusMessage("Failed to update username.");
            setStatusColor("text-red-600");
        }
    };

    return (
        <View style={tw`flex-1 items-center justify-center bg-white px-6`}>
            <Text style={tw`text-2xl font-bold mb-4 text-green-800`}>
                Change Username
            </Text>

            <TextInput
                placeholder="Enter new username"
                value={newUsername}
                onChangeText={setNewUsername}
                style={tw`w-full p-3 border rounded-lg mb-2 border-gray-300`}
                autoCapitalize="none"
            />

            {statusMessage !== "" && (
                <Text style={tw`${statusColor} mb-4 text-sm`}>{statusMessage}</Text>
            )}

            <TouchableOpacity
                onPress={handleChangeUsername}
                style={tw`bg-green-400 px-5 py-3 rounded-full`}
            >
                <Text style={tw`text-white font-bold`}>Update</Text>
            </TouchableOpacity>
        </View>
    );
}
