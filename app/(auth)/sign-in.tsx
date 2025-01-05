import { useSignIn } from "@clerk/clerk-expo";
import { useCallback } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import { fetchAPI } from "@/lib/fetch";
import { Jsonbin } from "@/types/type";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import {  useUserTypeStore } from "@/store";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { useUser } from "@clerk/clerk-expo";

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { signOut } = useAuth();
  const { user } = useUser();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  

  

  // Récupérer le type d'utilisateur basé sur l'email
  
      
  const onSignInPress = useCallback(async () => {
    await signOut();

    if (!isLoaded) return;
    setLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });

        // Déterminer si l'utilisateur est une agence
        const userType = user?.publicMetadata?.userType;
       
        if (userType === "agence") {
          router.replace("/(root)/(tabsAgence)/home");
        } else if (userType === undefined) {
          router.replace("/(root)/(tabs)/home");
        } else {
          console.log(JSON.stringify(signInAttempt, null, 2));
          Alert.alert("Erreur", "Échec de la connexion. Veuillez réessayer.");
        }
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert(
        "Erreur",
        err.errors[0]?.longMessage || "Une erreur est survenue"
      );
    } finally {
      setLoading(false);
    }
  }, [isLoaded, form]);



  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Bienvenue 👋
          </Text>
        </View>

        <View className="p-5">
          {/* Champ Email */}
          <InputField
            label="Email"
            placeholder="Entrez votre email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />

          {/* Champ Mot de passe */}
          <InputField
            label="Mot de passe"
            placeholder="Entrez votre mot de passe"
            icon={icons.lock}
            secureTextEntry
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <TouchableOpacity
            onPress={onSignInPress}
            style={{
              backgroundColor: "#111827",
              borderRadius: 24,
              padding: 16,
              alignItems: "center",
              marginTop: 80,
              opacity: 20, // Removed the gray filter by setting opacity to 1
            }}
          >
            <Text className="text-gold font-bold text-base">Se connecter</Text>
          </TouchableOpacity>

          <Link
            href="/sign-up"
            className="text-lg text-center text-general-200 mt-10"
          >
            Vous n'avez pas de compte ?{" "}
            <Text className="text-primary-500">S'inscrire</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
