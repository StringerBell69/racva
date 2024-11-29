import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { icons } from "@/constants";
import { FontAwesome5 } from "@expo/vector-icons";

const CarDetailsScreen = () => {
  const {
    id_agence,
    id_voiture,
    name,
    annee,
    address,
    images: routeImages,
    pricePerDay,
    pricePerWeekend,
  } = useLocalSearchParams();

  // Safely convert images to an array
  const images = useMemo(() => {
    if (Array.isArray(routeImages)) return routeImages;
    if (typeof routeImages === "string") {
      // Split the string of comma-separated image URLs
      return routeImages.split(",").filter((url) => url.trim() !== "");
    }
    return [];
  }, [routeImages]);

  const { width, height } = Dimensions.get("window");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  // Function to handle image click
  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setModalVisible(true);
  };

  // Function to close modal
  const closeModal = () => {
    setModalVisible(false);
  };

  // Handle image swipe in the modal
  const handleModalImageScroll = (event: any) => {
    const slide = Math.floor(event.nativeEvent.contentOffset.x / width);
    if (slide !== selectedImageIndex) {
      setSelectedImageIndex(slide);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Go Back Button */}
      <View className="absolute top-10 left-5 flex-row items-center bg-white/80 rounded-full p-2 z-10">
        <TouchableOpacity onPress={() => router.back()}>
          <View className="p-2.5 bg-gold-dark rounded-full">
            <Image source={icons.backArrow} className="w-6 h-6" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: 60 }}>
        {/* Image Carousel */}
        {images.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width}
            decelerationRate="fast"
            snapToAlignment="center"
            onScroll={(event) => {
              const slide = Math.ceil(
                event.nativeEvent.contentOffset.x / width
              );
              if (slide !== selectedImageIndex) setSelectedImageIndex(slide);
            }}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingHorizontal: 0 }}
          >
            {images.map((image, index) => (
              <TouchableOpacity key={index} onPress={() => openModal(index)}>
                <View style={{ width }}>
                  <Image
                    source={{ uri: image.trim() }}
                    style={{ width: "100%", height: 200, borderRadius: 10 }}
                    resizeMode="cover"
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View className="w-full h-52 bg-gray-400 items-center justify-center">
            <Text className="text-gray-500">No images available</Text>
          </View>
        )}

        {/* Title Section */}
        <View className="p-4">
          <Text className="text-black text-2xl font-bold">{name}</Text>
          <Text className="text-gray-500 mt-1">⭐️ 5.0 (3) - {annee}</Text>
        </View>

        {/* Unlock Section */}
        <View className="bg-gray-200 p-4 mx-4 rounded-xl flex-row items-center">
          <View className="flex-1">
            <Text className="text-black font-bold">Agence Paris</Text>
            <Text className="text-gray-500 mt-1">
              En toute autonomie. Ouvrez la voiture avec l'app, les clés sont à
              l'intérieur.
            </Text>
          </View>
          <View>
            <View className="w-10 h-10 bg-gold-dark rounded-full items-center justify-center">
              <FontAwesome5 name="warehouse" size={16} color="black" />
            </View>
          </View>
        </View>

        {/* Description */}
        <View className="mt-4 px-4">
          <Text className="text-black text-xl font-bold">
            Description de la voiture
          </Text>
          <Text className="text-gray-500 mt-2">
            Mon véhicule a tous ses entretiens à jour, quelques rayures du
            stationnement en ville. À l'intérieur, vous trouverez un adaptateur
            allume-cigare USB, un disque de stationnement ainsi qu'un plan pour
            le stationnement gratuit.
          </Text>
          <TouchableOpacity>
            <Text className="text-gold-dark mt-2">Voir plus</Text>
          </TouchableOpacity>
        </View>

        {/* Restrictions */}
        <View className="mt-4 px-4">
          <Text className="text-black text-xl font-bold">
            Restrictions du propriétaire
          </Text>
          <Text className="text-gray-500 mt-2">
            - Le véhicule est non-fumeur.{"\n"}- Le nettoyage est obligatoire,
            des pénalités seront appliquées en cas de non-respect.{"\n"}- Merci
            de respecter les règles sanitaires.
          </Text>
        </View>

        {/* Characteristics */}
        <View className="mt-4 px-4">
          <Text className="text-black text-xl font-bold">
            Caractéristiques techniques
          </Text>
          <Text className="text-gray-500 mt-2">
            Année: {annee || "2017"}
            {"\n"}
            Places: 2{"\n"}
            Compteur: 10,000 - 50,000 km
          </Text>
        </View>

        {/* Availability Button */}
        <View className="mt-6 px-4 mb-6">
          <TouchableOpacity className="bg-gray-900 rounded-xl p-4 items-center">
            <Text className="text-gold font-bold">
              Vérifier la disponibilité
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Full-Screen Modal for Image Carousel */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View className="flex-1 bg-black justify-center items-center">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: "center" }}
            onScroll={handleModalImageScroll}
            scrollEventThrottle={16}
            style={{ width, height }}
          >
            {images.map((image, index) => (
              <View key={index} style={{ width, height }}>
                <Image
                  source={{ uri: image.trim() }}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 0, // Fullscreen without container
                  }}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity
            onPress={closeModal}
            style={{
              position: "absolute",
              top: 50,
              right: 20,
              zIndex: 1,
            }}
          >
            <FontAwesome5 name="times" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default CarDetailsScreen;
