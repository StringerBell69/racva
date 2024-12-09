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
  Pressable,
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
        <Text className="text-2xl font-JakartaBold my-5">Settings</Text>

        {/* Sign-Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="justify-center items-center w-12 h-12 rounded-full bg-white"
          accessibilityLabel="Sign Out"
        >
          <Image source={icons.out} className="w-6 h-6" />
        </TouchableOpacity>

        {/* Profile Section */}
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
          {user?.fullName || "User Name"}
        </Text>
        <Text className="text-sm text-gray-500 text-center mb-5">
          {user?.primaryEmailAddress?.emailAddress || "user@example.com"}
        </Text>

        {/* Edit Profile Button */}
        <TouchableOpacity
          onPress={() => router.push(`/chat`)}
          className="bg-gray-900 rounded-xl p-4 items-center"
        >
          <Text className="text-gold font-bold">Editer le profil</Text>
        </TouchableOpacity>

        {/* Preferences Section */}
        <Text className="text-lg font-JakartaBold mt-8 mb-4">Preferences</Text>
        <View className="bg-white rounded-lg shadow-sm shadow-neutral-300 p-4">
          {/* Dark Mode */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="ml-3 text-gray-700">Dark Mode</Text>
            <Switch
              value={form.darkMode}
              onValueChange={(value) => togglePreference("darkMode", value)}
            />
          </View>

          {/* Email Notifications */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="ml-3 text-gray-700">Email Notifications</Text>
            <Switch
              value={form.emailNotifications}
              onValueChange={(value) =>
                togglePreference("emailNotifications", value)
              }
            />
          </View>

          {/* Push Notifications */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="ml-3 text-gray-700">Push Notifications</Text>
            <Switch
              value={form.pushNotifications}
              onValueChange={(value) =>
                togglePreference("pushNotifications", value)
              }
            />
          </View>
        </View>

        {/* Footer */}
        <Text className="text-center text-gray-500 mt-10">
          Made with ❤️ in Lyon, France
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
