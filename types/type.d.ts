import { TextInputProps, TouchableOpacityProps } from "react-native";
import { Float } from "react-native/Libraries/Types/CodegenTypes";

declare interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  profile_image_url: string;
  car_image_url: string;
  car_seats: number;
  rating: number;
}
declare interface AgenceData {
  latitude: number;
  longitude: number;
  first_name: string;
  id_agence: number;
}

declare interface MarkerData {
  latitude: number;
  longitude: number;
  id: number;
  title: string;
  profile_image_url: string;
  car_image_url: string;
  car_seats: number;
  rating: number;
  first_name: string;
  last_name: string;
  time?: number;
  price?: string;
}

declare interface MapProps {
  destinationLatitude?: number;
  destinationLongitude?: number;
  onDriverTimesCalculated?: (driversWithTimes: MarkerData[]) => void;
  selectedDriver?: number | null;
  onMapReady?: () => void;
}

declare interface Ride {
  origin_address: string;
  destination_address: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  ride_time: number;
  fare_price: number;
  payment_status: string;
  driver_id: number;
  user_id: string;
  created_at: string;
  driver: {
    first_name: string;
    last_name: string;
    car_seats: number;
  };
}
interface HomeProps {
  title?: string;
}
interface Car {
  id_voiture: number; // Unique identifier for the car
  id_agence: number; // Identifier for the agency that owns the car
  marque: string; // Brand of the car
  modele: string; // Model of the car
  annee: number;
  name: string;
  address: string;
  images: string[];
  latitude: number;
  longitude: number; // Year of manufacture
  disponible?: boolean; // Availability status of the car
  photo_url?: string; // URL or path to the first photo of the car (optional)
  photo1?: string; // URL or path to the first photo of the car (optional)
  photo2?: string; // URL or path to the second photo of the car (optional)
  photo3?: string;
  pricePerDay?: string;
  pricePerWeekend?: string; // URL or path to the third photo of the car (optional)
  price_per_day?: number; // Price per day for renting the car (optional)
  price_per_week?: number; // Price per week for renting the car (optional)
  price_per_day_on_weekend?: number; // Price per day on weekends (optional)
  price_full_weekend?: number; // Full price for renting over the weekend (optional)
}
interface UserType {
  userType: string | null; // or whatever type your userType should be
  setUserType: (userType: string) => void; // Method to set the user type
  clearUserType: () => void; // Method to clear the user type
}
interface Rent {
  date: string; // rental start date
  date_end: string; // rental end date
  status: string; // status of the rental
  paid: boolean; // whether the rental is paid
  amount: number; // rental amount
  renter: string; // name of the renter
}
interface Earnings {
  paid_count: string; // Adjust the property to match the API response
}

interface Jsonbin {
  jsonbin_url: string; // Adjust the property to match the API response
}



declare interface ButtonProps extends TouchableOpacityProps {
  title: string;
  bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success";
  textVariant?: "primary" | "default" | "secondary" | "danger" | "success";
  IconLeft?: React.ComponentType<any>;
  IconRight?: React.ComponentType<any>;
  className?: string;
}

declare interface GoogleInputProps {
  icon?: string;
  initialLocation?: string;
  containerStyle?: string;
  textInputBackgroundColor?: string;
  handlePress: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
    
  }) => void;
}

declare interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: any;
  secureTextEntry?: boolean;
  labelStyle?: string;
  containerStyle?: string;
  inputStyle?: string;
  iconStyle?: string;
  className?: string;
}

declare interface PaymentProps {
  fullName: string;
  email: string;
  amount: string;
  driverId: number;
  rideTime: number;
}

declare interface LocationStore {
  userLatitude: number | null;
  userLongitude: number | null;
  userAddress: string | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  destinationAddress: string | null;
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

declare interface DriverStore {
  drivers: MarkerData[];
  selectedDriver: number | null;
  setSelectedDriver: (driverId: number) => void;
  setDrivers: (drivers: MarkerData[]) => void;
  clearSelectedDriver: () => void;
}
declare interface CarStore {
  car: Car | null; // The currently stored car object
  setCar: (car: Car) => void; // Function to set the car object
  clearCar: () => void; // Function to clear the car object
  updateCar: (updatedCar: Partial<Car>) => void;
}
declare interface inputValue {
  inputValue: string;
  setInputValue: () => void; // Function to set the car object
}
declare interface DriverCardProps {
  item: MarkerData;
  selected: number;
  setSelected: () => void;
}
