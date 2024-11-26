import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="carsAction" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
