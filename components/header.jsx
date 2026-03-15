import { Image, Platform, Text, View } from "react-native";

export default function AppHeader() {
  return (
    <View
      style={{
        position: "absolute",
        top: Platform.OS === "web" ? 0 : 40, // safe top padding on mobile
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#39913cff", // Agriculture green
        borderBottomWidth: 1,
        borderColor: "#A5D6A7",
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 100,
      }}
    >
      <Image
        source={require("../assets/favicon.png")}
        style={{ width: 40, height: 40, marginRight: 12 }}
        resizeMode="contain"
      />

      <View>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>
          Region V
        </Text>
        <Text style={{ fontSize: 15, color: "#f1f8e9" }}>
          Livestock Inspection
        </Text>
      </View>
    </View>
  );
}
