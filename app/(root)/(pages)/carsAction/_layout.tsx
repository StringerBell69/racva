import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="modifyCar" options={{ headerShown: false }} />
      <Stack.Screen name="createCar" options={{ headerShown: false }} />
      <Stack.Screen name="rents" options={{ headerShown: false }} />
      <Stack.Screen name="edit" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
