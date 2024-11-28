import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useRef } from "react";
import { View, Platform, KeyboardAvoidingView, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapAgence from "@/components/MapsAgencesUser";
const RideLayout = ({
  title,
  snapPoints,
  children,
}: {
  title: string;
  snapPoints?: string[];
  children: React.ReactNode;
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          {/* Your Map or Main Content */}
          <View style={{ flex: 1, backgroundColor: "#blue-500" }}>
            <MapAgence />
          </View>

          {/* Bottom Sheet */}
          <BottomSheet
            ref={bottomSheetRef}
            snapPoints={snapPoints || ["40%", "85%"]}
            index={0}
            enablePanDownToClose={false}
            enableOverDrag={true}
            handleIndicatorStyle={styles.handleIndicator}
          >
            {title === "Choose a Rider" ? (
              <BottomSheetView style={styles.bottomSheetContent}>
                {children}
              </BottomSheetView>
            ) : (
              <BottomSheetScrollView
                contentContainerStyle={styles.scrollViewContent}
              >
                {children}
              </BottomSheetScrollView>
            )}
          </BottomSheet>
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  handleIndicator: {
    backgroundColor: "#ccc",
    height: 5,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
  },
  scrollViewContent: {
    padding: 20,
  },
});

export default RideLayout;
