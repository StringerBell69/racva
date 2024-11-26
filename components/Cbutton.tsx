import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success";
  textVariant?: "primary" | "default" | "secondary" | "danger" | "success";
  IconLeft?: React.ComponentType<any>;
  IconRight?: React.ComponentType<any>;
  className?: string;
}

const Cbutton: React.FC<ButtonProps> = ({
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft,
  IconRight,
  className,
  ...props
}) => {
  // Background color styles
  const bgColorClasses = {
    primary: "bg-sky-500",
    secondary: "bg-gray-500",
    danger: "bg-red-500",
    outline: "bg-transparent border border-blue-500",
    success: "bg-green-500",
  };

  // Text color styles
  const textColorClasses = {
    primary: "text-blue-500",
    default: "text-white",
    secondary: "text-gray-500",
    danger: "text-red-500",
    success: "text-green-500",
  };

  return (
    <TouchableOpacity
      className={`${bgColorClasses[bgVariant]} py-2 px-4 rounded-full flex-row items-center justify-center ${className}`}
      {...props}
    >
      {IconLeft && <IconLeft className={`mr-2`} />}
      <Text
        className={`${textColorClasses[textVariant]} text-center text-sm font-semibold`}
      >
        {title}
      </Text>
      {IconRight && <IconRight className={`ml-2`} />}
    </TouchableOpacity>
  );
};

export default Cbutton;
