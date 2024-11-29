import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from "react-native";
import MapAgence from "@/components/MapsAgencesUser";
import { icons } from "@/constants";
import { router } from "expo-router";
import {  useLocationStore } from "@/store";
import { useLocalSearchParams } from "expo-router";
import Geocoder from "react-native-geocoding";
import Swiper from "react-native-swiper";
import { Car } from "@/types/type";

interface CardProps {
  id_voiture: number;
  id_agence: number;
  name: string;
  address: string;
  annee: number;
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
  id_voiture,
  id_agence,
  name,
  annee,
  address,
  images,
  pricePerDay,
  pricePerWeekend,
}) => {

  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { width } = Dimensions.get("window");

  return (
    <View className="bg-white rounded-lg overflow-hidden w-full">
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

      <View className="p-4">
        <Text className="text-lg font-bold">{name}</Text>
        <Text className="text-gray-500 mt-1">{address}</Text>

        <View className="flex-row justify-between mt-4">
          <View className="flex-1 bg-gray-200 p-3 rounded-lg">
            <Text className="text-base font-medium">Price per Day</Text>
            <Text className="text-lg font-bold text-gold-dark">
              ${pricePerDay}
            </Text>
          </View>

          <View className="flex-1 bg-gray-200 p-3 rounded-lg ml-3">
            <Text className="text-base font-medium">Price per Weekend</Text>
            <Text className="text-lg font-bold text-gold-dark">
              ${pricePerWeekend}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() =>
            router.push(
              `/check-in?id_agence=${id_agence}&&id_voiture=${id_voiture}&&name=${name}&&annee=${annee}&&address=${address}&&images=${images}&&pricePerDay=${pricePerDay}&&pricePerWeekend=${pricePerWeekend}`
            )
          }
          className="bg-gray-900 p-4 rounded-lg mt-4"
        >
          <Text className="text-gold text-center text-base font-bold">
            Check Availability
          </Text>
        </Pressable>
      </View>
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
        id_voiture={item.id_voiture}
        annee={item.annee}
        id_agence={item.id_agence}
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
  const { searchText, id_agence } = useLocalSearchParams();
  const [carData, setCarData] = useState<any[]>([]);

  const fetchCars = async () => {
    try {
      if (id_agence) {
        const response = await fetch(
          `/(api)/cars/search/byAgence/${id_agence}`
        );
        const result = await response.json();
        setCarData(result.data || []);
      } else {
        const response = await fetch(
          `/(api)/cars/search/${encodeURIComponent(String(searchText))}?latitude=${userLatitude}&longitude=${userLongitude}`
        );
        const result = await response.json();
        setCarData(result.data || []);
      }
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

      <View className="absolute top-10 left-5 flex flex-row items-center bg-white/80 rounded-3xl p-2.5">
        <TouchableOpacity onPress={() => router.back()}>
          <View className="p-2 rounded-full bg-gold">
            <Image source={icons.backArrow} className="w-6 h-6" />
          </View>
        </TouchableOpacity>
        <Text className="ml-4 text-xl font-bold text-gray-800">Go Back</Text>
      </View>

      {/* Bottom Card Overlay */}
      <View className="absolute bottom-0 h-[50%] w-full bg-white rounded-tl-lg rounded-tr-lg overflow-hidden">
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
