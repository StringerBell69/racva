import React, { useState, useEffect } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  Pressable,
  Image,
  Text,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { router, useLocalSearchParams } from "expo-router";
import { icons } from "@/constants"; // Assuming you have icons defined in the constants file

const BookingCalendar = () => {
  // Set the locale configuration for French
  LocaleConfig.locales["fr"] = {
    monthNames: [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ],
    monthNamesShort: [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Jun",
      "Jul",
      "Aoû",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ],
    dayNames: [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ],
    dayNamesShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    today: "Aujourd'hui",
  };

  LocaleConfig.defaultLocale = "fr";
  const { id_agence, id_voiture, pricePerDay, price_per_day_on_weekend } =
    useLocalSearchParams();
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState<{
    start?: string;
    end?: string;
  }>({});
  const [totalPrice, setTotalPrice] = useState(0);

  const fetchBookedDays = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/(api)/cars/check-in/availabily/${id_voiture}?id_agence=${id_agence}`
      );
      const data = await response.json();


      const bookedDays = data.data.map(
        (item: { booked_day: string }) => item.booked_day.split("T")[0]
      );

      const markedDatesResult: { [key: string]: any } = {};

      // Calculate the range (past 6 months to future 6 months)
      const today = new Date();
      const futureDate = new Date();
      const pastDate = new Date();

      futureDate.setMonth(today.getMonth() + 6);
      pastDate.setMonth(today.getMonth() - 6);

      let currentDate = new Date(pastDate);
      while (currentDate <= futureDate) {
        const dateString = currentDate.toISOString().split("T")[0];

        // Mark past dates before today
        if (currentDate < today) {
          markedDatesResult[dateString] = {
            disabled: true,
            disableTouchEvent: true,
            color: "#E0E0E0", // Light gray for past dates
            textColor: "black",
          };
        }

        // Mark booked days
        if (bookedDays.includes(dateString)) {
          markedDatesResult[dateString] = {
            disabled: true,
            disableTouchEvent: true,
            color: "gray", // Dark gray for booked dates
            textColor: "white",
          };
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      setMarkedDates(markedDatesResult);
    } catch (error) {
      console.error("Error fetching booked days:", error);
      Alert.alert("Error", "Failed to fetch calendar data.");
    } finally {
      setLoading(false);
    }
  };


  const calculateTotalPrice = () => {
    if (!selectedDateRange.start || !selectedDateRange.end) return 0;

    let start = new Date(selectedDateRange.start);
    let end = new Date(selectedDateRange.end);

    if (end < start) {
      [start, end] = [end, start];
    }

    let weekdays = 0;
    let weekends = 0;
    let currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekends++;
      } else {
        weekdays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const total =
      weekdays * Number(pricePerDay) +
      weekends * Number(price_per_day_on_weekend);
    setTotalPrice(total);
  };

  const handleDayPress = (day: { dateString: string }) => {
    const { dateString } = day;

    // Check if the day is disabled (booked)
    if (markedDates[dateString]?.disabled) {
      return;
    }

    // Period selection logic
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
  useEffect(() => {
    calculateTotalPrice();
  }, [selectedDateRange]);

  useEffect(() => {
    fetchBookedDays();
  }, [id_voiture, id_agence]);

  return (
    <View className="flex-1 bg-white p-4 relative">
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

      {/* Calendar Section */}
      <View className="mt-20 ">
        {loading ? (
          <View className="justify-center items-center">
            <ActivityIndicator size="large" color="#FFD700" />
          </View>
        ) : (
          <Calendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType="period"
            firstDay={1} // Set the first day of the week to Monday
            theme={{
              calendarBackground: "white",
              textSectionTitleColor: "black",
              todayTextColor: "#D4AF37",
              dayTextColor: "black",
              arrowColor: "#D4AF37",
              monthTextColor: "black",
              selectedDayBackgroundColor: "#D4AF37",
              selectedDayTextColor: "black",
            }}
          />
        )}
      </View>

      {/* Spacer */}
      <View className="h-6"></View>

      {/* Price Calculation Card */}
      {selectedDateRange.start && selectedDateRange.end && (
        <View className="p-4 bg-gray-100 rounded-lg shadow-lg">
          <Text className="text-lg font-bold text-black">Prix Total</Text>
          <View className="flex-row justify-between mt-2">
            <Text className="text-sm text-gray-700">Jours de semaine:</Text>
            <Text className="text-sm font-semibold">
              {pricePerDay} € par jour
            </Text>
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-sm text-gray-700">Jours de week-end:</Text>
            <Text className="text-sm font-semibold">
              {price_per_day_on_weekend} € par jour
            </Text>
          </View>
          <View className="mt-4 pt-2 border-t border-gray-300">
            <Text className="text-xl font-bold text-black text-right">
              Total: {totalPrice} €
            </Text>
          </View>

          {/* Spacer */}
          <View className="h-6"></View>

          {/* Check Availability Button */}
          <Pressable
            onPress={() =>
              router.push(
                `/book-ride?id_agence=${id_agence}&id_voiture=${id_voiture}&start=${selectedDateRange.start}&end=${selectedDateRange.end}&amount=${totalPrice}`
              )
            }
            className="bg-gray-900 rounded-xl p-4 items-center"
          >
            <Text className="text-gold font-bold text-base">Réserver</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default BookingCalendar;
