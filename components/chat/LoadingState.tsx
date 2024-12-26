import React from "react";
import { ActivityIndicator, SafeAreaView } from "react-native";

export const LoadingState: React.FC = () => (
  <SafeAreaView className="flex-1 bg-white p-5">
    <ActivityIndicator size="large" color="#0000ff" />
  </SafeAreaView>
);