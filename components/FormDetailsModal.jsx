import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";

export default function FormDetailsModal({ visible, onClose, form }) {
  if (!form) return null;

  const getDaysRemaining = (expirationDate) => {
    if (!expirationDate) return "";
    const today = new Date();
    const exp = new Date(expirationDate);
    const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    return diff < 0 ? "EXPIRED" : `${diff} DAY(S) REMAINING`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView
            contentContainerStyle={{ padding: 15, paddingBottom: 80 }}
          >
            {form.qr_code && (
              <View style={styles.qrCard}>
                <QRCode
                  value={form.qr_code}
                  size={120}
                  backgroundColor="#fff"
                />
              </View>
            )}

            <View style={styles.fullWidthDetails}>
              {form.qr_code && (
                <View style={styles.detailCard}>
                  <Text style={styles.detailKey}>QR CODE:</Text>
                  <Text style={styles.detailValue}>{form.qr_code}</Text>
                </View>
              )}

              {form.qr_expiration && (
                <View style={styles.detailCard}>
                  <Text style={styles.detailKey}>QR EXPIRATION:</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      getDaysRemaining(form.qr_expiration) === "EXPIRED"
                        ? { color: "red" }
                        : { color: "#2E7D32" },
                    ]}
                  >
                    {getDaysRemaining(form.qr_expiration)}
                  </Text>
                </View>
              )}

              {Object.keys(form).map((key) => {
                if (
                  key === "qr_code" ||
                  key === "qr_expiration" ||
                  key === "severity_rating" ||
                  key === "suggestion"
                )
                  return null;

                return (
                  <View key={key} style={styles.detailCard}>
                    <Text style={styles.detailKey}>
                      {key.replace(/_/g, " ").toUpperCase()}:
                    </Text>
                    <Text style={styles.detailValue}>{form[key]}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.closeButtonContainer}>
            <Button mode="contained" buttonColor="#2E7D32" onPress={onClose}>
              Close
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    height: "80%",
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    overflow: "hidden",
  },
  qrCard: {
    padding: 15,
    backgroundColor: "#C8E6C9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A5D6A7",
    elevation: 3,
    alignSelf: "center",
    marginBottom: 15,
  },
  fullWidthDetails: { marginTop: 10 },
  detailCard: {
    backgroundColor: "#C8E6C9",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A5D6A7",
    marginBottom: 8,
  },
  detailKey: { fontWeight: "bold", marginBottom: 3, color: "#2E7D32" },
  detailValue: { fontSize: 16, color: "#1B5E20" },
  closeButtonContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#A5D6A7",
    backgroundColor: "#C8E6C9",
  },
});
