import React, { useEffect, useState } from "react";
import { View, FlatList, Image, ActivityIndicator, SafeAreaView } from "react-native";
import tw from "../../components/tailwind";

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

export default function UserPhotosScreen({ route }) {
    const { userId } = route.params;
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/action/get_user_photos?user_id=${userId}`);
                const data = await response.json();

                setPhotos(data.photos);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPhotos();
    }, [userId]);

    if (loading) return <ActivityIndicator size="large" />;

    return (
        <SafeAreaView style={tw`flex-1 bg-white`}>
            <FlatList
                data={photos}
                numColumns={3}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Image
                        source={{ uri: `${BACKEND_URL}/action/get_images/${item.id}` }}
                        style={tw`w-1/3 h-32`}
                    />
                )}
            />
        </SafeAreaView>
    );
}
