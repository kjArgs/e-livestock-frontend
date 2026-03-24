import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

export default function ThemedTextInput({
  label,
  value,
  onChangeText,
  style,
  secureTextEntry,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const animatedLabel = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedLabel, {
      toValue: isFocused || value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [animatedLabel, isFocused, value]);

  const labelStyle = {
    position: "absolute",
    left: 14,
    top: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -8],
    }),
    fontSize: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 13],
    }),
    color: isFocused ? "#4CAF50" : "#777",
    backgroundColor: "#fff", // removes border line behind label
    paddingHorizontal: 4,
    zIndex: 1,
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        {...props}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        style={[
          styles.input,
          {
            borderColor: isFocused ? "#4CAF50" : "#A5D6A7",
          },
        ]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
}

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    width: screenWidth * 0.8,
    marginVertical: 10,
  },
  input: {
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: "#fff",
    borderColor: "#A5D6A7",
  },
});
