import { create } from "zustand";
import { persist, PersistStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DriverStore,
  LocationStore,
  MarkerData,
  CarStore,
  Car,
  UserType,
} from "@/types/type";

export const useLocationStore = create<LocationStore>((set) => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    }));

    // if driver is selected and now new location is set, clear the selected driver
    const { selectedDriver, clearSelectedDriver } = useDriverStore.getState();
    if (selectedDriver) clearSelectedDriver();
  },

  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    }));

    // if driver is selected and now new location is set, clear the selected driver
    const { selectedDriver, clearSelectedDriver } = useDriverStore.getState();
    if (selectedDriver) clearSelectedDriver();
  },
}));

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [] as MarkerData[],
  selectedDriver: null,
  setSelectedDriver: (driverId: number) =>
    set(() => ({ selectedDriver: driverId })),
  setDrivers: (drivers: MarkerData[]) => set(() => ({ drivers })),
  clearSelectedDriver: () => set(() => ({ selectedDriver: null })),
}));

// Define a type for the store state
interface InputStore {
  inputValue: string | null; // Use '|' instead of '||'
  setInputValue: (value: string) => void;
}

interface User {
  id: number | null;
  setUserId: (value: number) => void;
}
export const useUser = create<User>((set) => ({
  id: null,
  setUserId: (value: number) => set({ id: value }),
}));

// Create the store
export const useInputStore = create<InputStore>((set) => ({
  inputValue: null,
  setInputValue: (value: string) => set({ inputValue: value }),
}));

// Define the UserTypeStore interface
interface UserTypeStore {
  userType: string | null; // Allow userType to be null
  setUserType: (userType: string | null) => void; // Update to accept string | null
  clearUserType: () => void;
}

// Define a custom storage interface
const customStorage: PersistStorage<any> = {
  getItem: async (name: string): Promise<any> => {
    const value = await AsyncStorage.getItem(name);
    return value ? JSON.parse(value) : null; // Parse the JSON string back to an object
  },
  setItem: async (name: string, value: any) => {
    await AsyncStorage.setItem(name, JSON.stringify(value)); // Stringify the object before storing
  },
  removeItem: async (name: string) => {
    await AsyncStorage.removeItem(name);
  },
};

export const useUserTypeStore = create<UserTypeStore>()(
  persist(
    (set) => ({
      userType: null,
      setUserType: (userType: string | null) => set({ userType }),
      clearUserType: () => set({ userType: null }),
    }),
    {
      name: "user-type-storage",
      storage: customStorage, // Use the custom storage
    }
  )
);

export const useCarStore = create<CarStore>((set) => ({
  car: null, // Initialize with no car selected
  setCar: (car: Car) => set(() => ({ car })), // Set the car object
  clearCar: () => set(() => ({ car: null })), // Clear the car object

  updateCar: (updatedCar) =>
    set((state) => ({
      car: state.car ? { ...state.car, ...updatedCar } : null,
    })),
}));
