import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import MapAgence from "@/components/MapsAgencesUser";
import { icons } from "@/constants";
import { router } from "expo-router";
import { useLocationStore } from "@/store";
import { useLocalSearchParams } from "expo-router";
import Geocoder from "react-native-geocoding";

interface CardProps {
  name: string;
  address: string;
  images: string[];
  pricePerDay: string;
  pricePerWeekend: string;
}

interface Day {
  day: string;
  date: number;
  isWeekend: boolean;
  price: string;
}

const Card: React.FC<CardProps> = ({
  name,
  address,
  images,
  pricePerDay,
  pricePerWeekend,
}) => {
  const { width } = Dimensions.get("window");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const generateNext7Days = (): Day[] => {
    const dates: Day[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const price = isWeekend ? pricePerWeekend : pricePerDay;

      dates.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.getDate(),
        isWeekend,
        price: `€${price}`,
      });
    }
    return dates;
  };

  const next7Days = generateNext7Days();

  return (
    <View className="bg-white shadow-lg rounded-t-lg p-4 w-full h-full">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        decelerationRate="fast"
        snapToAlignment="center"
        onScroll={(event) => {
          const slide = Math.ceil(event.nativeEvent.contentOffset.x / width);
          if (slide !== selectedImageIndex) setSelectedImageIndex(slide);
        }}
        contentContainerStyle={{ paddingHorizontal: 0 }}
      >
        {images.map((image, index) => (
          <View
            key={index}
            style={{
              width,
            }}
          >
            <Image
              source={{ uri: image }}
              className="w-full h-48 rounded-md"
              style={{ width: "100%", height: 200 }}
            />
          </View>
        ))}
      </ScrollView>

      {/* Vehicle Info */}
      <Text className="text-xl font-bold mt-4">{name}</Text>
      <Text className="text-gray-600">Location: {address}</Text>

      {/* Swipable Dates with Prices */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
        className="flex flex-row mt-4"
      >
        {next7Days.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setSelectedDate(index);
              console.log(
                `Selected date: ${item.day}.${item.date} with price ${item.price}`
              );
            }}
            style={{
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 8,
              marginRight: 8,
              borderWidth: 1,
              borderColor: selectedDate === index ? "#1E90FF" : "#ccc",
              backgroundColor: selectedDate === index ? "#1E90FF" : "#f0f0f0",
              height: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: selectedDate === index ? "#fff" : "#333",
                fontWeight: "500",
                textAlign: "center",
              }}
            >
              {item.day}.{item.date}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: selectedDate === index ? "#fff" : "#333",
              }}
            >
              {item.price}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const CarItem: React.FC<{ item: any }> = ({ item }) => {
  const [address, setAddress] = useState<string>("Loading...");

  useEffect(() => {
    Geocoder.init(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY as string);

    const getAddress = async () => {
      try {
        const result = await Geocoder.from(
          parseFloat(item.latitude),
          parseFloat(item.longitude)
        );
        const formattedAddress =
          result.results[0]?.formatted_address || "Address not found";
        setAddress(formattedAddress);
      } catch (error) {
        console.error("Error fetching address:", error);
        setAddress("Error fetching address");
      }
    };

    getAddress();
  }, [item.latitude, item.longitude]);

  const images = [item.photo_url, item.photo1, item.photo2, item.photo3].filter(
    (image): image is string => image !== undefined && image !== null
  );

  const { width } = Dimensions.get("window");

  return (
    <View style={{ width }}>
      <Card
        name={`${item.marque} ${item.modele}`}
        address={address}
        images={images}
        pricePerDay={item.price_per_day}
        pricePerWeekend={item.price_per_day_on_weekend}
      />
    </View>
  );
};

const App: React.FC = () => {
  const { width, height } = Dimensions.get("window");
  const { userLongitude, userLatitude } = useLocationStore();
  const { searchText } = useLocalSearchParams();
  const [carData, setCarData] = useState<any[]>([]);

  const fetchCars = async () => {
    try {
      const response = await fetch(
        `/(api)/cars/search/${encodeURIComponent(String(searchText))}?latitude=${userLatitude}&longitude=${userLongitude}`
      );
      const result = await response.json();

      setCarData(result.data || []);
    } catch (error) {
      console.error("Error fetching cars:", error);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [searchText]);

  return (
    <View style={{ flex: 1 }}>
      <MapAgence />

      <View
        style={{
          position: "absolute",
          top: 40,
          left: 20,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: 30,
          padding: 10,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <View className="p-2 rounded-full bg-gray-200">
            <Image source={icons.backArrow} className="w-6 h-6" />
          </View>
        </TouchableOpacity>
        <Text className="ml-4 text-xl font-bold text-gray-800">Go Back</Text>
      </View>

      {/* Bottom Card Overlay */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          height: height * 0.5,
          width: "100%",
          backgroundColor: "white",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: "hidden",
        }}
      >
        <FlatList
          horizontal
          data={carData}
          keyExtractor={(item) => item.id_voiture.toString()}
          renderItem={({ item }) => <CarItem item={item} />}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

export default App;
