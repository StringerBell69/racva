import { View, Image } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { useState, useEffect } from "react";
import { icons } from "@/constants";
import { GoogleInputProps } from "@/types/type";
import React from "react";

const googlePlacesApiKey = process.env.EXPO_PUBLIC_PLACES_API_KEY;

const GoogleTextInput: React.FC<GoogleInputProps> = ({
  icon,
  initialLocation = "",
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}) => {
  const [inputValue, setInputValue] = useState("");

  // Effect to update the input value if the initial location changes
  useEffect(() => {
    if (initialLocation) {
      setInputValue(initialLocation);
    }
  }, [initialLocation]);

  return (
    <View
      className={`flex flex-row items-center justify-center relative z-50 rounded-xl ${containerStyle}`}
    >
      <GooglePlacesAutocomplete
        fetchDetails={true}
        placeholder="Search"
        debounce={200}
        styles={{
          textInputContainer: {
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            marginHorizontal: 20,
            position: "relative",
            shadowColor: "#d4d4d4",
          },
          textInput: {
            backgroundColor: "white",
            fontSize: 16,
            fontWeight: "600",
            marginTop: 5,
            width: "100%",
            borderRadius: 200,
          },
          listView: {
            backgroundColor: "white",
            position: "relative",
            top: 0,
            width: "100%",
            borderRadius: 10,
            shadowColor: "#d4d4d4",
            zIndex: 99,
          },
        }}
        onPress={(data, details = null) => {
          if (handlePress) {
            handlePress({
              latitude: details?.geometry.location.lat!,
              longitude: details?.geometry.location.lng!,
              address: data.description,
            });
          }
        }}
        query={{
          key: "h",
          language: "en",
        }}
        renderLeftButton={() => (
          <View className="justify-center items-center w-6 h-6">
            <Image
              source={icon || icons.search}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </View>
        )}
        textInputProps={{
          placeholderTextColor: "gray",
          placeholder: inputValue || "Where do you want to go?",
          onChangeText: (text) => setInputValue(text),
          value: inputValue,
        }}
      />
    </View>
  );
};

export default GoogleTextInput;
