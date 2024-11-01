import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useCallback, useState, useEffect } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";

import Constants from "expo-constants";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [isAgence, setAgence] = useState(false);
  const [loading, setLoading] = useState(false); // Added loading state

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

const bin = process.env.EXPO_X_MASTER_API_KEY;


  

  const fetchUserData = async (email: string): Promise<boolean> => {
    try {
      const jsonBinUrl = "https://api.jsonbin.io/v3/b/67194b3ee41b4d34e447b219"; // Replace with your actual bin ID

      // Build headers conditionally
      const headers: HeadersInit = {};
      if (bin) {
        headers["X-Master-Key"] = bin; // Only add if apiKey is defined
      }

      const agenceResponse = await fetch(jsonBinUrl, {
        headers: headers,
      });

      // Check if the response is OK
      if (!agenceResponse.ok) {
        const errorText = await agenceResponse.text();
        console.error("Error fetching user data 1:", errorText);
        throw new Error(`HTTP error! status: ${agenceResponse.status}`);
      }

      const {
        record: { adminEmails },
      } = await agenceResponse.json(); // JSONBin response is wrapped in a 'record' object
    const isAgence = adminEmails
      .map((e :string) => e.toLowerCase())
      .includes(email.toLowerCase());
      console.log("Fetched user email:", email);
      console.log("Admins found:", adminEmails);

      setAgence(isAgence); // Update the state to reflect if the user is an admin

      return isAgence; // Return the isAgence value
    } catch (error) {
      console.error("Error fetching user data: 2", error);
      return false; // Return false in case of an error
    }
  };

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    setLoading(true); // Set loading to true

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        // Fetch user data after successful sign in and await its result
        const isAgence = await fetchUserData(form.email);

        // Navigate based on isAgence state
        if (isAgence) {
          router.replace("/(root)/(tabsAgence)/home");
        } else {
          router.replace("/(root)/(tabs)/home");

          
        }
      } else {
        console.log(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Error", "Log in failed. Please try again.");
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0]?.longMessage || "An error occurred");
    } finally {
      setLoading(false); // Reset loading state
    }
  }, [isLoaded, form]);

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
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />

          <InputField
            label="Password"
            placeholder="Enter password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <CustomButton
            title={loading ? "Signing In..." : "Sign In"} // Update button text based on loading
            onPress={onSignInPress}
            className="mt-6"
            disabled={loading} // Disable button while loading
          />

          <OAuth />

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
