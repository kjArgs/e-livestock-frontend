import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { agriPalette } from "../constants/agriTheme";

const DISMISS_KEY = "elivestock-pwa-install-dismissed";

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator?.standalone === true
  );
}

function readDismissedState() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1";
  } catch (_error) {
    return false;
  }
}

function persistDismissedState(nextValue) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (nextValue) {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } else {
      window.localStorage.removeItem(DISMISS_KEY);
    }
  } catch (_error) {
    // Ignore storage restrictions and keep the prompt session-only.
  }
}

function buildBrowserFlags() {
  if (typeof navigator === "undefined") {
    return {
      isMobileBrowser: false,
      isIosSafari: false,
    };
  }

  const userAgent = navigator.userAgent || "";
  const isMobileBrowser = /android|iphone|ipad|ipod/i.test(userAgent);
  const isIosDevice = /iphone|ipad|ipod/i.test(userAgent);
  const isSafariEngine = /safari/i.test(userAgent);
  const isOtherIosBrowser = /crios|fxios|edgios|opios/i.test(userAgent);

  return {
    isMobileBrowser,
    isIosSafari: isIosDevice && isSafariEngine && !isOtherIosBrowser,
  };
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installMode, setInstallMode] = useState("hidden");

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      return undefined;
    }

    const { isMobileBrowser, isIosSafari } = buildBrowserFlags();
    const dismissed = readDismissedState();

    if (!isMobileBrowser || isStandaloneMode() || dismissed) {
      return undefined;
    }

    if (isIosSafari) {
      setInstallMode("ios");
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();

      if (isStandaloneMode() || readDismissedState()) {
        return;
      }

      setDeferredPrompt(event);
      setInstallMode("prompt");
    };

    const handleAppInstalled = () => {
      persistDismissedState(false);
      setDeferredPrompt(null);
      setInstallMode("hidden");
    };

    const handleDisplayModeChange = (nextEvent) => {
      if (nextEvent.matches) {
        setDeferredPrompt(null);
        setInstallMode("hidden");
      }
    };

    const displayModeQuery = window.matchMedia?.("(display-mode: standalone)");

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    displayModeQuery?.addEventListener?.("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      displayModeQuery?.removeEventListener?.("change", handleDisplayModeChange);
    };
  }, []);

  if (Platform.OS !== "web" || installMode === "hidden") {
    return null;
  }

  const dismissPrompt = () => {
    persistDismissedState(true);
    setDeferredPrompt(null);
    setInstallMode("hidden");
  };

  const handleInstallPress = async () => {
    if (!deferredPrompt) {
      dismissPrompt();
      return;
    }

    deferredPrompt.prompt();

    try {
      await deferredPrompt.userChoice;
    } catch (_error) {
      // Browsers may reject if the prompt was interrupted.
    }

    setDeferredPrompt(null);
    setInstallMode("hidden");
  };

  const isIosInstructions = installMode === "ios";

  return (
    <View pointerEvents="box-none" style={styles.portal}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons
              name={isIosInstructions ? "cellphone-arrow-down" : "download-circle-outline"}
              size={22}
              color={agriPalette.fieldDeep}
            />
          </View>

          <View style={styles.copyWrap}>
            <Text style={styles.eyebrow}>Install app</Text>
            <Text style={styles.title}>Keep e-Livestock on your home screen</Text>
            <Text style={styles.copy}>
              {isIosInstructions
                ? "In Safari, tap Share and choose Add to Home Screen for faster access."
                : "Install the mobile web app for a full-screen shortcut and faster repeat visits."}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          {!isIosInstructions ? (
            <Pressable onPress={handleInstallPress} style={styles.primaryAction}>
              <Text style={styles.primaryActionText}>Install now</Text>
            </Pressable>
          ) : null}

          <Pressable onPress={dismissPrompt} style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>
              {isIosInstructions ? "Hide tip" : "Maybe later"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  portal: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 18,
    zIndex: 80,
  },
  card: {
    maxWidth: 460,
    alignSelf: "center",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: agriPalette.border,
    backgroundColor: agriPalette.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: "#203126",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 7,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7F0E9",
    borderWidth: 1,
    borderColor: agriPalette.border,
    flexShrink: 0,
  },
  copyWrap: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: agriPalette.field,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  title: {
    marginTop: 4,
    color: agriPalette.ink,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
  },
  copy: {
    marginTop: 8,
    color: agriPalette.inkSoft,
    fontSize: 13,
    lineHeight: 19,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  primaryAction: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: agriPalette.fieldDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionText: {
    color: agriPalette.white,
    fontSize: 13,
    fontWeight: "800",
  },
  secondaryAction: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: agriPalette.cream,
    borderWidth: 1,
    borderColor: agriPalette.border,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionText: {
    color: agriPalette.fieldDeep,
    fontSize: 13,
    fontWeight: "800",
  },
});
