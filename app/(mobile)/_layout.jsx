import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Slot, usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import LogoutConfirmModal from "../../components/LogoutConfirmModal";
import { agriPalette, agriPaperTheme } from "../../constants/agriTheme";
import logoutSession from "../../lib/auth/logoutSession";
import { syncAccountPushToken } from "../../lib/notifications/deviceNotifications";

const HIDE_FOOTER_SCREENS = new Set([
  "/register",
  "/login",
  "/sendOtp",
  "/verifyOtp",
  "/resetPassword",
  "/appointment",
  "/createLivestockForm",
  "/antemortemScanQRcode",
]);

const FOOTER_ITEMS_BY_ROLE = {
  user: [
    {
      key: "owner-dashboard",
      label: "Dashboard",
      to: "/ownerDashboard",
      icon: "view-dashboard-outline",
    },
    {
      key: "notifications",
      label: "Alerts",
      to: "/notifications",
      icon: "bell-outline",
    },
    {
      key: "stockyard",
      label: "Stockyard",
      to: "/stockyard",
      icon: "barn",
    },
    {
      key: "schedules",
      label: "Schedules",
      to: "/checkSchedule",
      icon: "calendar-month-outline",
    },
    {
      key: "settings",
      label: "Settings",
      to: "/settings",
      icon: "cog-outline",
    },
  ],
  livestockInspector: [
    {
      key: "inspector-dashboard",
      label: "Dashboard",
      to: "/livestockInspectorDashboard",
      icon: "view-dashboard-outline",
    },
    {
      key: "notifications",
      label: "Alerts",
      to: "/notifications",
      icon: "bell-outline",
    },
    {
      key: "view-forms",
      label: "Forms",
      to: "/viewForms",
      icon: "file-document-multiple-outline",
    },
    {
      key: "settings",
      label: "Settings",
      to: "/settings",
      icon: "cog-outline",
    },
    {
      key: "logout",
      label: "Logout",
      icon: "logout",
      danger: true,
    },
  ],
  AntemortemInspector: [
    {
      key: "antemortem-dashboard",
      label: "Dashboard",
      to: "/antemortemDashboard",
      icon: "view-dashboard-outline",
    },
    {
      key: "notifications",
      label: "Alerts",
      to: "/notifications",
      icon: "bell-outline",
    },
    {
      key: "antemortem-schedules",
      label: "Schedules",
      to: "/antemortemSchedules",
      icon: "calendar-month-outline",
    },
    {
      key: "settings",
      label: "Settings",
      to: "/settings",
      icon: "cog-outline",
    },
    {
      key: "logout",
      label: "Logout",
      icon: "logout",
      danger: true,
    },
  ],
};

export default function ScreensLayout() {
  const path = usePathname();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWideFooter = width >= 960;
  const [role, setRole] = useState("");
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pushSyncAttemptedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const loadRole = async () => {
      try {
        const [storedRole, storedUser, storedAccountId] = await Promise.all([
          AsyncStorage.getItem("role"),
          AsyncStorage.getItem("user"),
          AsyncStorage.getItem("account_id"),
        ]);

        const parsedUser = storedUser ? JSON.parse(storedUser) : {};
        const nextRole = storedRole || parsedUser.account_type || "";
        const parsedAccountId = parseInt(
          storedAccountId || parsedUser.account_id || 0,
          10,
        );

        if (mounted) {
          setRole(nextRole);
        }

        if (!pushSyncAttemptedRef.current && parsedAccountId > 0) {
          pushSyncAttemptedRef.current = true;

          try {
            await syncAccountPushToken(parsedAccountId);
          } catch (error) {
            console.error("Push registration error:", error);
          }
        }
      } catch (error) {
        console.error("Unable to load footer role:", error);
      }
    };

    loadRole();

    return () => {
      mounted = false;
    };
  }, [path]);

  const footerItems = FOOTER_ITEMS_BY_ROLE[role] || [];
  const shouldHideFooter = HIDE_FOOTER_SCREENS.has(path) || !footerItems.length;
  const footerInset = isWideFooter ? 122 : 92;

  const handleLogout = () => {
    if (loggingOut) {
      return;
    }

    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);
      await logoutSession();
      setLogoutModalVisible(false);
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert(
        "Logout failed",
        "We could not finish signing you out. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <PaperProvider theme={agriPaperTheme}>
      <View style={styles.shell}>
        <View
          style={[
            styles.contentArea,
            !shouldHideFooter && { paddingBottom: footerInset },
          ]}
        >
          <Slot />
        </View>
        <LogoutConfirmModal
          visible={logoutModalVisible}
          loading={loggingOut}
          onCancel={() => setLogoutModalVisible(false)}
          onConfirm={confirmLogout}
        />

        {!shouldHideFooter && (
          <View style={[styles.footerFrame, isWideFooter && styles.footerFrameWide]}>
            <View style={[styles.footer, isWideFooter && styles.footerWide]}>
              {footerItems.map((item) => (
                <FooterButton
                  key={item.key}
                  label={item.label}
                  to={item.to}
                  path={path}
                  icon={item.icon}
                  onPress={item.danger ? handleLogout : undefined}
                  danger={item.danger}
                  isWideFooter={isWideFooter}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </PaperProvider>
  );
}

function FooterButton({
  label,
  to,
  path,
  icon,
  onPress,
  danger = false,
  isWideFooter = false,
}) {
  const router = useRouter();
  const isActive = Boolean(to && (path === to || path.startsWith(`${to}/`)));

  return (
    <Pressable
      onPress={onPress || (() => router.replace(to))}
      style={({ pressed }) => [
        styles.footerButton,
        isWideFooter && styles.footerButtonWide,
        isActive && styles.footerButtonActive,
        danger && styles.footerButtonDanger,
        pressed && styles.footerButtonPressed,
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={isWideFooter ? 22 : 20}
        color={
          danger
            ? agriPalette.redClay
            : isActive
            ? agriPalette.white
            : agriPalette.fieldDeep
        }
      />
      <Text
        style={[
          styles.footerLabel,
          isWideFooter && styles.footerLabelWide,
          isActive && styles.footerLabelActive,
          danger && styles.footerLabelDanger,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    width: "100%",
    backgroundColor: agriPalette.cream,
    overflow: "hidden",
  },
  contentArea: {
    flex: 1,
    width: "100%",
  },
  footerFrame: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  footerFrameWide: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  footer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderColor: "#E5E6DB",
    backgroundColor: agriPalette.surface,
  },
  footerWide: {
    maxWidth: 1120,
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    borderWidth: 1,
    borderTopWidth: 1,
    borderRadius: 28,
    borderColor: "rgba(208, 216, 193, 0.92)",
    backgroundColor: "rgba(255, 253, 247, 0.97)",
    ...Platform.select({
      web: {
        boxShadow: "0px 20px 36px rgba(16, 37, 26, 0.14)",
      },
      default: {
        shadowColor: "#10251a",
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
      },
    }),
  },
  footerButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: agriPalette.border,
    backgroundColor: "#FAF7EE",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  footerButtonWide: {
    minHeight: 64,
    borderRadius: 22,
    paddingHorizontal: 12,
  },
  footerButtonActive: {
    backgroundColor: agriPalette.field,
    borderColor: agriPalette.field,
  },
  footerButtonDanger: {
    backgroundColor: "#FFF5F1",
    borderColor: "#F2C9BA",
  },
  footerButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  footerLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "800",
    color: agriPalette.fieldDeep,
    textAlign: "center",
  },
  footerLabelWide: {
    fontSize: 11,
  },
  footerLabelActive: {
    color: agriPalette.white,
  },
  footerLabelDanger: {
    color: agriPalette.redClay,
  },
});
