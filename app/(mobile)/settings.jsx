import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { TextInput } from "react-native-paper";
import AgriButton from "../../components/AgriButton";
import DashboardShell from "../../components/DashboardShell";
import { agriPalette } from "../../constants/agriTheme";

const INFO_API =
  "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/get_user_info.php";
const UPDATE_API =
  "https://e-livestock.tulongkabataanbicol.com/eLiveStockAPI/API/update_user.php";

const SETTINGS_META = {
  user: {
    eyebrow: "Owner settings",
    roleLabel: "owner",
    dashboardRoute: "/ownerDashboard",
    dashboardTitle: "owner dashboard",
  },
  livestockInspector: {
    eyebrow: "Inspector settings",
    roleLabel: "livestock inspector",
    dashboardRoute: "/livestockInspectorDashboard",
    dashboardTitle: "inspector dashboard",
  },
  AntemortemInspector: {
    eyebrow: "Antemortem settings",
    roleLabel: "antemortem inspector",
    dashboardRoute: "/antemortemDashboard",
    dashboardTitle: "antemortem dashboard",
  },
};

function buildEmptyProfile() {
  return {
    accountId: "",
    firstName: "",
    lastName: "",
    address: "",
    email: "",
    contactNumber: "",
    username: "",
    password: "",
  };
}

export default function SettingsScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState(buildEmptyProfile());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState("user");

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      try {
        const [
          storedAccountId,
          storedUser,
          storedEmail,
          storedContactNumber,
          storedAddress,
          storedUsername,
          storedRole,
        ] = await Promise.all([
          AsyncStorage.getItem("account_id"),
          AsyncStorage.getItem("user"),
          AsyncStorage.getItem("email"),
          AsyncStorage.getItem("contact_number"),
          AsyncStorage.getItem("address"),
          AsyncStorage.getItem("username"),
          AsyncStorage.getItem("role"),
        ]);

        const parsedUser = storedUser ? JSON.parse(storedUser) : {};
        setRole(storedRole || parsedUser.account_type || "user");

        const baseProfile = {
          accountId: storedAccountId || String(parsedUser.account_id || ""),
          firstName: parsedUser.first_name || "",
          lastName: parsedUser.last_name || "",
          address: parsedUser.address || storedAddress || "",
          email: parsedUser.email || storedEmail || "",
          contactNumber:
            parsedUser.contact_number || storedContactNumber || "",
          username: parsedUser.username || storedUsername || "",
          password: "",
        };

        setProfile(baseProfile);

        if (baseProfile.accountId) {
          const response = await fetch(INFO_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ account_id: baseProfile.accountId }),
          });
          const rawText = await response.text();
          const data = rawText ? JSON.parse(rawText) : {};

          if (data.status === "success" && data.user) {
            setProfile((current) => ({
              ...current,
              firstName: data.user.first_name ?? current.firstName,
              lastName: data.user.last_name ?? current.lastName,
              address: data.user.address ?? current.address,
              email: data.user.email ?? current.email,
              contactNumber: data.user.contact_number ?? current.contactNumber,
              username: data.user.username ?? current.username,
            }));
          }
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to load your profile settings.");
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  const settingsMeta = SETTINGS_META[role] || SETTINGS_META.user;

  const updateField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            router.replace("/");
          } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to log out.");
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (
      !profile.firstName.trim() ||
      !profile.lastName.trim() ||
      !profile.address.trim() ||
      !profile.email.trim() ||
      !profile.contactNumber.trim() ||
      !profile.username.trim()
    ) {
      Alert.alert("Error", "Please complete all required fields.");
      return;
    }

    if (!profile.email.includes("@")) {
      Alert.alert("Invalid email", "Email must contain @.");
      return;
    }

    if (profile.contactNumber.length !== 11) {
      Alert.alert(
        "Invalid phone number",
        "Phone number must be exactly 11 digits."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        account_id: Number.parseInt(profile.accountId, 10),
        first_name: profile.firstName.trim(),
        last_name: profile.lastName.trim(),
        address: profile.address.trim(),
        email: profile.email.trim(),
        contact_number: profile.contactNumber.trim(),
        username: profile.username.trim(),
      };

      if (profile.password.trim()) {
        payload.password = profile.password;
      }

      const response = await fetch(UPDATE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const rawText = await response.text();
      const data = rawText ? JSON.parse(rawText) : {};

      if (data.status !== "success") {
        Alert.alert("Error", data.message || "Failed to update profile.");
        setSaving(false);
        return;
      }

      const storedUser = await AsyncStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : {};
      const nextUser = {
        ...parsedUser,
        account_id: Number.parseInt(profile.accountId, 10),
        first_name: payload.first_name,
        last_name: payload.last_name,
        username: payload.username,
        address: payload.address,
        email: payload.email,
        contact_number: payload.contact_number,
      };

      await AsyncStorage.multiSet([
        ["first_name", payload.first_name],
        ["last_name", payload.last_name],
        ["username", payload.username],
        ["email", payload.email],
        ["contact_number", payload.contact_number],
        ["address", payload.address],
        ["user", JSON.stringify(nextUser)],
      ]);

      setProfile((current) => ({ ...current, password: "" }));
      Alert.alert("Success", "Your profile has been updated.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update profile.");
    }

    setSaving(false);
  };

  return (
    <DashboardShell
      eyebrow={settingsMeta.eyebrow}
      title="Profile settings"
      subtitle={`Update the ${settingsMeta.roleLabel} details connected to your account. Password is optional and only changes if you fill it in.`}
      summary={
        loading
          ? "Loading your account details..."
          : `Editing the ${settingsMeta.roleLabel} profile for ${profile.firstName || "your account"}.`
      }
    >
      <View style={styles.surfaceCard}>
        <Text style={styles.cardEyebrow}>Account profile</Text>
        <Text style={styles.cardTitle}>Edit your account details</Text>
        <Text style={styles.cardCopy}>
          These details are used for your login identity, contact profile, and
          account-linked records across the app. Keep them accurate so your
          assigned data stays matched to the right user.
        </Text>

        <View style={styles.formStack}>
          <TextInput
            label="First name"
            mode="outlined"
            value={profile.firstName}
            onChangeText={(value) => updateField("firstName", value)}
            style={styles.input}
            disabled={loading || saving}
          />
          <TextInput
            label="Last name"
            mode="outlined"
            value={profile.lastName}
            onChangeText={(value) => updateField("lastName", value)}
            style={styles.input}
            disabled={loading || saving}
          />
          <TextInput
            label="Address"
            mode="outlined"
            value={profile.address}
            onChangeText={(value) => updateField("address", value)}
            style={styles.input}
            disabled={loading || saving}
          />
          <TextInput
            label="Email"
            mode="outlined"
            value={profile.email}
            keyboardType="email-address"
            onChangeText={(value) => updateField("email", value)}
            style={styles.input}
            disabled={loading || saving}
          />
          <TextInput
            label="Phone number"
            mode="outlined"
            value={profile.contactNumber}
            keyboardType="phone-pad"
            onChangeText={(value) =>
              updateField("contactNumber", value.replace(/[^0-9]/g, "").slice(0, 11))
            }
            style={styles.input}
            disabled={loading || saving}
          />
          <TextInput
            label="Username"
            mode="outlined"
            value={profile.username}
            onChangeText={(value) => updateField("username", value)}
            style={styles.input}
            disabled={loading || saving}
          />
          <TextInput
            label="New password (optional)"
            mode="outlined"
            secureTextEntry
            value={profile.password}
            onChangeText={(value) => updateField("password", value)}
            style={styles.input}
            disabled={loading || saving}
          />
        </View>

        <View style={styles.actionStack}>
          <AgriButton
            title="Save settings"
            subtitle={`Update your ${settingsMeta.roleLabel} profile`}
            icon="content-save-outline"
            variant="primary"
            loading={saving}
            disabled={loading || saving}
            onPress={handleSave}
          />
          <AgriButton
            title="Back to dashboard"
            subtitle={`Return to your ${settingsMeta.dashboardTitle}`}
            icon="arrow-left"
            variant="secondary"
            onPress={() => router.replace(settingsMeta.dashboardRoute)}
          />
          <AgriButton
            title="Logout"
            subtitle="End this session securely"
            icon="logout"
            variant="danger"
            onPress={handleLogout}
          />
        </View>
      </View>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  surfaceCard: {
    borderRadius: 30,
    backgroundColor: agriPalette.surface,
    borderWidth: 1,
    borderColor: agriPalette.border,
    paddingHorizontal: 22,
    paddingVertical: 22,
    marginBottom: 18,
    shadowColor: "#203126",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  cardEyebrow: {
    color: agriPalette.field,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  cardTitle: {
    marginTop: 8,
    color: agriPalette.ink,
    fontSize: 25,
    fontWeight: "900",
  },
  cardCopy: {
    marginTop: 10,
    color: agriPalette.inkSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  formStack: {
    gap: 12,
    marginTop: 18,
  },
  input: {
    backgroundColor: agriPalette.surface,
  },
  actionStack: {
    gap: 12,
    marginTop: 18,
  },
});
