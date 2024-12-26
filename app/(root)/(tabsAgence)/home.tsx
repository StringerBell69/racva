import { useUser } from "@clerk/clerk-expo";
import { useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Print from "expo-print";
import MapAgence from "@/components/MapsAgencesUser";
import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { Rent } from "@/types/type";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";


const Home = () => {
  const { user } = useUser();
  const { isLoaded } = useUser();
  const { isSignedIn } = useUser();
  

  
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

  const generateAndDownloadPdf = async (
    renter: string,
    amount: number,
    paid: boolean,
    date: string,
    date_end: string
  ) => {
    const htmlContent = `
      <html>
        <body>
          <h1>Contrat de Location</h1>
          <p>Locataire: ${renter}</p>
          <p>Montant: ${paid ? amount : "Non payé"} €</p>
          <p>Date de début: ${new Date(date).toLocaleDateString()}</p>
          <p>Date de fin: ${new Date(date_end).toLocaleDateString()}</p>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      await Sharing.shareAsync(uri); // Cela permettra aux utilisateurs de télécharger ou de partager le PDF
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
    }
  };

  return (
    <SafeAreaView className="bg-white pb-20">
      <ScrollView className="bg-white p-4">
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

        {/* Section de la localisation actuelle */}
        <Text className="text-xl font-JakartaBold mt-5 mb-3">
          Votre localisation actuelle
        </Text>
        <View className="flex flex-row items-center bg-transparent h-[300px]">
          <MapAgence />
        </View>

        {/* Section des locations récentes */}
        <View className="pt-4 mb-4">
          <Text className="text-lg font-bold mb-2">Locations récentes</Text>
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

export default Home;
