import React, { useState } from "react";
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
import { useFetch } from "@/lib/fetch";
import { useRoute } from "@react-navigation/native";
import { Car } from "@/types/type";
import { useLocationStore } from "@/store";


interface CardProps {
  name: string;
  address: string;
  rating: string;
  reviews: string;
  images: string[];
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
  rating,
  reviews,
  images,
}) => {
  const { width } = Dimensions.get("window");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  // Generate the next 7 days dynamically with prices
  const generateNext7Days = (): Day[] => {
    const dates: Day[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Check if the day is a weekend (Saturday or Sunday)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const price = isWeekend ? "€20" : "€15"; // Different prices for weekends

      dates.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.getDate(),
        isWeekend,
        price,
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
        snapToInterval={width} // Ensures only one image shows fully at a time
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

      {/* Business Info */}
      <Text className="text-xl font-bold mt-4">{name}</Text>
      <Text className="text-gray-600">
        {address} 
      </Text>
      <Text className="text-gray-600">
        ⭐ {rating} ({reviews} avis) • €
      </Text>

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
              // Add any additional logic you want to run on date click here
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

const App: React.FC = () => {
  const { width, height } = Dimensions.get("window");
 const fetchCars = async () => {
   try {
     const response = await fetch(
       `/api/cars/search?searchText=${encodeURIComponent(searchText)}&latitude=${userLatitude}&longitude=${userLongitude}`
     );

     const data = await response.json();
     console.log(data);
   } catch (error) {
     console.error("Error fetching cars:", error);
   }
 };
  

  return (
    <View style={{ flex: 1 }}>
      <MapAgence />

      <View
        style={{
          position: "absolute",
          top: 40, // Adjust the vertical positioning as needed
          left: 20,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent background for better visibility
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
        {/* Card content goes here */}
        <FlatList
          horizontal
          data={Cars} // The fetched data from the API
          keyExtractor={(item) => item.id_voiture.toString()} // Assuming `id_voiture` is the unique identifier
          renderItem={({ item }) => (
            <View style={{ width }}>
              <Card
                name={item.marque} // Using marque as the name of the car
                address={`${item.latitude}, ${item.longitude}`} // Address using latitude and longitude (you can format this better)
                rating={item.rating} // Assuming there's a rating in the car data
                reviews={item.reviews} // Assuming there are reviews in the car data
                images={[item.photo_url, item.photo1, item.photo2, item.photo3]} // Car images array
              />
            </View>
          )}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

export default App;
