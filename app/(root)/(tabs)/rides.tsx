import { useUser } from "@clerk/clerk-expo";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateAndDownloadPdf } from "@/components/GeneratePDF";

import { useFetch } from "@/lib/fetch";
import { Rent } from "@/types/type";
import { Ionicons } from "@expo/vector-icons";

const Rides = () => {
  const { user } = useUser();

  const {
    data: recentRentals,
    loading: loadingRents,
    error: errorRents,
  } = useFetch<Rent[]>(`/(api)/cars/rents/allRentsHome/${user?.id}`);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* ScrollView wrapping the content with padding */}
      <ScrollView
        className="flex-1 pt-4 px-4"
        contentContainerStyle={{ paddingBottom: 75 }} // Ensure extra space at the bottom
      >
        {/* Recent Rentals Section */}
        <View className="mb-4">
          <Text className="text-lg font-bold mb-2">Recent rentals</Text>
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
                      Paid: {paid ? amount : "Not paid"} €
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="bg-gold-dark py-1 px-3 rounded-full "
                    onPress={() =>
                      generateAndDownloadPdf(
                        renter,
                        amount,
                        paid,
                        date,
                        date_end,
                        `Rental_Contract_${renter}_${endDate.toLocaleDateString()}`
                      )
                    }
                  >
                    <Text className="text-white text-center text-sm">
                      
                      <Ionicons name="document-text" size={16} color="white" />
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <Text className="text-sm text-gray-600">No recent rides</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Rides;
