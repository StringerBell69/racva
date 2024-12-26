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

const ModifyCar: React.FC = () => {
  const { car } = useCarStore();



  const {
    data: recentRentals,
    loading: loadingRents,
    error: errorRents,
  } = useFetch<Rent[]>(`/(api)/cars/rents/allRents/${car?.id_voiture}`);

 
  const isLoading = loadingRents;
  const errorMessage = errorRents;

  if (!car) {
    return (
      <View className="flex flex-col items-center justify-center">
        <Image
          source={images.noResult}
          className="w-40 h-40"
          alt="Aucune location récente trouvée"
          resizeMode="contain"
        />
        <Text className="text-sm">Aucune location récente trouvée</Text>
      </View>
    );
  }

  const total =
    (car.price_per_day || 0) * 5 + (car.price_full_weekend || 0) * 2;

  if (isLoading) {
    return <Text>Chargement...</Text>;
  }

  if (errorMessage) {
    return (
      <View className="flex flex-col items-center justify-center">
        <Text className="text-sm">Erreur lors du chargement des données: {errorMessage}</Text>
      </View>
    );
  }

  

  return (
<SafeAreaView className="flex-1 bg-white">

    <ScrollView className="bg-white p-4">
      <View className="flex-row items-center p-4 bg-white">
        <TouchableOpacity onPress={() => router.back()}>
          <View className="p-2 rounded-full bg-gray-200">
            <Image source={icons.backArrow} className="w-6 h-6" />
          </View>
        </TouchableOpacity>
        <Text className="ml-4 text-xl font-bold text-gray-800">
          {"Retour"}
        </Text>
      </View>

     

      <View className="mb-4">
        <Text className="text-lg font-bold mb-2">Locations Récentes</Text>
        {recentRentals && recentRentals.length > 0 ? (
          recentRentals.map((rent, index) => {
            const { renter, amount, paid, date, date_end } = rent;
            const startDate = new Date(date);
            const endDate = new Date(date_end);
            const daysDifference =
              (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);

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
                    Gains: {paid ? amount : "Non payé"} €
                  </Text>
                </View>
                <TouchableOpacity
                  className="bg-blue-500 py-1 px-3 rounded-full"
                  onPress={() => alert(`Téléchargement du contrat pour ${renter}...`)}
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

      
    </ScrollView>
    </SafeAreaView>
  );
};

export default ModifyCar;
