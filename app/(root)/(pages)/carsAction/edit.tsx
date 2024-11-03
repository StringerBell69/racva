import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  Switch,
} from "react-native";
import { useState } from "react";
import { fetchAPI } from "@/lib/fetch";
import { router } from "expo-router";
import CarsLayout from "@/components/CarsLayout";
import CustomButton from "@/components/CustomButton";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "@clerk/clerk-expo";
import { useCarStore } from "@/store";
// Ensure icons are correctly imported
import { icons } from "@/constants"; // Adjust this path as needed

const EditCar = ({ title = "Edit Car", snapPoints = ["100%"] }) => {
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

  const handleSave = async () => {
    if (!make || !model || !year) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    if (!car) {
      Alert.alert("Error", "No car data available.");
      return;
    }

    setIsLoading(true);
    console.log("Making API call with data:", userId);

    try {
      const response = await fetchAPI("/(api)/cars/create", {
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

      Alert.alert("Success", "Car details saved successfully.");
      router.back();
    } catch (error) {
      console.error("Error saving car details:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to save car details. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CarsLayout title={title} snapPoints={snapPoints}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          backgroundColor: "white",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <View
            style={{ padding: 8, borderRadius: 50, backgroundColor: "gray" }}
          >
        <Text> = </Text>

          </View>
        </TouchableOpacity>
        <Text
          style={{
            marginLeft: 16,
            fontSize: 20,
            fontWeight: "bold",
            color: "gray",
          }}
        >
          {title || "Go Back"}
        </Text>
      </View>

      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, color: "gray", marginBottom: 8 }}>
          Make
        </Text>
        <TextInput
          placeholder="Make"
          value={make}
          onChangeText={setMake}
          style={{
            borderBottomWidth: 1,
            borderColor: "gray",
            padding: 8,
            marginBottom: 16,
          }}
        />

        <Text style={{ fontSize: 18, color: "gray", marginBottom: 8 }}>
          Model
        </Text>
        <TextInput
          placeholder="Model"
          value={model}
          onChangeText={setModel}
          style={{
            borderBottomWidth: 1,
            borderColor: "gray",
            padding: 8,
            marginBottom: 16,
          }}
        />

        <Text style={{ fontSize: 18, color: "gray", marginBottom: 8 }}>
          Price per Day
        </Text>
        <TextInput
          placeholder="Price per Day"
          value={pricePerDay}
          onChangeText={setPricePerDay}
          keyboardType="decimal-pad"
          style={{
            borderBottomWidth: 1,
            borderColor: "gray",
            padding: 8,
            marginBottom: 16,
          }}
        />

        <Text style={{ fontSize: 18, color: "gray", marginBottom: 8 }}>
          Price per Week
        </Text>
        <TextInput
          placeholder="Price per Week"
          value={pricePerWeek}
          onChangeText={setPricePerWeek}
          keyboardType="decimal-pad"
          style={{
            borderBottomWidth: 1,
            borderColor: "gray",
            padding: 8,
            marginBottom: 16,
          }}
        />

        <Text style={{ fontSize: 18, color: "gray", marginBottom: 8 }}>
          Price per Day on Weekend
        </Text>
        <TextInput
          placeholder="Price per Day on Weekend"
          value={pricePerDayOnWeekend}
          onChangeText={setPricePerDayOnWeekend}
          keyboardType="decimal-pad"
          style={{
            borderBottomWidth: 1,
            borderColor: "gray",
            padding: 8,
            marginBottom: 16,
          }}
        />

        <Text style={{ fontSize: 18, color: "gray", marginBottom: 8 }}>
          Price Full Weekend
        </Text>
        <TextInput
          placeholder="Price Full Weekend"
          value={priceFullWeekend}
          onChangeText={setPriceFullWeekend}
          keyboardType="decimal-pad"
          style={{
            borderBottomWidth: 1,
            borderColor: "gray",
            padding: 8,
            marginBottom: 16,
          }}
        />

        <Text style={{ fontSize: 18, color: "gray", marginBottom: 8 }}>
          Year
        </Text>
        <Picker
          selectedValue={year}
          onValueChange={(itemValue) => setYear(itemValue)}
          style={{ height: 50, width: "50%", marginBottom: 16 }}
        >
          <Picker.Item label="Select Year" value="" />
          {years.map((year) => (
            <Picker.Item key={year} label={String(year)} value={String(year)} />
          ))}
        </Picker>

        <Text style={{ fontSize: 18, color: "gray", marginBottom: 8 }}>
          Available
        </Text>
        <Switch
          value={available}
          onValueChange={setAvailable}
          style={{ marginBottom: 16 }}
        />

        <TouchableOpacity
          style={{
            backgroundColor: isLoading ? "gray" : "green",
            padding: 16,
            borderRadius: 8,
          }}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text
            style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </CarsLayout>
  );
};

export default EditCar;
