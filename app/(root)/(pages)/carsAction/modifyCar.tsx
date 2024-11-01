import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  Switch,
} from "react-native";
import { useState } from "react";
import { fetchAPI } from "@/lib/fetch";
import { useCarStore } from "@/store";
import { router } from "expo-router";
import { icons } from "@/constants";
import CarsLayout from "@/components/CarsLayout";
import CustomButton from "@/components/CustomButton";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "@clerk/clerk-expo";

const ModifyCar = ({ title = "Add Car", snapPoints = ["100%"] }) => {
  const { clearCar, updateCar } = useCarStore();

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [available, setAvailable] = useState(true);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photo1, setPhoto1] = useState("");
  const [photo2, setPhoto2] = useState("");
  const [photo3, setPhoto3] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useAuth(); 

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1985 + 1 },
    (_, i) => currentYear - i
  );

  const pickImage = async (
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) setter(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!make || !model || !year) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    console.log("Making API call with data:", userId);

    try {
      const { response } = await fetchAPI("/(api)/cars/create", {
        method: "POST",
        body: JSON.stringify({
          marque: make,
          modele: model,
          annee: year,
          disponible: available,
          photo_url: photoUrl,
          photo1: photo1,
          photo2: photo2,
          photo3: photo3,
          userId: userId,
        }),
      });

  Alert.alert("Success", "Car details saved successfully.");
  // router.back();
  
    } catch (error) {
      console.error("Error saving car details:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to save car details. Please try again."
      );
    } 
  };

  return (
    <CarsLayout title={title} snapPoints={snapPoints}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View className="flex-row items-center p-4 bg-white">
        <TouchableOpacity onPress={() => router.back()}>
          <View className="p-2 rounded-full bg-gray-200">
            <Image source={icons.backArrow} className="w-6 h-6" />
          </View>
        </TouchableOpacity>
        <Text className="ml-4 text-xl font-bold text-gray-800">
          {title || "Go Back"}
        </Text>
      </View>

      <View className="p-4">
        <Text className="text-lg text-gray-700 mb-2">Make</Text>
        <TextInput
          placeholder="Make"
          value={make}
          onChangeText={setMake}
          className="border-b border-gray-300 p-2 mb-4"
        />

        <Text className="text-lg text-gray-700 mb-2">Model</Text>
        <TextInput
          placeholder="Model"
          value={model}
          onChangeText={setModel}
          className="border-b border-gray-300 p-2 mb-4"
        />

        <Text className="text-lg text-gray-700 mb-2">Year</Text>
        <Picker
          selectedValue={year}
          onValueChange={(itemValue) => setYear(itemValue)}
          className="h-12 w-1/2 mb-4"
        >
          <Picker.Item label="Select Year" value="" />
          {years.map((year) => (
            <Picker.Item key={year} label={String(year)} value={year} />
          ))}
        </Picker>

        <Text className="text-lg text-gray-700 mb-2">Available</Text>
        <Switch
          value={available}
          onValueChange={setAvailable}
          className="mb-4"
        />

        <Text className="text-lg text-gray-700 mb-2">Main Photo</Text>
        <View className="items-center p-4 bg-gray-100 rounded-lg shadow-lg mb-4 space-y-4">
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              className="w-40 h-40 rounded-lg mb-4"
            />
          ) : (
            <Text className="text-gray-500">No image selected</Text>
          )}
          <CustomButton
            title="Pick Main Image"
            onPress={() => pickImage(setPhotoUrl)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg my-4"
          />

          {photoUrl && (
            <View className="space-y-2">
              <CustomButton
                title="Pick Image 1"
                onPress={() => pickImage(setPhoto1)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg my-4"
              />
              {photo1 && (
                <CustomButton
                  title="Pick Image 2"
                  onPress={() => pickImage(setPhoto2)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg my-4"
                />
              )}
              {photo1 && photo2 && (
                <CustomButton
                  title="Pick Image 3"
                  onPress={() => pickImage(setPhoto3)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg my-4"
                />
              )}
            </View>
          )}
          <View className="flex-row space-x-4 mt-4">
            {photo1 && (
              <Image
                source={{ uri: photo1 }}
                className="w-20 h-20 rounded-lg"
              />
            )}
            {photo2 && (
              <Image
                source={{ uri: photo2 }}
                className="w-20 h-20 rounded-lg"
              />
            )}
            {photo3 && (
              <Image
                source={{ uri: photo3 }}
                className="w-20 h-20 rounded-lg"
              />
            )}
          </View>
        </View>

        <TouchableOpacity
          className={`${isLoading ? "bg-gray-400" : "bg-green-500"} p-4 rounded-lg`}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text className="text-white text-center font-bold">
            {isLoading ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </CarsLayout>
  );
};

export default ModifyCar;
