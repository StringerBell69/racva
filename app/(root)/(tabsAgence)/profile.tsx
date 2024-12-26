import React, { useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Image,
} from "react-native";
import { icons } from "@/constants";
import { router } from "expo-router";

const Profile = () => {
  const { signOut } = useAuth();
  const { user } = useUser();

  const [form, setForm] = useState({
    darkMode: false,
    emailNotifications: true,
    pushNotifications: false,
  });

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };

  const togglePreference = (key: string, value: boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        className="px-5"
      >
        <Text className="text-2xl font-JakartaBold my-5">Paramètres</Text>

        {/* Bouton de déconnexion */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="justify-center items-center w-12 h-12 rounded-full bg-white"
          accessibilityLabel="Se déconnecter"
        >
          <Image source={icons.out} className="w-6 h-6" />
        </TouchableOpacity>

        {/* Section du profil */}
        <View className="flex items-center justify-center my-5">
          <Image
            source={{
              uri:
                user?.externalAccounts[0]?.imageUrl ||
                user?.imageUrl ||
                "https://via.placeholder.com/110",
            }}
            style={{ width: 110, height: 110, borderRadius: 55 }}
            className="border-[3px] border-white shadow-sm shadow-neutral-300"
          />
        </View>
        <Text className="text-lg font-semibold text-center my-2">
          {user?.fullName || "Nom de l'utilisateur"}
        </Text>
        <Text className="text-sm text-gray-500 text-center mb-5">
          {user?.primaryEmailAddress?.emailAddress || "utilisateur@example.com"}
        </Text>

        {/* Bouton d'édition du profil */}
        <TouchableOpacity onPress={() => router.push("/")}>
          <View className="flex-row items-center justify-center bg-blue-500 rounded-lg p-3">
            <Text className="text-white font-semibold mr-2">Éditer le profil</Text>
          </View>
        </TouchableOpacity>

        {/* Section des préférences */}
        <Text className="text-lg font-JakartaBold mt-8 mb-4">Préférences</Text>
        <View className="bg-white rounded-lg shadow-sm shadow-neutral-300 p-4">
          {/* Mode sombre */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="ml-3 text-gray-700">Mode sombre</Text>
            <Switch
              value={form.darkMode}
              onValueChange={(value) => togglePreference("darkMode", value)}
            />
          </View>

          {/* Notifications par email */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="ml-3 text-gray-700">Notifications par email</Text>
            <Switch
              value={form.emailNotifications}
              onValueChange={(value) =>
                togglePreference("emailNotifications", value)
              }
            />
          </View>

          {/* Notifications push */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="ml-3 text-gray-700">Notifications push</Text>
            <Switch
              value={form.pushNotifications}
              onValueChange={(value) =>
                togglePreference("pushNotifications", value)
              }
            />
          </View>
        </View>

        {/* Pied de page */}
        <Text className="text-center text-gray-500 mt-10">
          Fait avec ❤️ à Lyon, France
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
