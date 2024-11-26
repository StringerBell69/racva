import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { useFetch } from "@/lib/fetch";
import { useDriverStore, useLocationStore } from "@/store";
import { AgenceData } from "@/types/type";
import { useUser } from "@clerk/clerk-expo";
import { icons } from "@/constants";
import { calculateRegion } from "@/lib/map";

const Map = () => {

  const { userLongitude, userLatitude } = useLocationStore();
  const { selectedDriver } = useDriverStore();

  const {
    data: agence,
    loading,
    error,
  } = useFetch<AgenceData[]>(`/(api)/agence/agences`);

  if (loading || (!userLatitude && !userLongitude)) {
    return (
      <View className="flex justify-between items-center w-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Error: {error}</Text>
      </View>
    );
  }

  if (!agence || agence.length === 0) {
    return (
      <View className="flex justify-center items-center w-full">
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
        />
      ))}
    </MapView>
  );
};

export default Map;
