import { useUser } from "@clerk/clerk-expo";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Image, Pressable, Text, View } from "react-native";

import Payment from "@/components/Payment";
import { icons } from "@/constants";
import { useDriverStore, useLocationStore } from "@/store";
import { router, useLocalSearchParams } from "expo-router";

const BookRide = () => {
  const { user } = useUser();
  const { id_agence, id_voiture, start, end, amount } = useLocalSearchParams();

  // Ensure start and end are valid date strings
  const formattedStart = start
    ? new Date(Array.isArray(start) ? start[0] : start!).toLocaleDateString()
    : "";
  const formattedEnd = end
    ? new Date(Array.isArray(end) ? end[0] : end!).toLocaleDateString()
    : "";

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      merchantIdentifier="merchant.com.uber"
      urlScheme="myapp"
    >
      {/* Go Back Button */}
      <View className="absolute top-10 left-5 flex-row items-center bg-white/80 rounded-full p-2 z-10">
        <Pressable
          onPress={() => router.back()}
          className="p-2.5 bg-gold rounded-full"
        >
          <Image
            source={icons.backArrow}
            className="w-6 h-6"
            resizeMode="contain"
          />
        </Pressable>
      </View>

      {/* Main Content */}
      <View className="flex-1 mt-20 bg-gray-100 p-6 pt-16 relative">
        {/* Added padding and background for card effect */}
        {/* Card Container */}
        <View className="bg-white rounded-xl shadow-lg p-6">
          <Text className="text-lg font-bold text-black">Récapitulatif</Text>

          {/* Price Summary */}
          <View className="flex-row justify-between mt-4">
            <Text className="text-sm text-gray-700">Prix total:</Text>
            <Text className="text-sm font-semibold">
              {amount ? `${amount} €` : "N/A"}
            </Text>
          </View>

          {/* Date Summary */}
          <View className="flex-row justify-between mt-4">
            <Text className="text-sm text-gray-700">Dates:</Text>
            <Text className="text-sm font-semibold">
              {formattedStart} - {formattedEnd}
            </Text>
          </View>

          {/* Payment Component */}
          <View className="mt-4">
            {user && amount && id_agence && id_voiture && start && end && (
              <Payment
                fullName={user?.fullName!}
                email={user?.emailAddresses[0].emailAddress!}
                amount={Array.isArray(amount) ? amount[0] : amount!}
                id_agence={Array.isArray(id_agence) ? id_agence[0] : id_agence!}
                id_voiture={
                  Array.isArray(id_voiture) ? id_voiture[0] : id_voiture!
                }
                start={new Date(Array.isArray(start) ? start[0] : start!)}
                end={new Date(Array.isArray(end) ? end[0] : end!)}
              />
            )}
          </View>
        </View>
      </View>
    </StripeProvider>
  );
};

export default BookRide;
