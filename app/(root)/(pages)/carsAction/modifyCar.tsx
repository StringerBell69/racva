import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import Swiper from "react-native-swiper";
import { router } from "expo-router";
import { useCarStore } from "@/store";
import { icons, images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { Rent, Earnings } from "@/types/type";
import { Feather, Ionicons } from "@expo/vector-icons";
import { generateAndDownloadPdf } from "@/components/GeneratePDF";
import { Calendar } from "react-native-calendars"; // Assuming you're using a calendar component

const ModifyCar: React.FC = () => {
  const { car } = useCarStore();

  const {
    data: lastRent,
    loading: loadingLastRent,
    error: errorLastRent,
  } = useFetch<Rent[]>(`/(api)/cars/rent/${car?.id_voiture}`);

  const {
    data: actualEarningsData,
    loading: loadingEarnings,
    error: errorEarnings,
  } = useFetch<Earnings[]>(`/(api)/cars/paid/${car?.id_voiture}`);

  const {
    data: recentRentals,
    loading: loadingRents,
    error: errorRents,
  } = useFetch<Rent[]>(`/(api)/cars/rents/${car?.id_voiture}`);

  const actualEarnings = actualEarningsData?.[0]?.paid_count
    ? parseFloat(actualEarningsData[0].paid_count)
    : 0;

  const isLoading = loadingLastRent || loadingEarnings || loadingRents;
  const errorMessage = errorLastRent || errorEarnings || errorRents;

  const [selectedDateRange, setSelectedDateRange] = useState<{ start?: string; end?: string }>({});
  const [markedDates, setMarkedDates] = useState<any>({});

  const total =
    (car?.price_per_day || 0) * 5 + (car?.price_full_weekend || 0) * 2;

  if (!car) {
    return (
      <View className="flex flex-col items-center justify-center">
        <Image
          source={images.noResult}
          className="w-40 h-40"
          alt="No recent rides found"
          resizeMode="contain"
        />
        <Text className="text-sm">No recent rides found</Text>
      </View>
    );
  }

  const handleCreate = () => {
    router.push("/(pages)/carsAction/edit");
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color="#FFD700" />;
  }

  if (errorMessage) {
    return (
      <View className="flex flex-col items-center justify-center">
        <Text className="text-sm">Error loading data: {errorMessage}</Text>
      </View>
    );
  }

  const latestRent =
    Array.isArray(lastRent) && lastRent.length > 0 ? lastRent[0] : null;

  const startDate = new Date(latestRent?.date || Date.now());
  const endDate = new Date(latestRent?.date_end || Date.now());
  const Difference =
    latestRent && startDate && endDate
      ? (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
      : 1;
  const daysDifference = Difference === 0 ? 1 : Difference;

  // Photo gallery data
  const carPhotos = [car.photo_url, car.photo1, car.photo2, car.photo3].filter(
    (url) => url // Ensure we only use defined photo URLs
  );

  const handleDayPress = (day: { dateString: string }) => {
    const { dateString } = day;

    // Check if the day is disabled (booked)
    if (markedDates[dateString]?.disabled) {
      return;
    }

    const updatedMarkedDates = { ...markedDates };

    if (!selectedDateRange.start) {
      // First selection
      setSelectedDateRange({ start: dateString });
      updatedMarkedDates[dateString] = {
        startingDay: true,
        color: "#D4AF37",
        textColor: "black",
      };
    } else if (!selectedDateRange.end) {
      // Second selection (end date)
      let start = new Date(selectedDateRange.start);
      let end = new Date(dateString);

      if (end < start) {
        [start, end] = [end, start];
      }

      // Check for any booked days in the range
      const currentDate = new Date(start);
      const hasBookedDays = [];
      while (currentDate <= end) {
        const checkDate = currentDate.toISOString().split("T")[0];
        if (markedDates[checkDate]?.disabled) {
          hasBookedDays.push(checkDate);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (hasBookedDays.length > 0) {
        Alert.alert(
          "Invalid Selection",
          "Some dates in your selected range are already booked."
        );
        return;
      }

      // Mark the date range
      const selectedDates: string[] = [];
      currentDate.setDate(start.getDate());
      while (currentDate <= end) {
        const checkDate = currentDate.toISOString().split("T")[0];
        selectedDates.push(checkDate);

        updatedMarkedDates[checkDate] = {
          color: "#D4AF37",
          textColor: "black",
          ...(checkDate === start.toISOString().split("T")[0] && {
            startingDay: true,
          }),
          ...(checkDate === end.toISOString().split("T")[0] && {
            endingDay: true,
          }),
        };

        currentDate.setDate(currentDate.getDate() + 1);
      }

      setSelectedDateRange({ start: selectedDateRange.start, end: dateString });
    } else {
      // Reset selection
      const resetMarkedDates = { ...markedDates };

      // Remove selection marking from previously selected dates
      Object.keys(resetMarkedDates).forEach((date) => {
        if (resetMarkedDates[date]?.color === "#D4AF37") {
          delete resetMarkedDates[date];
        }
      });

      setSelectedDateRange({});
      setMarkedDates(resetMarkedDates);
      return;
    }

    setMarkedDates(updatedMarkedDates);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="bg-white p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 bg-white">
          <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
            <View className="p-2 rounded-full bg-gold">
              <Image source={icons.backArrow} className="w-6 h-6" />
            </View>
            <Text className="ml-4 text-xl font-bold text-gray-800">
              Go Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCreate}>
            <View className="flex-row items-center justify-center bg-gold rounded-lg p-2">
              <Feather name="edit" size={24} color="black" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Swipeable Photo Gallery */}
        {carPhotos.length > 0 ? (
          <View className="mb-4">
            <Swiper style={{ height: 200 }} showsButtons={false}>
              {carPhotos.map((photo, index) => (
                <View key={index} className="flex-1">
                  <Image
                    source={{ uri: photo }}
                    className="w-full h-full rounded-lg"
                    resizeMode="cover"
                  />
                </View>
              ))}
            </Swiper>
          </View>
        ) : (
          <Text className="text-sm text-gray-600">No photos available</Text>
        )}

        {/* Original Content Below */}
        {latestRent ? (
          <View className="mb-4 p-4 border border-gray-300 rounded-lg flex-row justify-between items-center">
            <View>
              <Text className="text-lg font-bold mb-1">
                {latestRent.renter}
              </Text>
              <Text className="text-sm text-gray-600">
                Dates: {startDate.toLocaleDateString()} -{" "}
                {endDate.toLocaleDateString()} ({daysDifference} jours)
              </Text>
              <Text className="text-sm mb-1">
                Montant: {latestRent.amount} €
              </Text>
              <Text className="text-sm">
                {latestRent.paid ? "Déjà payé" : "En attente de paiement"}
              </Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <View
                className={`h-3 w-3 rounded-full ${
                  latestRent.status === "ongoing"
                    ? "bg-green-500"
                    : latestRent.status === "ended"
                    ? "bg-gray-500"
                    : latestRent.status === "cancelled"
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
              />
              <TouchableOpacity
                className="bg-gold-dark py-1 px-3 rounded-full"
                onPress={() =>
                  generateAndDownloadPdf(
                    latestRent.renter,
                    latestRent.amount,
                    latestRent.paid,
                    latestRent.date,
                    latestRent.date_end,
                    `Rental_Contract_${latestRent.renter}_${endDate.toLocaleDateString()}`
                  )
                }
              >
                <Text className="text-white text-center text-sm">
                  <Ionicons name="document-text" size={16} color="white" />
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="flex flex-col items-center justify-center">
            <Image
              source={images.noResult}
              className="w-40 h-40"
              alt="No recent rides found"
              resizeMode="contain"
            />
            <Text className="text-sm">No recent rides found</Text>
          </View>
        )}

        <View className="mb-4">
          <Text className="text-lg font-bold mb-2">Rentabilité</Text>
          <View className="h-4 w-full bg-gray-300 rounded-full">
            <View
              className={`h-4 rounded-full ${actualEarnings > total ? 'bg-blue-500' : 'bg-green-500'}`}
              style={{
                width: `${Math.min((actualEarnings / total) * 100, 100)}%`,
              }}
            />
          </View>
          <Text className="text-sm text-gray-600 mt-2">
            {actualEarnings} / {total.toFixed(2)} € cette semaine
            {actualEarnings > total && " (Objectif dépassé!)"}
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-lg font-bold mb-2">Récentes Locations</Text>
          {recentRentals && recentRentals.length > 0 ? (
            recentRentals.map((rent, index) => {
              const { renter, amount, paid, date, date_end } = rent;
              const startDate = new Date(date);
              const endDate = new Date(date_end);
              const Difference = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
              const daysDifference = Difference === 0 ? 1 : Difference;

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
                      Earnings: {paid ? amount : "Not paid"} €
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="bg-gold-dark py-1 px-3 rounded-full"
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
            <Text className="text-sm text-gray-600">Aucune location récente trouvée.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ModifyCar;
