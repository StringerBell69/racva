import { useAuth } from "@clerk/clerk-expo";
import { useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { PaymentProps } from "@/types/type";

const Payment = ({
  fullName,
  email,
  amount,
  id_agence,
  id_voiture,

  start,
  end,
}: PaymentProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  

  const { userId } = useAuth();
  const [success, setSuccess] = useState<boolean>(false);

  const openPaymentSheet = async () => {
    await initializePaymentSheet();

    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      setSuccess(true);
    }
  };

  const initializePaymentSheet = async () => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Racva",
      intentConfiguration: {
        mode: {
          amount: parseInt(amount) * 100,
          currencyCode: "eur",
        },
        confirmHandler: async (
          paymentMethod,
          shouldSavePaymentMethod,
          intentCreationCallback,
        ) => {
          const { paymentIntent, customer } = await fetchAPI(
            "/(api)/(stripe)/create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: fullName || email.split("@")[0],
                email: email,
                amount: amount,
                paymentMethodId: paymentMethod.id,
              }),
            },
          );

          if (paymentIntent.client_secret) {
            const { result } = await fetchAPI("/(api)/(stripe)/pay", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                payment_method_id: paymentMethod.id,
                payment_intent_id: paymentIntent.id,
                customer_id: customer,
                client_secret: paymentIntent.client_secret,
              }),
            });

            if (result.client_secret) {
              await fetchAPI("/(api)/ride/create", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  id_agence: id_agence,
                  id_voiture: id_voiture,
                  start: start,
                  end: end,
                  payment_status: "upcoming",
                  amount: amount,
                  user_id: userId,
                }),
              });

              intentCreationCallback({
                clientSecret: result.client_secret,
              });
            }
          }
        },
      },
      returnURL: "myapp://book-ride",
    });

    if (!error) {
      // setLoading(true);
    }
  };

  return (
    <>
      <Pressable
        onPress={openPaymentSheet}
        className="bg-gray-900 rounded-xl p-4 items-center"
      >
        <Text className="text-gold font-bold text-base">Payer</Text>
      </Pressable>

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Réservation confirmée
          </Text>

          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Votre réservation a été confirmée avec succès. Veuillez vous
            préparer pour votre voyage.
          </Text>

          <Pressable
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/home");
            }}
            className="bg-gray-900 mt-5 rounded-xl p-4 items-center"
          >
            <Text className="text-gold font-bold text-base">Retour à l'accueil</Text>
          </Pressable>
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;
