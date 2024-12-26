import { useUser } from "@clerk/clerk-expo";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Cbutton from "@/components/Cbutton"; // Adjust the import path accordingly
import { router } from "expo-router";
import CarsCard from "@/components/CarsCard";
import { images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { Car } from "@/types/type";
import { useCarStore } from "@/store";
import { useState, useCallback } from "react";

const Cars = () => {
  const { user } = useUser();
  const { setCar } = useCarStore();
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: allCars,
    loading,
    error,
    refetch, // Refetch function to reload data
  } = useFetch<Car[]>(`/(api)/cars/${user?.id}`);
  const handleCardPress = (car: Car) => {
    setCar(car);
    router.push(`/(pages)/carsAction/modifyCar`);
  };

  const handleCreate = () => {
    router.push(`/(pages)/carsAction/createCar`);
  };

  // Function to handle refreshing the list
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch(); // Call refetch to reload data
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={allCars}
        renderItem={({ item }) => (
          <CarsCard
            voiture={item}
            onPress={() => handleCardPress(item)} // Pass the onPress function with the car item
          />
        )}
        keyExtractor={(item, index) => index.toString()}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        refreshing={refreshing} // Add refreshing state
        onRefresh={onRefresh} // Add onRefresh handler
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  alt="Aucun résultat trouvé"
                  resizeMode="contain"
                />
                <Text className="text-sm">Aucun résultat trouvé</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            <View className="flex flex-row items-center justify-between my-5">
              <Text className="text-2xl font-bold">Mes Voitures</Text>
              {/* <TouchableOpacity
                className="bg-gold-dark py-1 px-3 rounded-full"
                onPress={handleCreate}
              >
                <Text className="text-white text-center text-sm">Nouvelle Voiture</Text>
              </TouchableOpacity> */}
            </View>
          </>
        }
      />
    </SafeAreaView>
  );
};

export default Cars;
