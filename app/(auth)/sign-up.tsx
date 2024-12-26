import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    firstName: "",
    address: "",
    driverLicenseNumber: "",
    email: "",
    password: "",
  });
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerification({
        ...verification,
        state: "pending",
      });
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Erreur", err.errors[0].longMessage);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });
      if (completeSignUp.status === "complete") {
        await fetchAPI("/(api)/user", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            firstName: form.firstName,
            address: form.address,
            driverLicenseNumber: form.driverLicenseNumber,
            email: form.email,
            clerkId: completeSignUp.createdUserId,
          }),
        });
        await setActive({ session: completeSignUp.createdSessionId });
        setVerification({
          ...verification,
          state: "success",
        });
      } else {
        setVerification({
          ...verification,
          error: "La vérification a échoué. Veuillez réessayer.",
          state: "failed",
        });
      }
    } catch (err: any) {
      setVerification({
        ...verification,
        error: err.errors[0].longMessage,
        state: "failed",
      });
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Créer votre compte
          </Text>
        </View>

        <View className="p-5">
          <InputField
            label="Nom"
            placeholder="Entrez votre nom"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
          />
          <InputField
            label="Prénom"
            placeholder="Entrez votre prénom"
            icon={icons.person}
            value={form.firstName}
            onChangeText={(value) => setForm({ ...form, firstName: value })}
          />
          <InputField
            label="Adresse"
            placeholder="Entrez votre adresse"
            icon={icons.person}
            value={form.address}
            onChangeText={(value) => setForm({ ...form, address: value })}
          />
          <InputField
            label="Numéro de permis de conduire"
            placeholder="Entrez votre numéro de permis de conduire"
            icon={icons.person}
            value={form.driverLicenseNumber}
            onChangeText={(value) =>
              setForm({ ...form, driverLicenseNumber: value })
            }
          />
          <InputField
            label="Email"
            placeholder="Entrez votre email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            label="Mot de passe"
            placeholder="Entrez votre mot de passe"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />
          {/* <CustomButton
            title="S'inscrire"
            onPress={onSignUpPress}
            className="mt-6"
          /> */}
          <TouchableOpacity
            onPress={onSignUpPress}
            disabled={
              !isLoaded ||
              !form.email ||
              !form.password ||
              !form.name ||
              !form.firstName ||
              !form.address ||
              !form.driverLicenseNumber
            } // Disable if any field is missing
            className={` ${!isLoaded || !form.email || !form.password || !form.name || !form.firstName || !form.address || !form.driverLicenseNumber ? "opacity-50" : ""}`}
            style={{
              backgroundColor: "#6B7280",
              borderRadius: 24,
              padding: 16,
              alignItems: "center",
              marginTop: 80,
              opacity: isLoaded ? 0.5 : 1,
            }}
          >
            <Text className="text-gold font-bold text-base">S'inscrire</Text>
          </TouchableOpacity>

          {/* <OAuth /> */}
          <Link
            href="/sign-in"
            className="text-lg text-center text-general-200 mt-10"
          >
            Vous avez déjà un compte?{" "}
            <Text className="text-primary-500">Se connecter</Text>
          </Link>
        </View>
        <ReactNativeModal
          isVisible={verification.state === "pending"}
          onModalHide={() => {
            if (verification.state === "success") {
              setShowSuccessModal(true);
            }
          }}
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Text className="font-JakartaExtraBold text-2xl mb-2">
              Vérification
            </Text>
            <Text className="font-Jakarta mb-5">
              Nous avons envoyé un code de vérification à {form.email}.
            </Text>
            <InputField
              label={"Code"}
              icon={icons.lock}
              placeholder={"12345"}
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) =>
                setVerification({ ...verification, code })
              }
            />
            {verification.error && (
              <Text className="text-red-500 text-sm mt-1">
                {verification.error}
              </Text>
            )}
            <CustomButton
              title="Vérifier l'email"
              onPress={onPressVerify}
              className="mt-5 bg-success-500"
            />
          </View>
        </ReactNativeModal>
        <ReactNativeModal isVisible={showSuccessModal}>
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Image
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-5"
            />
            <Text className="text-3xl font-JakartaBold text-center">
              Vérifié
            </Text>
            <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
              Vous avez réussi à vérifier votre compte.
            </Text>
            <CustomButton
              title="Aller à l'accueil"
              onPress={() => router.push(`/(root)/(tabs)/home`)}
              className="mt-5"
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;
