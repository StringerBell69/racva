import React, { useState } from "react";
import { ActivityIndicator, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import MapView, { Marker, PROVIDER_DEFAULT, Callout } from "react-native-maps";
import * as Linking from "expo-linking";
import { useFetch } from "@/lib/fetch";
import { useDriverStore, useLocationStore } from "@/store";
import { AgenceData } from "@/types/type";
import { icons } from "@/constants";
import { calculateRegion } from "@/lib/map";
import { FontAwesome5 } from "@expo/vector-icons"; // For icons (e.g., car and Waze)
import { useNavigation } from "@react-navigation/native";

const Map = () => {
  const { userLongitude, userLatitude } = useLocationStore();
  const { selectedDriver } = useDriverStore();
  const {
    data: agence,
    loading,
    error,
  } = useFetch<AgenceData[]>(`/(api)/agence/agences`);

  const openWaze = (latitude: number, longitude: number) => {
    const wazeUrl = `https://www.waze.com/fr/live-map/directions?navigate=yes&to=ll.${latitude},${longitude}`;

    Linking.openURL(wazeUrl).catch((err) => {
      console.error("Failed to open Waze URL:", err);
    });
  };

const onShowCars = (agency: AgenceData) => {
  router.push(`/find-ride?id_agence=${agency.id_agence}`);
};

  

  if (error) {
    return (
      <View className="flex justify-center items-center w-full h-full">
        <Text>Error: {error}</Text>
      </View>
    );
  }

  if (!agence || agence.length === 0) {
    return (
      <View className="flex justify-center items-center w-full h-full">
        <Text>No agency data available.</Text>
      </View>
    );
  }

  const region = calculateRegion({
    userLatitude,
    userLongitude,
  });

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
      {agence.map((agency, index) => (
        <Marker
          key={`${agency.first_name}-${index}`}
          coordinate={{
            latitude: agency.latitude,
            longitude: agency.longitude,
          }}
          title={agency.first_name}
          image={
            selectedDriver === +agency.first_name
              ? icons.selectedMarker
              : icons.marker
          }
        >
          <Callout className="w-48 p-4 rounded-lg bg-general shadow-md">
            {/* Agency Title */}
            <Text className="text-lg font-bold text-center mb-4">
              {agency.first_name}
            </Text>

            {/* Buttons Container */}
            <View className="space-y-3">
              {/* See Cars Button */}
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
              </Pressable>

              {/* Go to Waze Button */}
              <Pressable
                onPress={() => openWaze(agency.latitude, agency.longitude)}
                className="flex-row items-center justify-center bg-[#2D9CDB] py-2 px-3 rounded-lg"
              >
                <FontAwesome5
                  name="waze"
                  size={16}
                  color="black"
                  style={{ marginRight: 8 }} // Space between icon and text
                />
                <Text className="text-black text-sm font-semibold">
                  Go to Waze
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
