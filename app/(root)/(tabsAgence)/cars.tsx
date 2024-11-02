import { useUser } from "@clerk/clerk-expo";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { router } from "expo-router";
import CarsCard from "@/components/CarsCard";
import { images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { Car } from "@/types/type";
import { useCarStore } from "@/store";



const Cars = () => {
  const { user } = useUser();
  const { setCar } = useCarStore();

  const {
    data: allCars,
    loading,
    error,
  } = useFetch<Car[]>(`/(api)/cars/${user?.id}`);

const handleCardPress = (car: Car) => {
  setCar(car);

  router.push("/(pages)/carsAction/modifyCar");
};

const handleCreate = () => {

  router.push("/(pages)/carsAction/createCar");
};


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
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  alt="No recent rides found"
                  resizeMode="contain"
                />
                <Text className="text-sm">No recent cars found</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            <View className="flex flex-row items-center justify-between my-5">
              <Text className="text-2xl font-bold">My Cars</Text>

              <TouchableOpacity
                className="bg-blue-500 px-2 py-1 rounded"
                onPress={handleCreate}
              >
                <Text className="text-white text-sm">Add New Car</Text>
              </TouchableOpacity>
            </View>
          </>
        }
      />
    </SafeAreaView>
  );
};



export default Cars;
