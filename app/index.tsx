import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { useUserTypeStore } from "@/store";

const Page = () => {
  const { isSignedIn } = useAuth();
  const { userType } = useUserTypeStore();


  
  // if (isSignedIn && userType == "agence") {
  //   return <Redirect href="/(root)/(tabsAgence)/home" />;
  // } else if (isSignedIn && userType == "user") {
  //   return <Redirect href="/(root)/(tabs)/home" />;
  // }
  if (isSignedIn)
    return <Redirect href="/(root)/(tabsAgence)/home" />;
  
    return <Redirect href="/(auth)/welcome" />;
};

export default Page;
