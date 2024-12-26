import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Camera, Plus, X } from "lucide-react-native";
import { styled } from "nativewind";
import { uploadFile } from "@uploadcare/upload-client";
import { fetchAPI } from "@/lib/fetch";
import { router } from "expo-router";

// Styled components
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);
const StyledScrollView = styled(ScrollView);
const StyledImage = styled(Image);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);

const CreateCarScreen = () => {
  // Form State
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [description, setDescription] = useState("");

  // Price State
  const [pricePerDay, setPricePerDay] = useState("");
  const [pricePerDayOnWeekend, setPricePerDayOnWeekend] = useState("");

  // Image State
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photo1, setPhoto1] = useState<string | null>(null);
  const [photo2, setPhoto2] = useState<string | null>(null);
  const [photo3, setPhoto3] = useState<string | null>(null);
  const uploadcare = process.env.UPLOADCARE;

  if (!uploadcare) {
    throw new Error("Uploadcare public key is not defined");
  }

  // Other State
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper: Read and convert file to a format compatible with Uploadcare
  const readAsBlobOrFile = async (uri: string) => {
    const response = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const blob = new Blob([response], { type: "image/jpeg" }); // Adjust MIME type if needed
    return blob;
  };

  const uploadImage = async (uri: string) => {
    const file = await readAsBlobOrFile(uri);
    return uploadFile(file, {
      publicKey: uploadcare,
      store: "auto",
    });
  };

  const pickImage = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Désolé, nous avons besoin de l'autorisation de la galerie pour que cela fonctionne!");
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;

      if (!photoUrl) {
        setPhotoUrl(selectedImage);
      } else if (!photo1) {
        setPhoto1(selectedImage);
      } else if (!photo2) {
        setPhoto2(selectedImage);
      } else if (!photo3) {
        setPhoto3(selectedImage);
      }
    }
  };

  const removeImage = (index: number) => {
    switch (index) {
      case 0:
        setPhotoUrl(null);
        break;
      case 1:
        setPhoto1(null);
        break;
      case 2:
        setPhoto2(null);
        break;
      case 3:
        setPhoto3(null);
        break;
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!make || !model || !year) {
      alert("Veuillez remplir tous les champs requis");
      return;
    }

    setIsLoading(true);

    let uploadedUrls = [];

    try {
      // Upload files to Uploadcare
      uploadedUrls = await Promise.all([
        photoUrl ? uploadImage(photoUrl) : Promise.resolve(null),
        photo1 ? uploadImage(photo1) : Promise.resolve(null),
        photo2 ? uploadImage(photo2) : Promise.resolve(null),
        photo3 ? uploadImage(photo3) : Promise.resolve(null),
      ]);

      // Extract CDN URLs
      const photoUrls = uploadedUrls.map((upload) =>
        upload ? upload.cdnUrl : null
      );

      // Submit car details to API
      const response = await fetchAPI("/(api)/cars/create", {
        method: "POST",
        body: JSON.stringify({
          marque: make,
          modele: model,
          annee: year,
          photo_url: photoUrls[0],
          photo1: photoUrls[1],
          photo2: photoUrls[2],
          photo3: photoUrls[3],
          userId: userId,
          price_per_day: pricePerDay,
          price_per_day_on_weekend: pricePerDayOnWeekend,
          mileage: mileage,
          description: description,
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
      setIsLoading(false);
    }
  };

  return (
    <StyledKeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StyledScrollView
        className="px-5 pt-10 pb-20"
        showsVerticalScrollIndicator={false}
      >
        <StyledText className="text-2xl font-bold mb-5 mt-10 text-center">
          Créer une annonce de voiture
        </StyledText>

        {/* Image Upload Section */}
        <StyledView className="mb-5">
          <StyledText className="text-lg font-semibold mb-3">Photos</StyledText>

          {/* Main Photo */}
          {photoUrl ? (
            <StyledView className="mb-4 relative">
              <StyledImage
                source={{ uri: photoUrl }}
                className="w-full h-64 rounded-xl"
              />
              <StyledTouchableOpacity
                className="absolute top-3 right-3 bg-red-500/70 rounded-full p-2"
                onPress={() => removeImage(0)}
              >
                <X color="white" size={20} />
              </StyledTouchableOpacity>
            </StyledView>
          ) : (
            <StyledTouchableOpacity
              className="h-64 bg-gray-100 rounded-xl mb-2 justify-center items-center"
              onPress={pickImage}
            >
              <Camera color="gray" size={48} />
              <StyledText className="text-gray-500 mt-2 mb">
                Ajouter une photo principale
              </StyledText>
            </StyledTouchableOpacity>
          )}

          {/* Additional Photos */}
          <StyledView className="flex-row flex-wrap gap-2">
            {[photo1, photo2, photo3].map(
              (photo, index) =>
                photo && (
                  <StyledView key={index} className="w-[30%] relative">
                    <StyledImage
                      source={{ uri: photo }}
                      className="w-full h-24 rounded-lg"
                    />
                    <StyledTouchableOpacity
                      className="absolute top-1 right-1 bg-red-500/70 rounded-full p-1"
                      onPress={() => removeImage(index + 1)}
                    >
                      <X color="white" size={12} />
                    </StyledTouchableOpacity>
                  </StyledView>
                )
            )}

            {/* Add Photo Button */}
            {(!photoUrl ||
              [photo1, photo2, photo3].filter(Boolean).length < 3) && (
              <StyledTouchableOpacity
                className="w-[30%] h-24 border-2 border-gray-200 rounded-lg justify-center items-center bg-gray-50"
                onPress={pickImage}
              >
                <Plus color="gray" size={24} />
              </StyledTouchableOpacity>
            )}
          </StyledView>
        </StyledView>

        {/* Car Details Section */}
        <StyledView className="mb-5">
          <StyledText className="text-lg font-semibold mb-3">
            Détails de la voiture
          </StyledText>

          {/* Input Fields */}
          <StyledView className="space-y-4">
            {/* Input fields for car details */}
            <StyledView>
              <StyledText className="mb-2 text-gray-700 font-medium">
                Marque *
              </StyledText>
              <StyledTextInput
                className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                value={make}
                onChangeText={setMake}
                placeholder="par exemple, Toyota"
              />
            </StyledView>

            {/* Other input fields */}
            {/* Similar input fields for model, year, price, etc. */}
          </StyledView>
        </StyledView>

        {/* Submit Button */}
        <StyledTouchableOpacity
          className="bg-blue-500 p-4 mb-20 rounded-xl items-center"
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <StyledText className="text-white text-base font-bold">
            {isLoading ? "Création de l'annonce..." : "Créer une annonce"}
          </StyledText>
        </StyledTouchableOpacity>
      </StyledScrollView>
    </StyledKeyboardAvoidingView>
  );
};

export default CreateCarScreen;
