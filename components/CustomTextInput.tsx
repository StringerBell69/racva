import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  Pressable,
  Image,
  TextInputProps,
} from "react-native";
import { icons } from "@/constants";

interface CustomInputProps extends TextInputProps {
  onChangeValue?: (text: string) => void;
  pressableIconClick: () => void;
}

const CustomInput: React.FC<CustomInputProps> = ({
  onChangeValue,
  pressableIconClick, // Add this line to destructure pressableIconClick
  ...props
}) => {
  const [value, setValue] = useState<string>("");
  const inputRef = useRef<TextInput>(null); // Create a ref for TextInput

  const handleChange = (text: string) => {
    setValue(text);
    if (onChangeValue) {
      onChangeValue(text);
    }
  };

  const unfocusInput = () => {
    inputRef.current?.blur(); // Calls blur on the TextInput ref to unfocus
  };

  return (
    <View className="relative w-full flex-row items-center border-solid border-2 border-gold-dark bg-gray-100 p-3 rounded-lg">
      <TextInput
        ref={inputRef}
        className="flex-1 text-base text-gray-700"
        value={value}
        onChangeText={handleChange}
        placeholder="A model or brand..."
        {...props}
      />
      <Pressable
        onPress={() => {
          pressableIconClick();
          unfocusInput();
        }}
        className="absolute right-3"
      >
        <Image source={icons.search} className="w-6 h-6" resizeMode="contain" />
      </Pressable>
    </View>
  );
};

export default CustomInput;
