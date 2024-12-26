import { useUser } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import RideLayout from "@/components/RideLayout";
import { generateAndDownloadPdf } from "@/components/GeneratePDF";

import CustomInput from "@/components/CustomTextInput";

import { useFetch } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { Rent, HomeProps } from "@/types/type";
import { Ionicons } from "@expo/vector-icons";
const Home: React.FC<HomeProps> = ({ title }) => {
  const { user } = useUser();
  const [searchText, setSearchText] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);

  const dynamicTitle =
    title || (user?.firstName ? `Bonjour ${user.firstName} 👋` : "Bonjour 👋");

  const { setUserLocation, setDestinationLocation } = useLocationStore();

  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const {
    data: recentRentals,
    loading: loadingRents,
    error: errorRents,
  } = useFetch<Rent[]>(`/(api)/cars/rents/allRentsHomeUser/${user?.id}`);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasPermission(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!,
      });

      setUserLocation({
        latitude: location.coords?.latitude,
        longitude: location.coords?.longitude,
        address: `${address[0].name}, ${address[0].region}`,
      });
    })();
  }, []);

  const handleInputChange = (text: string) => {
    setSearchText(text);
  };

  const handleIconClick = () => {
    router.push(`/find-ride?searchText=${searchText}`);
  };
  const handleFocus = () => setIsInputFocused(true);

  return (
    <RideLayout title={dynamicTitle}>
      <ScrollView className="bg-white p-4">
        <View className="flex-1 justify-center items-center">
          <CustomInput
            onFocus={handleFocus}
            onChangeValue={handleInputChange}
            pressableIconClick={handleIconClick}
          />
        </View>
        {/* Section des Locations Récentes */}
        <View className="pt-4 mb-4">
          <Text className="text-lg font-bold mb-2">Dernière Location</Text>
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
                      Payé: {paid ? amount : "Non payé"} €
                    </Text>
                  </View>
                 
                </View>
              );
            })
          ) : (
            <Text className="text-sm text-gray-600">Aucune location récente</Text>
          )}
        </View>
      </ScrollView>
    </RideLayout>
  );
};

export default Home;
