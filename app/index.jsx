import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  MD3LightTheme,
  Provider as PaperProvider,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

const agricultureTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#4CAF50",
    secondary: "#81C784",
    background: "#F1F8E9",
    surface: "#ffffff",
    onPrimary: "#ffffff",
    outline: "#A5D6A7",
  },
};

const API_URL =
  "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/logIn.php";

export default function Login() {
  return (
    <PaperProvider theme={agricultureTheme}>
      <LoginScreen />
    </PaperProvider>
  );
}

function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const text = await response.text();
      console.log("Raw response:", text);

      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        throw new Error("Server did not return valid JSON. Got: " + text);
      }

      setLoading(false);

      if (result.success) {
        await AsyncStorage.multiSet([
          ["token", result.token],
          ["role", result.user.account_type],
          ["first_name", result.user.first_name || ""],
          ["last_name", result.user.last_name || ""],
          ["account_id", String(result.user.account_id)],
          ["user", JSON.stringify(result.user)],
        ]);

        Alert.alert("Success", "Login successful!");

        switch (result.user.account_type) {
          case "user":
            router.replace("/(mobile)/ownerDashboard");
            break;
          case "admin":
            router.replace("/(admin)/dashboard");
            break;
          case "AntemortemInspector":
            router.replace("/antemortemDashboard");
            break;
          case "livestockInspector":
            router.replace("/livestockInspectorDashboard");
            break;
          default:
            Alert.alert("Login Failed", "Unknown account type.");
        }
      } else {
        Alert.alert("Login Failed", result.message || "Invalid credentials.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Login error:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
    }
  };

  return (
    <LinearGradient colors={["#C8E6C9", "#F1F8E9"]} style={styles.root}>
      {/* Curved background */}
      <View style={styles.curvedContainer} />

      {/* Logo */}
      <Image source={require("../assets/logo.png")} style={styles.logo} />
      <Text style={styles.logoText}>
        e-Livestock Municipal Agriculture Office-Sipocot
      </Text>

      {/* Login Card */}
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Text
            variant="titleLarge"
            style={{
              color: colors.primary,
              fontWeight: "bold",
              marginBottom: 10,
            }}
          >
            Welcome Back 👋
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: "#4b4b4b", marginBottom: 20 }}
          >
            Login to your e-Livestock account
          </Text>

          <TextInput
            label="Username"
            mode="outlined"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
            outlineColor={colors.outline}
          />

          <TextInput
            label="Password"
            mode="outlined"
            secureTextEntry={secureText}
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={secureText ? "eye-off" : "eye"}
                onPress={() => setSecureText(!secureText)}
              />
            }
            outlineColor={colors.outline}
          />

          <TouchableOpacity
            onPress={() => router.push("/sendOtp")}
            style={{ alignSelf: "flex-end", marginBottom: 8 }}
          >
            <Text
              variant="bodySmall"
              style={{ color: colors.primary, fontWeight: "600" }}
            >
              Forgot password?
            </Text>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator
              animating={true}
              color={colors.primary}
              style={{ marginVertical: 16 }}
            />
          ) : (
            <Button
              mode="contained"
              onPress={handleLogin}
              style={[styles.button, { backgroundColor: colors.primary }]}
              contentStyle={{ paddingVertical: 6 }}
            >
              Login
            </Button>
          )}

          <View style={styles.signupContainer}>
            <Text variant="bodyMedium">Don’t have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text
                variant="bodyMedium"
                style={{ color: colors.primary, fontWeight: "600" }}
              >
                Sign up here
              </Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    position: "relative",
  },
  curvedContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "#A5D6A7",
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    zIndex: -1,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginTop: 60,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    width: Platform.OS === "web" ? 420 : "100%",
    borderRadius: 16,
    elevation: 4,
    paddingBottom: 10,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "white",
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
});
