import { useState, useEffect } from "react";
import { Redirect } from "expo-router";
import { Text, View } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";

// Définir les routes comme des constantes (avec 'as const' pour inférer des types spécifiques)
const ROUTES = {
  AGENCY: "/(root)/(tabsAgence)/home",
  USER: "/(root)/(tabs)/home",
  WELCOME: "/(auth)/welcome",
} as const;

const Page = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  // Clerk est encore en train de charger
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Chargement de l'auth...</Text>
      </View>
    );
  }

  // Non connecté
  if (!isSignedIn) {
    return <Redirect href={ROUTES.WELCOME} />;
  }

  // Retourner directement la redirection basée sur le type d'utilisateur
  const userType = user?.publicMetadata?.userType;


  // Vérifier le type d'utilisateur et rediriger
  if (userType === "agence") {
    return <Redirect href={ROUTES.AGENCY} />;
  } else if (userType === undefined) {
    return <Redirect href={ROUTES.USER} />;
  } else {
    return <Redirect href={ROUTES.WELCOME} />;
  }
};

export default Page;
