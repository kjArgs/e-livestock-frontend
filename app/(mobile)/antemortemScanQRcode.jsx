import { CameraView, useCameraPermissions } from "expo-camera";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { apiRoutes, apiUrl } from "../../lib/api";

const VERIFY_URL = apiUrl(apiRoutes.antemortem.verifyQr);

export default function AntemortemScanQRcode() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const incomingFormId = params?.form_id ?? null;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [lastScannedData, setLastScannedData] = useState(null);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.infoText}>Checking camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.infoText}>
          Camera access is required to scan QR codes.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={requestPermission}
        >
          <Text style={styles.primaryButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }) => {
    if (scanned || verifying) return;

    setScanned(true);
    setVerifying(true);
    setLastScannedData(data);

    try {
      const res = await fetch(VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qr_data: data,
          form_id: incomingFormId,
        }),
      });

      const json = await res.json();

      if (json.status === "success") {
        let daysRemaining = null;
        let validityColor = "#2E7D32";
        let validityText = "Valid QR";

        if (json.details?.qr_expiration) {
          const expirationDate = new Date(json.details.qr_expiration);
          const today = new Date();
          const diffTime = expirationDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays <= 0) {
            validityText = "Expired";
            validityColor = "#C62828";
            daysRemaining = 0;
          } else if (diffDays === 1) {
            validityText = "Expires in 1 day";
            validityColor = "#EF6C00";
            daysRemaining = 1;
          } else {
            validityText = `Expires in ${diffDays} days`;
            daysRemaining = diffDays;
          }
        }

        setResult({
          ok: !!json.valid,
          message:
            json.message || (json.valid ? "QR is valid" : "QR is not valid"),
          form_id: json.form_id ?? null,
          details: json.details ?? null,
          daysRemaining,
          validityText,
          validityColor,
        });
      } else {
        setResult({
          ok: false,
          message: json.message || "Server returned error",
        });
      }
    } catch (err) {
      setResult({
        ok: false,
        message: "Network error while verifying QR.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const onRescan = () => {
    setScanned(false);
    setResult(null);
    setLastScannedData(null);
  };

  const onDone = () => router.replace("/antemortemSchedules");

  return (
    <View style={styles.container}>
      {!scanned && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        >
          <View style={styles.scanOverlay}>
            <Text style={styles.scanHint}>Point camera at QR code</Text>
          </View>
        </CameraView>
      )}

      {scanned && verifying && (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.infoText}>Verifying QR...</Text>
        </View>
      )}

      {scanned && !verifying && result && (
        <View style={styles.modalOverlay}>
          <BlurView
            intensity={36}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
            style={styles.blurBackdrop}
          />
          <View style={styles.modalTint} />
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalCard}>
              {lastScannedData && (
                <View style={styles.qrWrapper}>
                  <QRCode value={lastScannedData} size={140} />
                </View>
              )}

              <Text
                style={[styles.resultTitle, { color: result.validityColor }]}
              >
                {result.ok ? "QR Verified ✅" : "QR Not Valid ❌"}
              </Text>

              <Text style={styles.resultMessage}>{result.message}</Text>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={onRescan}
                >
                  <Text style={styles.secondaryButtonText}>Re-scan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    !result.ok && { backgroundColor: "#9E9E9E" },
                  ]}
                  onPress={onDone}
                >
                  <Text style={styles.primaryButtonText}>
                    {result.ok ? "Continue" : "Back"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8F5E9" },
  scanOverlay: { position: "absolute", bottom: 80, alignSelf: "center" },
  scanHint: { color: "#2E7D32", fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  infoText: { marginTop: 10, fontSize: 16 },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  blurBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.32)",
  },

  modalScroll: { flexGrow: 1, justifyContent: "center" },

  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },

  qrWrapper: { alignItems: "center", marginBottom: 16 },

  resultTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },

  resultMessage: { textAlign: "center", marginBottom: 12 },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },

  primaryButton: {
    flex: 1,
    marginLeft: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#2E7D32",
    alignItems: "center",
  },

  primaryButtonText: { color: "#fff", fontWeight: "bold" },

  secondaryButton: {
    flex: 1,
    marginRight: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#C8E6C9",
    alignItems: "center",
  },

  secondaryButtonText: { color: "#2E7D32", fontWeight: "bold" },
});
