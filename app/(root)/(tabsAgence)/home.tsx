import { useUser } from "@clerk/clerk-expo";
import { useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Print from "expo-print";
import MapAgence from "@/components/MapsAgencesUser";
import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { Rent } from "@/types/type";
import * as Sharing from "expo-sharing";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";


const Home = () => {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useUser();
  const [expandedRentId, setExpandedRentId] = useState<string | null>(null);


  
  const { signOut } = useAuth();
  

  const { setUserLocation, setDestinationLocation } = useLocationStore();

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };

  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const {
    data: recentRentals,
    loading: loadingRents,
    error: errorRents,
  } = useFetch<Rent[]>(`/(api)/cars/rents/allRentsHome/${user?.id}`);
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

  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setDestinationLocation(location);

    router.push("/(root)/find-ride");
  };

  
  if (!isLoaded || !user) {
    console.log("User is not loaded or not signed in");
    return;
  }

  const handleMessageClient = async (rent: Rent) => {
    // Implement your messaging logic here
    console.log(`Messaging client with ID: ${rent.id}`);
    const response = await fetch(
      `/(api)/cars/rents/allRentsHome/cancel-validate/${rent.id}?response=TRUE&&userId=${user.id}`
    );
    Alert.alert(
      "Location Acceptée",
      "Votre client(e) va être informé(e) par mail."
    );
  };

  const handleCancelRental = async (rent: Rent) => {
    // Implement your cancellation logic here
    const response = await fetch(
      `/(api)/cars/rents/allRentsHome/cancel-validate/${rent.id}?response=FALSE&&userId=${user.id}`
    );

    Alert.alert("Location Refusée",           
                "Votre client(e) va être informé(e) par mail.");
  };

  const renderRecentRentals = () => {
    if (!recentRentals || recentRentals.length === 0) {
      return (
        <View className="flex-1">
          <Text className="text-sm text-gray-600 text-center">
            Aucune location récente trouvée.
          </Text>
        </View>
      );
    }

    return recentRentals.map((rent, index) => {
      const {
        id,
        renter,
        amount,
        paid,
        date,
        date_end,
        renter_phone,
        renter_email,
        vehicle_brand,
        vehicle_model,
        vehicle_plate,
        vehicle_condition,
        agency_name,
        agency_address,
        agency_phone,
        agency_email,
      } = rent;

      const startDate = new Date(date);
      const endDate = new Date(date_end);
      const Difference =
        (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
      const daysDifference = Difference === 0 ? 1 : Difference;
      const isExpanded = expandedRentId === id?.toString();

      return (
        <TouchableOpacity
          key={index}
          onPress={() => {
            setExpandedRentId((prevId) =>
              prevId === id?.toString() ? null : id?.toString() || null
            );
          }}
          className={`p-4 border border-gray-200 rounded-lg mb-2 ${
            isExpanded ? "bg-gray-50" : "bg-white"
          }`}
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-1 pr-4">
              <Text className="text-base font-semibold">{renter}</Text>
              <Text className="text-sm text-gray-600">
                Dates: {startDate.toLocaleDateString()} -{" "}
                {endDate.toLocaleDateString()} ({daysDifference} jours)
              </Text>
              <Text className="text-sm">
                Montant: {paid ? amount : "Not paid"} €
              </Text>
            </View>
          </View>

          {isExpanded && (
            <View className="mt-4 pt-4 border-t border-gray-200">
              <View className="flex-row justify-between space-x-2">
                <TouchableOpacity
                  onPress={() => handleMessageClient(rent)}
                  className="flex-1 flex-row items-center bg-green-500 p-2 rounded-lg justify-center"
                >
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text className="ml-2 text-white">Accepter</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleCancelRental(rent)}
                  className="flex-1 flex-row items-center bg-red-500 p-2 rounded-lg justify-center"
                >
                  <MaterialIcons name="cancel" size={20} color="white" />
                  <Text className="ml-2 text-white">Refuser</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>
      );
    });
  };

  return (
    <SafeAreaView className="bg-white pb-20 flex-1">
      <ScrollView className="bg-white p-4 flex-1">
        {/* Section de l'entête */}
        <View className="flex flex-row items-center justify-between my-5">
          <Text className="text-2xl font-JakartaExtraBold">
            Bienvenue {user?.firstName}👋
          </Text>
          <TouchableOpacity
            onPress={handleSignOut}
            className="justify-center items-center w-10 h-10 rounded-full bg-white"
          >
            <Image source={icons.out} className="w-4 h-4" />
          </TouchableOpacity>
        </View>

       
        <View className="flex flex-row items-center bg-transparent h-[300px]">
          <MapAgence />
        </View>

        
        <View className="mb-4 mt-4">
          <Text className="text-lg font-bold mb-2">Demandes de location</Text>
          {renderRecentRentals()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
