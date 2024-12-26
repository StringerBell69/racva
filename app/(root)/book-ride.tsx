import React, { useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { StripeProvider } from "@stripe/stripe-react-native";
import {
  Image,
  Pressable,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import Payment from "@/components/Payment";
import { icons } from "@/constants";
import { router, useLocalSearchParams } from "expo-router";

const BookRide = () => {
  const { user } = useUser();
  const { id_agence, id_voiture, start, end, amount, agenceTrue } =
    useLocalSearchParams();

  const [copiedLink, setCopiedLink] = useState(false);

  // Ensure start and end are valid date strings
  const formattedStart = start
    ? new Date(Array.isArray(start) ? start[0] : start!).toLocaleDateString()
    : "";
  const formattedEnd = end
    ? new Date(Array.isArray(end) ? end[0] : end!).toLocaleDateString()
    : "";

  // Generate payment link
  const generatePaymentLink = async () => {
    const baseUrl = "https://yourapp.com/payment";
    const paymentLink = `${baseUrl}?agence=${id_agence}&voiture=${id_voiture}&amount=${amount}&start=${start}&end=${end}`;

    // Copy to clipboard
    await Clipboard.setStringAsync(paymentLink);

    // Show copied confirmation
    setCopiedLink(true);
    Alert.alert(
      "Lien copié",
      "Le lien de paiement a été copié dans le presse-papiers.",
      [{ text: "OK", onPress: () => setCopiedLink(false) }]
    );

    return paymentLink;
  };

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

          {/* Payment Link for Agency */}
          {agenceTrue && (
            <TouchableOpacity
              onPress={generatePaymentLink}
              className="mt-4 p-3 rounded-lg border-2 border-gold-dark bg-transparent"
            >
              <Text className="text-gray-900 text-center font-semibold">
                Générer un lien de paiement et réserver
              </Text>
            </TouchableOpacity>
          )}

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
