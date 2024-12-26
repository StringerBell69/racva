import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import Swiper from "react-native-swiper";
import { router } from "expo-router";
import { useCarStore } from "@/store";
import { icons, images } from "@/constants";
import { fetchAPI, useFetch } from "@/lib/fetch";
import { Rent, Earnings } from "@/types/type";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { generateAndDownloadPdf } from "@/components/GeneratePDF";
import { Calendar } from "react-native-calendars";
import LocaleConfig from "@/constants/CalendarLocales";
import { useAuth } from "@clerk/clerk-expo";

const ModifyCar: React.FC = () => {
  const { car } = useCarStore();
  const { userId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState<{
    start?: string;
    end?: string;
  }>({});
  const [markedDates, setMarkedDates] = useState<any>({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [expandedRentId, setExpandedRentId] = useState<string | null>(null);

  // Fetch hooks
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

  // Localization config
  LocaleConfig.defaultLocale = "fr";

  // Ensure car exists before processing
  useEffect(() => {
    if (!car) {
      setLoading(false);
      return;
    }
  }, [car]);

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
      weekdays * Number(car?.price_per_day) +
      weekends * Number(car?.price_per_day_on_weekend);
    setTotalPrice(total);
  };

  // Fetch booked days
  const fetchBookedDays = React.useCallback(async () => {
    if (!car?.id_voiture || !car?.id_agence) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/(api)/cars/check-in/availabily/${car.id_voiture}?id_agence=${car.id_agence}`
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
            color: "#E0E0E0",
            textColor: "black",
          };
        }

        // Mark booked days
        if (bookedDays.includes(dateString)) {
          markedDatesResult[dateString] = {
            disabled: true,
            disableTouchEvent: true,
            color: "gray",
            textColor: "white",
          };
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      setMarkedDates(markedDatesResult);
    } catch (error) {
      console.error("Error fetching booked days:", error);
      Alert.alert("Erreur", "Échec de la récupération des données du calendrier.");
    } finally {
      setLoading(false);
    }
  }, [car?.id_voiture, car?.id_agence]);

  useEffect(() => {
    fetchBookedDays();
  }, [fetchBookedDays]);

  useEffect(() => {
    calculateTotalPrice();
  }, [selectedDateRange]);

  const actualEarnings = actualEarningsData?.[0]?.paid_count
    ? parseFloat(actualEarningsData[0].paid_count)
    : 0;

  const total =
    (car?.price_per_day || 0) * 5 + (car?.price_full_weekend || 0) * 2;

  const isLoading = loadingLastRent || loadingEarnings || loadingRents;
  const errorMessage = errorLastRent || errorEarnings || errorRents;

  const handleCreate = () => {
    router.push("/(pages)/carsAction/edit");
  };

  const handleDayPress = (day: { dateString: string }) => {
    const { dateString } = day;

    if (markedDates[dateString]?.disabled) {
      return;
    }

    const updatedMarkedDates = { ...markedDates };

    if (!selectedDateRange.start) {
      setSelectedDateRange({ start: dateString });
      updatedMarkedDates[dateString] = {
        startingDay: true,
        color: "#D4AF37",
        textColor: "black",
      };
    } else if (!selectedDateRange.end) {
      let start = new Date(selectedDateRange.start);
      let end = new Date(dateString);

      if (end < start) {
        [start, end] = [end, start];
      }

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
          "Sélection invalide",
          "Certains jours de votre plage sélectionnée sont déjà réservés."
        );
        return;
      }

      currentDate.setDate(start.getDate());
      while (currentDate <= end) {
        const checkDate = currentDate.toISOString().split("T")[0];
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
      const resetMarkedDates = { ...markedDates };
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

  const handleIndisponible = () => {
    Alert.alert(
      `Rendre ${car?.marque} ${car?.modele} indisponible ?`,
      "Êtes-vous sûr de vouloir rendre indisponible ?",
      [
        {
          text: "Non",
          style: "cancel",
        },
        {
          text: "Oui",
          onPress: async () => {
            try {
              await fetchAPI("/(api)/ride/create", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  id_agence: car?.id_agence,
                  id_voiture: car?.id_voiture,
                  start: selectedDateRange.start,
                  end: selectedDateRange.end,
                  payment_status: "upcoming",
                  amount: 0,
                  user_id: userId,
                }),
              });

              Alert.alert("Succès", "Voiture marquée comme indisponible.");
            } catch (error) {
              console.error("Erreur lors du marquage de la voiture comme indisponible:", error);
              Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };
  const handleMessageClient = (id: string) => {
    router.push(`/(tabsAgence)/chat?clientId=${id}`);
  };
const apiKey = process.env.SENDINBLUE_API_KEY;

  const handleCancelRental = async (rent: Rent) => {
    console.log(rent);
    Alert.alert(
      "Annuler la location",
      "Êtes-vous sûr de vouloir annuler cette location ?",
      [
        {
          text: "Non",
          style: "cancel",
        },
        {
          text: "Oui",
          onPress: async () => {
            const emailData = {
              to: "dspro699@gmail.com",
              subject: "Notification d'annulation de location",
              body: `Une location a été annulée. Détails: 
Voiture ID: ${car?.id_voiture}
Date de début de location: ${rent.date || rent.rental_start_date}
Date de fin de location: ${rent.date_end || rent.rental_end_date}
User ID: ${userId}

DELETE FROM rentals
WHERE id_voiture = ${car?.id_voiture}
  AND rental_start = '${rent.date || rent.rental_start_date}'
  AND rental_end = '${rent.date_end || rent.rental_end_date}'
  AND user_id = ${userId};`,
            };

            try {
              const response = await fetch(
                "https://api.brevo.com/v3/smtp/email",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "api-key": apiKey!,
                  },
                  body: JSON.stringify({
                    sender: { email: "annulation@racva.com" },
                    to: [{ email: emailData.to }],
                    subject: emailData.subject,
                    htmlContent: `<p>${emailData.body}</p>`,
                  }),
                }
              );

              if (response.ok) {
                Alert.alert(
                  "Annulation",
                  "L'équipe Racva va bientôt annuler votre location. (Des frais d'annulation peuvent s'ajouter si elle est faite à moins de 48H du début de la location.)"
                );
              } else {
                Alert.alert("Erreur", "Échec de l'annulation de la location.");
              }
            } catch (error) {
              console.error("Erreur lors de l'annulation:", error);
              Alert.alert(
                "Erreur",
                "Une erreur est survenue. Veuillez réessayer."
              );
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderRecentRentals = () => {
    if (!recentRentals || recentRentals.length === 0) {
      return (
        <Text className="text-sm text-gray-600">
          Aucune location récente trouvée.
        </Text>
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
                Earnings: {paid ? amount : "Not paid"} €
              </Text>
            </View>
            <TouchableOpacity
              className="bg-gold-dark py-1 px-3 rounded-full"
              onPress={() =>
                generateAndDownloadPdf({
                  // Company details
                  companyName: agency_name ?? "Racva",
                  companyAddress: agency_address ?? "",
                  companyPhone: agency_phone ?? "",
                  companySiret: "", // Assuming no SIRET is available in the response
                  companyEmail: agency_email ?? "",

                  // Renter details
                  renterFirstName: renter.split(" ")[0] ?? "Unknown", // First name
                  renterLastName: renter.split(" ")[1] ?? "", // Last name
                  renterAddress: "", // Address (not available in the current data)
                  renterPhone: renter_phone ?? "", // Phone number
                  renterEmail: renter_email ?? "", // Email address
                  driverLicense: "", // Assuming driver license is not available

                  // Vehicle details
                  vehicleBrand: vehicle_brand ?? "", // Vehicle brand
                  vehicleModel: vehicle_model ?? "", // Vehicle model
                  vehiclePlate: vehicle_plate ?? "", // Vehicle plate
                  initialMileage: 0, // Assuming mileage is not available
                  vehicleCondition: vehicle_condition ?? "", // Vehicle condition

                  // Rental details
                  startDate: date ?? "", // Rental start date
                  endDate: date_end ?? "", // Rental end date
                  pickupLocation: "", // Pickup location (not available)
                  returnLocation: "", // Return location (not available)
                  rentalPrice: amount ?? 0, // Total rental amount
                  deposit: 0, // Assuming deposit is not available
                  mileageLimit: "", // Mileage limit (not available)
                  extraKmPrice: 0, // Extra price per kilometer (not available)
                  isPaid: paid ?? false, // Payment status
                  paymentMethod: "", // Payment method (not available)
                })
              }
            >
              <Text className="text-white text-center text-sm">
                <Ionicons name="document-text" size={16} color="white" />
              </Text>
            </TouchableOpacity>
          </View>

          {isExpanded && (
            <View className="mt-4 pt-4 border-t border-gray-200">
              <View className="flex-row justify-between space-x-2">
                <TouchableOpacity
                  onPress={() => handleMessageClient(id?.toString() || "")}
                  className="flex-1 flex-row items-center bg-green-500 p-2 rounded-lg justify-center"
                >
                  <Ionicons name="chatbubble" size={20} color="white" />
                  <Text className="ml-2 text-white">Messagerie</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleCancelRental(rent)}
                  className="flex-1 flex-row items-center bg-red-500 p-2 rounded-lg justify-center"
                >
                  <MaterialIcons name="cancel" size={20} color="white" />
                  <Text className="ml-2 text-white">Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>
      );
    });
  };


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

  if (isLoading || loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View className="flex flex-col items-center justify-center">
        <Text className="text-sm">Error loading data: {errorMessage}</Text>
      </View>
    );
  }

  const carPhotos = [car.photo_url, car.photo1, car.photo2, car.photo3].filter(
    (url) => url
  );
  const agenceTrue = 1;
  const latestRent =
    Array.isArray(lastRent) && lastRent.length > 0 ? lastRent[0] : null;

  const startDate = new Date(latestRent?.date || Date.now());
  const endDate = new Date(latestRent?.date_end || Date.now());
  const Difference = latestRent
    ? (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
    : 0;
  const daysDifference = Difference === 0 ? 1 : Difference;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="bg-white p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 bg-white">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center"
          >
            <View className="p-2 rounded-full bg-gold">
              <Image source={icons.backArrow} className="w-6 h-6" />
            </View>
            <Text className="ml-4 text-xl font-bold text-gray-800">
              Go Back
            </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity onPress={handleCreate}>
            <View className="flex-row items-center justify-center bg-gold rounded-lg p-2">
              <Feather name="edit" size={24} color="black" />
            </View>
          </TouchableOpacity> */}
        </View>

        {/* Photo Gallery */}
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

        {/* Latest Rent */}
        {latestRent && (
          <TouchableOpacity
            key={latestRent.id}
            onPress={() => {
              setExpandedRentId((prevId) =>
                prevId === latestRent.id?.toString()
                  ? null
                  : latestRent.id?.toString() || null
              );
            }}
            className={`${
              expandedRentId === latestRent.id?.toString()
                ? "bg-gray-50"
                : "bg-white"
            }`}
          >
            <View className="mb-4 p-4 border border-gray-300 rounded-lg">
              <View className="flex-row justify-between items-center">
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
                <View
                  className={`h-3 w-3 rounded-full ${
                    {
                      ongoing: "bg-green-500",
                      ended: "bg-gray-500",
                      cancelled: "bg-red-500",
                    }[latestRent.status] || "bg-blue-500"
                  }`}
                />
                <TouchableOpacity
                  className="bg-gold-dark py-1 px-3 rounded-full"
                  onPress={() =>
                    generateAndDownloadPdf({
                      companyName: latestRent.agency_name ?? "Racva",
                      companyAddress: latestRent.agency_address ?? "",
                      companyPhone: latestRent.agency_phone ?? "",
                      companySiret: "", // Assuming no SIRET is available in the response
                      companyEmail: latestRent.agency_email ?? "",

                      // Renter details
                      renterFirstName:
                        latestRent?.renter.split(" ")[0] ?? "Unknown", // Use 'renter' instead of 'renter_name'
                      renterLastName: latestRent?.renter.split(" ")[1] ?? "", // Use 'renter' instead of 'renter_name'
                      renterAddress: "", // Add the renter's address if available
                      renterPhone: latestRent?.renter_phone ?? "", // Add the renter's phone number if available
                      renterEmail: latestRent?.renter_email ?? "", // Add the renter's email if available
                      driverLicense: "", // Add the renter's driver license number if available

                      // Vehicle details
                      vehicleBrand: latestRent?.vehicle_brand ?? "", // Add the vehicle brand if available
                      vehicleModel: latestRent?.vehicle_model ?? "", // Add the vehicle model if available
                      vehiclePlate: "", // Add the vehicle plate number if available
                      initialMileage: 0, // Add the initial mileage if available
                      vehicleCondition: "", // Add the vehicle condition if available

                      // Rental details
                      startDate: latestRent?.rental_start_date ?? "", // rentalDate
                      endDate: latestRent?.rental_end_date ?? "", // rentalEndDate
                      pickupLocation: "", // Add pickup location if available
                      returnLocation: "", // Add return location if available
                      rentalPrice: latestRent?.rental_price ?? 0, // rentalPrice should be passed from totalAmount
                      deposit: 0, // Add deposit if available
                      mileageLimit: "", // Add mileage limit if available
                      extraKmPrice: 0, // Add extra price per kilometer if available
                      isPaid: latestRent?.paid ?? false, // Payment status
                      paymentMethod: "", // Add payment method if available
                    })
                  }
                >
                  <Text className="text-white text-center text-sm">
                    <Ionicons name="document-text" size={16} color="white" />
                  </Text>
                </TouchableOpacity>
              </View>

              {expandedRentId === latestRent.id?.toString() && (
                <View className="mt-4 pt-4 border-t border-gray-200">
                  <View className="flex-row justify-between space-x-2">
                    <TouchableOpacity
                      onPress={() =>
                        handleMessageClient(latestRent.id?.toString() || "")
                      }
                      className="flex-1 flex-row items-center bg-green-500 p-2 rounded-lg justify-center"
                    >
                      <Ionicons name="chatbubble" size={20} color="white" />
                      <Text className="ml-2 text-white">Messagerie</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleCancelRental(latestRent)}
                      className="flex-1 flex-row items-center bg-red-500 p-2 rounded-lg justify-center"
                    >
                      <MaterialIcons name="cancel" size={20} color="white" />
                      <Text className="ml-2 text-white">Annuler</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* Calendar */}
        <View>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType="period"
            firstDay={1}
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
        </View>

        {/* Price Section */}
        {selectedDateRange.start && selectedDateRange.end && (
          <View className="p-4 bg-gray-100 rounded-lg shadow-lg">
            <Text className="text-lg font-bold text-black">Prix Total</Text>
            <View className="flex-row justify-between mt-2">
              <Text className="text-sm text-gray-700">Jours de semaine:</Text>
              <Text className="text-sm font-semibold">
                {car.price_per_day} € par jour
              </Text>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-sm text-gray-700">Jours de week-end:</Text>
              <Text className="text-sm font-semibold">
                {car.price_per_day_on_weekend} € par jour
              </Text>
            </View>
            <View className="mt-4 pt-2 border-t border-gray-300">
              <Text className="text-xl font-bold text-black text-right">
                Total: {totalPrice} €
              </Text>
            </View>

            <View className="h-6" />

            <TouchableOpacity
              onPress={handleIndisponible}
              className="mt-4 p-3 rounded-lg border-2 border-gold-dark bg-transparent"
            >
              <Text className="text-gray-900 text-center font-semibold">
                Rendre indisponible
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/book-ride?id_agence=${car.id_agence}&id_voiture=${car.id_voiture}&start=${selectedDateRange.start}&end=${selectedDateRange.end}&amount=${totalPrice}&agenceTrue=${agenceTrue}`
                )
              }
              className="bg-gray-900 rounded-lg p-4 items-center mt-5"
            >
              <Text className="text-gold font-bold text-base">Réserver</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-6" />

        {/* Rentability Section */}
        <View className="mb-4">
          <Text className="text-lg font-bold mb-2">Rentabilité</Text>
          <View className="h-4 w-full bg-gray-300 rounded-full">
            <View
              className={`h-4 rounded-full ${
                actualEarnings > total ? "bg-blue-500" : "bg-green-500"
              }`}
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

        {/* Recent Rentals */}
        <View className="mb-4">
          <Text className="text-lg font-bold mb-2">Récentes Locations</Text>
          {renderRecentRentals()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ModifyCar;
