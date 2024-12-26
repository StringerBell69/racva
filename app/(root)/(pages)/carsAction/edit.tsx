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
import { router } from "expo-router";
import { icons, images } from "@/constants";
import CarsLayout from "@/components/CarsLayout";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "@clerk/clerk-expo";
import { useCarStore } from "@/store";
import Cbutton from "@/components/Cbutton"; // Adjust the import path accordingly

const edit = ({ title = "Éditer une Voiture", snapPoints = ["100%"] }) => {

  



  const { car } = useCarStore();
  const [make, setMake] = useState(car?.marque || "");
  const [model, setModel] = useState(car?.modele || "");
  const [year, setYear] = useState(car?.annee?.toString() || "");
  const [available, setAvailable] = useState(car?.disponible || false);
  const [pricePerDay, setPricePerDay] = useState(
    car?.price_per_day?.toString() || ""
  );
  const [pricePerWeek, setPricePerWeek] = useState(
    car?.price_per_week?.toString() || ""
  );
  const [pricePerDayOnWeekend, setPricePerDayOnWeekend] = useState(
    car?.price_per_day_on_weekend?.toString() || ""
  );
  const [priceFullWeekend, setPriceFullWeekend] = useState(
    car?.price_full_weekend?.toString() || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useAuth();

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1985 + 1 },
    (_, i) => currentYear - i
  );
  const pickImage = async (
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;

      // Fetch the image data from the URI
      const response = await fetch(imageUri);
      const blob = await response.blob(); // Convert the response to a Blob

      // Create a File from the Blob
      const fileName = result.assets[0].fileName || "image.jpg"; // Use the original filename or fallback
      const mimeType = result.assets[0].type || "image/jpeg"; // Use the original mime type or fallback
      const file = new File([blob], fileName, { type: mimeType });

      // Update the state with the File
      setter(file); // Set the File in state
    } else {
      setter(null);
    }
  };

  const handleSave = async () => {
    if (!make || !model || !year) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs requis.");
      return;
    }

    setIsLoading(true); // Set loading state
    if (!car) {
      return (
        <View className="flex flex-col items-center justify-center">
          <Image
            source={images.noResult}
            className="w-40 h-40"
            alt="Aucun trajet récent trouvé"
            resizeMode="contain"
          />
          <Text className="text-sm">Aucun trajet récent trouvé</Text>
        </View>
      );
    }

    try {
      const response = await fetchAPI("/(api)/cars/edit", {
        method: "POST",
        body: JSON.stringify({
          id_voiture: car.id_voiture,
          id_agence: car.id_agence,
          marque: make,
          modele: model,
          annee: parseInt(year, 10),
          disponible: available,
          userId: userId,
          price_per_day: parseFloat(pricePerDay) || null,
          price_per_week: parseFloat(pricePerWeek) || null,
          price_per_day_on_weekend: parseFloat(pricePerDayOnWeekend) || null,
          price_full_weekend: parseFloat(priceFullWeekend) || null,
        }),
      });
      Alert.alert("Succès", "Détails de la voiture enregistrés avec succès.");
      router.back();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des détails de la voiture:", error);
      Alert.alert(
        "Erreur",
        error instanceof Error
          ? error.message
          : "Échec de l'enregistrement des détails de la voiture. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <CarsLayout title={title} snapPoints={snapPoints}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View className="flex-row items-center p-4 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center"
        >
          <View className="p-2 rounded-full bg-gold">
            <Image source={icons.backArrow} className="w-6 h-6" />
          </View>
          <Text className="ml-4 text-xl font-bold text-gray-800"></Text>
        </TouchableOpacity>
        <Text className="ml-4 text-xl font-bold text-gray-800">
          {title || "Retour"}
        </Text>
      </View>

      <View className="p-4">
        <Text className="text-lg text-gray-700 mb-2">Marque</Text>
        <TextInput
          placeholder="Marque"
          value={make}
          onChangeText={setMake}
          className="border-b border-gray-300 p-2 mb-4"
        />

        <Text className="text-lg text-gray-700 mb-2">Modèle</Text>
        <TextInput
          placeholder="Modèle"
          value={model}
          onChangeText={setModel}
          className="border-b border-gray-300 p-2 mb-4"
        />
        <Text className="text-lg text-gray-700 mb-2">Prix par Jour</Text>
        <TextInput
          placeholder="Prix par Jour"
          value={pricePerDay}
          onChangeText={setPricePerDay}
          keyboardType="decimal-pad"
          className="border-b border-gray-300 p-2 mb-4"
        />

        <Text className="text-lg text-gray-700 mb-2">Prix par Semaine</Text>
        <TextInput
          placeholder="Prix par Semaine"
          value={pricePerWeek}
          onChangeText={setPricePerWeek}
          keyboardType="decimal-pad"
          className="border-b border-gray-300 p-2 mb-4"
        />

        <Text className="text-lg text-gray-700 mb-2">
          Prix par Jour le Week-end
        </Text>
        <TextInput
          placeholder="Prix par Jour le Week-end"
          value={pricePerDayOnWeekend}
          onChangeText={setPricePerDayOnWeekend}
          keyboardType="decimal-pad"
          className="border-b border-gray-300 p-2 mb-4"
        />

        <Text className="text-lg text-gray-700 mb-2">Prix du Week-end Complet</Text>
        <TextInput
          placeholder="Prix du Week-end Complet"
          value={priceFullWeekend}
          onChangeText={setPriceFullWeekend}
          keyboardType="decimal-pad"
          className="border-b border-gray-300 p-2 mb-4"
        />

        <Text className="text-lg text-gray-700 mb-2">Année</Text>
        <Picker
          selectedValue={year}
          onValueChange={(itemValue) => setYear(itemValue)}
          className="h-12 w-1/2 mb-4"
        >
          <Picker.Item label="Sélectionner l'Année" value="" />
          {years.map((year) => (
            <Picker.Item key={year} label={String(year)} value={year} />
          ))}
        </Picker>

        <TouchableOpacity onPress={handleSave}>
          <View className="flex-row items-center justify-center bg-gray-900 rounded-lg p-2">
            <Text className="text-gold text-center text-sm">
              {isLoading ? "Enregistrement..." : "Enregistrer les Changements"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </CarsLayout>
  );
};

export default edit;
