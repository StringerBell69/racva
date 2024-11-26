import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { useCarStore } from "@/store";
import { icons, images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { Rent, Earnings } from "@/types/type";
import Cbutton from "@/components/Cbutton"; // Adjust the import path accordingly

const ModifyCar: React.FC = () => {
  const { car } = useCarStore();

  const {
    data: lastRent,
    loading: loadingLastRent,
    error: errorLastRent,
  } = useFetch<Rent[]>(`/(api)/cars/rent/${car?.id_voiture}`);

  const {
    data: actualEarningsData,
    loading: loadingEarnings,
    error: errorEarnings,
  } = useFetch<Earnings[]>(`/(api)/cars/paid/${car?.id_voiture}`);
  const {
    data: recentRentals,
    loading: loadingRents,
    error: errorRents,
  } = useFetch<Rent[]>(`/(api)/cars/rents/${car?.id_voiture}`);

  const actualEarnings = actualEarningsData?.[0]?.paid_count
    ? parseFloat(actualEarningsData[0].paid_count)
    : 0;

  const isLoading = loadingLastRent || loadingEarnings || loadingRents;
  const errorMessage = errorLastRent || errorEarnings || errorRents;

  if (!car) {
    return (
      <View className="flex flex-col items-center justify-center">
        <Image
          source={images.noResult}
          className="w-40 h-40"
          alt="No recent rides found"
          resizeMode="contain"
        />
        <Text className="text-sm">No recent rides found</Text>
      </View>
    );
  }
const handleCreate = () => {

  router.push("/(pages)/carsAction/edit");
};
  const total =
    (car.price_per_day || 0) * 5 + (car.price_full_weekend || 0) * 2;

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (errorMessage) {
    return (
      <View className="flex flex-col items-center justify-center">
        <Text className="text-sm">Error loading data: {errorMessage}</Text>
      </View>
    );
  }

  const latestRent =
    Array.isArray(lastRent) && lastRent.length > 0 ? lastRent[0] : null;

  const startDate = new Date(latestRent?.date || Date.now()); 
  const endDate = new Date(latestRent?.date_end || Date.now()); 
  const Difference =
    latestRent && startDate && endDate
      ? (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) 
      : 1;
const daysDifference = Difference === 0 ? 1 : Difference;
  return (
    <SafeAreaView className="flex-1 bg-white">

    <ScrollView className="bg-white p-4">
      <View className="flex-row items-center justify-between p-4 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <View className="p-2 rounded-full bg-gray-200">
              <Image source={icons.backArrow} className="w-6 h-6" />
            </View>
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-bold text-gray-800">
            {"Go Back"}
          </Text>
        </View>

        <Cbutton
          title="Edit Car"
          bgVariant="primary"
          textVariant="default"
          onPress={handleCreate}
        />
      </View>

      {latestRent ? (
        <View className="mb-4 p-4 border border-gray-300 rounded-lg flex-row justify-between items-center">
          <View>
            <Text className="text-lg font-bold mb-1">{latestRent.renter}</Text>
            <Text className="text-sm text-gray-600">
              Dates: {startDate.toLocaleDateString()} -{" "}
              {endDate.toLocaleDateString()} ({daysDifference} jours)
            </Text>
            <Text className="text-sm mb-1">Montant: {latestRent.amount} €</Text>
            <Text className="text-sm">
              {latestRent.paid ? "Déjà payé" : "En attente de paiement"}
            </Text>
          </View>
          <View className="flex-row items-center space-x-2">
            <View
              className={`h-3 w-3 rounded-full ${
                latestRent.status === "ongoing"
                  ? "bg-green-500"
                  : latestRent.status === "ended"
                    ? "bg-gray-500"
                    : latestRent.status === "cancelled"
                      ? "bg-red-500"
                      : "bg-blue-500"
              }`}
            />
            <TouchableOpacity
              className="bg-sky-400 py-1 px-3 rounded-full"
              onPress={() => alert("Creating PDF Contract...")}
            >
              <Text className="text-white text-center text-sm">
                PDF
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="flex flex-col items-center justify-center">
          <Image
            source={images.noResult}
            className="w-40 h-40"
            alt="No recent rides found"
            resizeMode="contain"
          />
          <Text className="text-sm">No recent rides found</Text>
        </View>
      )}

      <View className="mb-4">
        <Text className="text-lg font-bold mb-2">Rentabilité</Text>
        <View className="h-4 w-full bg-gray-300 rounded-full">
          <View
            className={`h-4 rounded-full bg-green-500`}
            style={{
              width: `${(actualEarnings / total) * 100}%`,
            }}
          />
        </View>
        <Text className="text-sm text-gray-600 mt-2">
          {actualEarnings} /{" "}
          {(
            (car.price_per_day || 0) * 5 +
            (car.price_full_weekend || 0) * 2
          ).toFixed(2)}{" "}
          € cette semaine
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-lg font-bold mb-2">Récentes Locations</Text>
        {recentRentals && recentRentals.length > 0 ? (
          recentRentals.map((rent, index) => {
            const { renter, amount, paid, date, date_end } = rent;
            const startDate = new Date(date);
            const endDate = new Date(date_end);
            const Difference =
              latestRent && startDate && endDate
                ? (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
                : 1;
            const daysDifference = Difference === 0 ? 1 : Difference;

            return (
              <View
                key={index}
                className="flex-row justify-between items-center p-4 border border-gray-200 rounded-lg mb-2"
              >
                <View>
                  <Text className="text-base font-semibold">{renter}</Text>
                  <Text className="text-sm text-gray-600">
                    Dates: {startDate.toLocaleDateString()} -{" "}
                    {endDate.toLocaleDateString()} ({daysDifference} jours)
                  </Text>
                  <Text className="text-sm">
                    Earnings: {paid ? amount : "Not paid"} €
                  </Text>
                </View>
                <TouchableOpacity
                  className="bg-blue-500 py-1 px-3 rounded-full"
                  onPress={() => alert(`Downloading contract for ${renter}...`)}
                >
                  <Text className="text-white text-center text-sm">
                    PDF
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <Text className="text-sm text-gray-600">Aucune location récente</Text>
        )}
      </View>

      <TouchableOpacity
        className="bg-blue-500 py-2 px-4 rounded-full mt-4"
        onPress={() => router.push(`/(pages)/carsAction/rents/allRents`)}
      >
        <Text className="text-white text-center">Toutes les Locations</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
};

export default ModifyCar;
