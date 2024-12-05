import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
  Pressable,
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
  const [carData, setCarData] = useState<any>({});
  const [loading, setLoading] = useState(true); 

  const images = useMemo(() => {
    if (Array.isArray(routeImages)) return routeImages;
    if (typeof routeImages === "string") {
      return routeImages.split(",").filter((url) => url.trim() !== "");
    }
    return [];
  }, [routeImages]);

  const fetchCarData = async () => {
    try {
      const response = await fetch(
        `/(api)/cars/check-in/${id_agence}?carId=${id_voiture}`
      );
      const result = await response.json();
      console.log(result);
      setCarData(result.data[0] || {});

    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setLoading(false); // Stop loading when the API call finishes
    }
  };

  useEffect(() => {
    fetchCarData();
  }, [id_voiture, id_agence]);

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
          <View className="p-2.5 bg-gold rounded-full">
            <Image source={icons.backArrow} className="w-6 h-6" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Show loading indicator if data is being fetched */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
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

          {/* Image Carousel Indicator */}
          {images.length > 0 && (
            <View
              style={{
                position: "absolute",
                bottom: 10,
                left: 0,
                right: 0,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white" }}>
                {selectedImageIndex + 1} / {images.length}
              </Text>
            </View>
          )}

          {/* Title Section */}
          <View className="p-4">
            <Text className="text-black text-2xl font-bold">{name}</Text>
            <Text className="text-gray-500 mt-1">
              ⭐️ {carData.moyenne_rating} ({carData.nb_avis}) -{" "}
              {carData.price_per_day} €/jour -{" "}
              {carData.price_per_day_on_weekend} €/J (weekend)
            </Text>
          </View>

          {/* Unlock Section */}
          <View className="bg-gray-200 p-4 mx-4 rounded-xl flex-row items-center">
            <View className="flex-1">
              <Text className="text-black font-bold">{carData.nom_agence}</Text>
              <Text className="text-gray-500 mt-1">
                Sachez-en plus sur l'agence et découvrez ses services de
                location de voitures.
              </Text>
            </View>
            <View>
              <View className="w-10 h-10 bg-gold rounded-full items-center justify-center">
                <FontAwesome5 name="warehouse" size={16} color="black" />
              </View>
            </View>
          </View>

          {/* Description */}
          <View className="mt-4 px-4">
            <Text className="text-black text-xl font-bold">
              Description de la voiture
            </Text>
            <Text className="text-gray-500 mt-2">{carData.description}</Text>
            {/* <TouchableOpacity>
              <Text className="text-gold-dark mt-2">Voir plus</Text>
            </TouchableOpacity> */}
          </View>

          {/* Restrictions */}
          <View className="mt-4 px-4">
            <Text className="text-black text-xl font-bold">
              Restrictions du propriétaire
            </Text>
            <Text className="text-gray-500 mt-2">
              - Le véhicule est non-fumeur.{"\n"}- Le nettoyage est obligatoire,
              des pénalités seront appliquées en cas de non-respect.{"\n"}-
              Merci de respecter les règles sanitaires.
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
            <Pressable
              onPress={() =>
                router.push(
                  `/calendar?id_agence=${id_agence}&id_voiture=${id_voiture}&pricePerDay=${carData.price_per_day}&price_per_day_on_weekend=${carData.price_per_day_on_weekend}`
                )
              }
              className="bg-gray-900 rounded-xl p-4 items-center"
            >
              <Text className="text-gold font-bold">
                Vérifier la disponibilité
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}

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
