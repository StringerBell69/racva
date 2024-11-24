import { create } from "zustand";

import { DriverStore, LocationStore, MarkerData, CarStore,Car,UserType } from "@/types/type";

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

// Create the store
export const useInputStore = create<InputStore>((set) => ({
  inputValue: null,
  setInputValue: (value: string) => set({ inputValue: value }),
}));

export const useUserTypeStore = create<UserType>((set) => ({
  userType: null, // Initialize with no user type selected
  setUserType: (userType: string) => set({ userType }), // Set the user type object
  clearUserType: () => set({ userType: null }), // Clear the UserType object
}));

export const useCarStore = create<CarStore>((set) => ({
  car: null, // Initialize with no car selected
  setCar: (car: Car) => set(() => ({ car })), // Set the car object
  clearCar: () => set(() => ({ car: null })), // Clear the car object

  updateCar: (updatedCar) =>
    set((state) => ({
      car: state.car ? { ...state.car, ...updatedCar } : null,
    })),
}));