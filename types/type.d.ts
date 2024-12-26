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
  id: number; // Rental ID
  rental_start_date: string; // Start date of the rental
  rental_end_date: string; // End date of the rental
  date: string; // Rental start date (can be used as rentalStart)
  date_end: string; // Rental end date (can be used as rentalEnd)
  status: string; // Status of the rental (e.g., "upcoming", "ongoing", "ended")
  paid: boolean; // Whether the rental has been paid
  amount: number; // Total rental amount
  renter: string; // Full name of the renter (used to split into first and last name)
  renter_phone?: string; // Optional: Phone number of the renter
  renter_email?: string; // Optional: Email address of the renter
  vehicle_brand?: string; // Optional: Vehicle brand (e.g., "Toyota")
  vehicle_model?: string; // Optional: Vehicle model (e.g., "Corolla")
  vehicle_plate?: string; // Optional: Vehicle plate number
  vehicle_condition?: string; // Optional: Condition of the vehicle
  pickup_location?: string; // Optional: Pickup location
  return_location?: string; // Optional: Return location
  rental_price?: number; // Optional: Price for the rental (per day/week)
  deposit?: number; // Optional: Deposit for the rental
  mileage_limit?: number; // Optional: Mileage limit (in km)
  extra_km_price?: number; // Optional: Price per extra km
  payment_method?: string; // Optional: Payment method
  agency_name?: string; // Agency name (added)
  agency_address?: string; // Agency address (added)
  agency_phone?: string; // Agency phone (added)
  agency_email?: string; // Agency email (added)
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
  id_agence: string;
  id_voiture: string;
  start: Date;
  end: Date;
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

declare interface Message {
  id: number;
  chat_id: string;
  sender_id: number;
  recipient_id: number;
  message: string;
  timestamp: string;
}

declare interface ChatMessage {
  type: "chat_history" | "new_message" | "error" | "connection_established";
  messages?: Message[];
  message?: Message;
  error?: string;
}