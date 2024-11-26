import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { useAuth } from "@clerk/clerk-expo";

import { Jsonbin } from "@/types/type";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { useUserTypeStore } from "@/store";

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { signOut } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const bin = process.env.EXPO_X_MASTER_API_KEY;
  const { setUserType } = useUserTypeStore();

  // Fetch JSON bin data
  const { data: jsonBinData } = useFetch<Jsonbin[]>(`/(api)/jsonbin`);

  // Fetch user type based on email
  const fetchUserData = async (email: string): Promise<boolean> => {
    try {
      const jsonBinUrl = jsonBinData?.[0]?.jsonbin_url;
      const headers: HeadersInit = bin ? { "X-Master-Key": bin } : {};

      const response = await fetch(
        jsonBinUrl || "https://api.jsonbin.io/v3/b/67194b3ee41b4d34e447b219",
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const {
        record: { adminEmails },
      } = await response.json();
      return adminEmails
        .map((e: string) => e.toLowerCase())
        .includes(email.toLowerCase());
    } catch (error) {
      console.error("Error fetching user type:", error);
      return false;
    }
  };

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });

        // Determine if the user is an agency
        const isAgence = await fetchUserData(form.email);
        if (isAgence) {
          setUserType("agence");
          router.replace("/(root)/(tabsAgence)/home");
        } else {
          setUserType("user");
          router.replace("/(root)/(tabs)/home");
        }
      } else {
        console.log(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Error", "Login failed. Please try again.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0]?.longMessage || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, form, jsonBinData]);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Welcome 👋
          </Text>
        </View>

        <View className="p-5">
          {/* Email Input */}
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />

          {/* Password Input */}
          <InputField
            label="Password"
            placeholder="Enter password"
            icon={icons.lock}
            secureTextEntry
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          {/* Sign-In Button */}
          <CustomButton
            title={loading ? "Signing In..." : "Sign In"}
            onPress={onSignInPress}
            className="mt-6"
            disabled={loading}
          />

          {/* OAuth Providers */}
          <OAuth />

          {/* Sign-Up Link */}
          <Link
            href="/sign-up"
            className="text-lg text-center text-general-200 mt-10"
          >
            Don't have an account?{" "}
            <Text className="text-primary-500">Sign Up</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
