import { useState } from "react";
import { Image, Text, View, TouchableOpacity } from "react-native";
import { icons } from "@/constants"; // Assuming you have some icon paths here
import { Car } from "@/types/type"; // Importing the Car interface


const CarsCard = ({
  voiture,
  onPress,
}: {
  voiture: Car;
  onPress: (voiture: Car) => void; // Change the onPress type to accept a car parameter
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => onPress(voiture)}
      onPressIn={() => setIsPressed(true)} // Set state when pressed
      onPressOut={() => setIsPressed(false)} // Reset state when released
      activeOpacity={1} // Disable default opacity change
    >
      <View
        className={`flex flex-row items-start justify-between rounded-lg shadow-sm shadow-neutral-300 mb-3 p-3 ${
          isPressed ? "bg-gray-200" : "bg-white"
        }`} // Change background color based on pressed state
      >
        {/* Display the car photo or a placeholder */}
        {voiture.photo1 ? (
          <Image
            source={{ uri: voiture.photo_url }}
            className="w-[60px] h-[70px] rounded-lg"
          />
        ) : (
          <View className="w-[60px] h-[70px] rounded-lg bg-gray-200 justify-center items-center">
            <Text className="text-center text-black">No Image</Text>
          </View>
        )}

        {/* Column for car details (Left Side) */}
        <View className="flex-1 mx-2">
          {/* Car brand and model */}
          <Text className="text-md font-JakartaMedium" numberOfLines={1}>
            {`${voiture.marque} ${voiture.modele}`}
          </Text>

          {/* Car year */}
          <Text className="text-md font-JakartaMedium mt-1">
            {`Year: ${voiture.annee}`}
          </Text>

          {/* Availability status */}
          <View className="flex flex-row items-center mt-1">
            <Image source={icons.profile} className="w-5 h-5 mr-1" />
            <Text
              className={`text-md font-JakartaMedium ${
                voiture.disponible ? "text-green-500" : "text-red-500"
              }`}
            >
              {voiture.disponible ? "Available" : "Not Available"}
            </Text>
          </View>
        </View>

        {/* Column for pricing and rating (Right Side) */}
        <View className="flex flex-col items-end items-start justify-start">
          {/* Pricing */}
          <Text className="text-md font-JakartaMedium text-dark">
            {`Day: ${voiture.price_per_day} €`}
          </Text>
          <Text className="text-md font-JakartaMedium text-dark">
            {`Weekend / D: ${voiture.price_per_week} €`}
          </Text>
         
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CarsCard;
