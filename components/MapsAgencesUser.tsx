import React from "react";
import { ActivityIndicator, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import MapView, { Marker, PROVIDER_DEFAULT, Callout } from "react-native-maps";
import * as Linking from "expo-linking";
import { useFetch } from "@/lib/fetch";
import { useDriverStore, useLocationStore } from "@/store";
import { FontAwesome5 } from "@expo/vector-icons";
import { icons } from "@/constants";

// Définir les types appropriés
interface AgenceData {
  id_agence: string;
  first_name: string;
  latitude: number;
  longitude: number;
}

const Map = () => {
  const { userLongitude, userLatitude } = useLocationStore();
  const { selectedDriver } = useDriverStore();
  const {
    data: agence,
    loading,
    error,
  } = useFetch<AgenceData[]>(`/(api)/agence/agences`);

  // Gérer la validation des coordonnées - rendue moins stricte
  const hasValidCoordinates = (agency: AgenceData): boolean => {
    return (
      agency.latitude !== undefined &&
      agency.longitude !== undefined &&
      agency.latitude !== null &&
      agency.longitude !== null
    );
  };

  const openWaze = (latitude: number, longitude: number) => {
    if (!latitude || !longitude) return;

    const wazeUrl = `https://www.waze.com/fr/live-map/directions?navigate=yes&to=ll.${latitude},${longitude}`;
    Linking.openURL(wazeUrl).catch((err) => {
      console.error("Échec de l'ouverture de l'URL Waze:", err);
    });
  };

  const onShowCars = (agency: AgenceData) => {
    if (!agency.id_agence) return;
    router.push(`/find-ride?id_agence=${agency.id_agence}`);
  };

  // État de chargement
  if (loading) {
    return (
      <View className="flex justify-center items-center w-full h-full">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <View className="flex justify-center items-center w-full h-full">
        <Text>Erreur lors du chargement des données de la carte</Text>
      </View>
    );
  }

  // État sans données
  if (!agence || agence.length === 0) {
    return (
      <View className="flex justify-center items-center w-full h-full">
        <Text>Aucune donnée d'agence disponible.</Text>
      </View>
    );
  }

  // Calculer la région basée sur la localisation de l'utilisateur ou la première agence valide
  const defaultRegion = {
    latitude: agence[0]?.latitude || 48.8566, // Utiliser la première agence ou Paris
    longitude: agence[0]?.longitude || 2.3522,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const region =
    userLatitude && userLongitude
      ? {
          latitude: userLatitude,
          longitude: userLongitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }
      : defaultRegion;

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      className="w-full h-full rounded-2xl"
      tintColor="black"
      mapType="mutedStandard"
      initialRegion={region}
      showsPointsOfInterest={false}
      showsUserLocation={true}
      userInterfaceStyle="light"
    >
      {agence.filter(hasValidCoordinates).map((agency, index) => (
        <Marker
          key={`${agency.first_name}-${index}`}
          coordinate={{
            latitude: Number(agency.latitude),
            longitude: Number(agency.longitude),
          }}
          title={agency.first_name}
          image={
            selectedDriver === Number(agency.first_name)
              ? icons.selectedMarker
              : icons.marker
          }
        >
          <Callout className="w-48 p-4 rounded-lg bg-general shadow-md">
            <Text className="text-lg font-bold text-center mb-4">
              {agency.first_name}
            </Text>

            <View className="space-y-3">
              <Pressable
                onPress={() => onShowCars(agency)}
                className="flex-row items-center justify-center bg-gold py-2 px-3 rounded-lg"
              >
                <FontAwesome5
                  name="car"
                  size={16}
                  color="black"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-black text-sm font-semibold">
                  Voir les voitures
                </Text>
              </Pressable>

              <Pressable
                onPress={() => openWaze(agency.latitude, agency.longitude)}
                className="flex-row items-center justify-center bg-[#2D9CDB] py-2 px-3 rounded-lg"
              >
                <FontAwesome5
                  name="waze"
                  size={16}
                  color="black"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-black text-sm font-semibold">
                  Aller sur Waze
                </Text>
              </Pressable>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
};

export default Map;
