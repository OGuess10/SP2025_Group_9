import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
    Image,
    FlatList,
    ActivityIndicator
} from "react-native";
import tw from "../../components/tailwind";
import Avatar, { genConfig } from "@zamplyy/react-native-nice-avatar";
import { FontAwesome5 } from '@expo/vector-icons';


const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;
export default function UserPhotosScreen({ route, navigation }) {
    const { userId } = route.params;
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

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


    const openModal = (photoId) => {
        const photo = photos.find((p) => p.id === photoId);
        if (photo) {
            setSelectedPhoto({
                uri: `${BACKEND_URL}/action/get_images/${photoId}`,
                date: new Date(photo.uploaded_at).toLocaleDateString(),
            });
            setModalVisible(true);
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedPhoto(null);
    };

    if (loading) return <ActivityIndicator size="large" />;

    return (
        <View style={tw`flex-1 bg-white p-4`}>
            {/* Header */}
            <View style={tw`flex-row items-center mb-4`}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2 mr-2`}>
                    <FontAwesome5 name="chevron-left" size={20} color="#1B5E20" />
                </TouchableOpacity>

            </View>
            <Text style={[tw`text-xl mb-4`, { fontFamily: "Nunito_700Bold" }]}>Photos Uploaded</Text>

            {/* Image Grid */}
            <FlatList
                data={photos}
                numColumns={3}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => openModal(item.id)}>
                        <Image
                            source={{ uri: `${BACKEND_URL}/action/get_images/${item.id}` }}
                            style={tw`w-28 h-28 m-1 rounded-lg`}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                )}
            />

            {/* Zoom Modal */}
            <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={closeModal}
            >
            <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}>
                
                {selectedPhoto && (
                <View style={tw`w-11/12 h-5/6 relative`}>
                    <TouchableOpacity
                    onPress={closeModal}
                    style={[tw`absolute top-4 left-4 p-2`, { zIndex: 10 }]} 
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}   
                    >
                    <FontAwesome5 name="times" size={24} color="white" />
                    </TouchableOpacity>

                    <Image
                        source={{ uri: selectedPhoto.uri }}
                        style={tw`w-full h-full rounded-sm`}
                        resizeMode="contain"
                    />
                    <Text style={tw`absolute bottom-4 left-4 text-white px-2 py-1 rounded`}>
                        Uploaded: {selectedPhoto.date}
                    </Text>
                </View>
            )}
            </View>
        </Modal>
        </View>
    );
}
