import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="modifyCar" options={{ headerShown: false }} />
      <Stack.Screen name="createCar" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
