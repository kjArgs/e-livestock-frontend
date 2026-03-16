import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { agriPalette } from "../constants/agriTheme";

export default function AuthRecoveryShell({
  eyebrow,
  title,
  subtitle,
  step,
  totalSteps = 3,
  children,
}) {
  const { width } = useWindowDimensions();
  const isWide = width >= 920;
  const isCompact = width < 560;

  return (
    <LinearGradient
      colors={[agriPalette.fieldDeep, agriPalette.field, agriPalette.cream]}
      locations={[0, 0.44, 1]}
      style={styles.root}
    >
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={[
              styles.page,
              {
                flexDirection: isWide ? "row" : "column",
                alignItems: isWide ? "center" : "stretch",
                paddingHorizontal: isCompact ? 16 : 20,
                paddingVertical: isCompact ? 18 : 30,
              },
            ]}
          >
            <View style={[styles.heroColumn, isWide && styles.heroColumnWide]}>
              <View style={styles.brandPill}>
                <MaterialCommunityIcons
                  name="shield-account-outline"
                  size={18}
                  color={agriPalette.white}
                />
                <Text style={styles.brandPillText}>Secure account recovery</Text>
              </View>

              <Text style={styles.eyebrow}>{eyebrow}</Text>
              <Text style={[styles.title, isCompact && styles.titleCompact]}>
                {title}
              </Text>
              <Text
                style={[styles.subtitle, isCompact && styles.subtitleCompact]}
              >
                {subtitle}
              </Text>

              <View style={styles.stepCard}>
                <Text style={styles.stepLabel}>Recovery step</Text>
                <Text style={styles.stepValue}>
                  {step} of {totalSteps}
                </Text>
                <Text style={styles.stepCopy}>
                  Keep the same email from start to finish so the verification
                  and reset flow stays matched to your account.
                </Text>
              </View>

              <View style={styles.infoChipRow}>
                <InfoChip icon="email-fast-outline" label="Email verified flow" />
                <InfoChip icon="lock-reset" label="Password-safe reset" />
                <InfoChip icon="sprout" label="e-Livestock access" />
              </View>
            </View>

            <View style={[styles.panel, isCompact && styles.panelCompact]}>
              {children}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function InfoChip({ icon, label }) {
  return (
    <View style={styles.infoChip}>
      <MaterialCommunityIcons
        name={icon}
        size={15}
        color={agriPalette.white}
      />
      <Text style={styles.infoChipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: "relative",
  },
  glowTopLeft: {
    position: "absolute",
    top: -90,
    left: -20,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(240,212,142,0.18)",
  },
  glowBottomRight: {
    position: "absolute",
    bottom: -60,
    right: -20,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  page: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
    justifyContent: "center",
  },
  heroColumn: {
    width: "100%",
    marginBottom: 20,
  },
  heroColumnWide: {
    flex: 1,
    paddingRight: 28,
    marginBottom: 0,
  },
  brandPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  brandPillText: {
    marginLeft: 8,
    color: agriPalette.white,
    fontSize: 13,
    fontWeight: "800",
  },
  eyebrow: {
    marginTop: 20,
    color: "rgba(255,244,214,0.86)",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  title: {
    marginTop: 10,
    color: agriPalette.white,
    fontSize: Platform.OS === "web" ? 40 : 32,
    fontWeight: "900",
    lineHeight: Platform.OS === "web" ? 46 : 38,
    maxWidth: 620,
  },
  titleCompact: {
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    marginTop: 14,
    color: "rgba(255,255,255,0.82)",
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 560,
  },
  subtitleCompact: {
    fontSize: 15,
    lineHeight: 22,
  },
  stepCard: {
    marginTop: 24,
    maxWidth: 440,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  stepLabel: {
    color: "rgba(255,244,214,0.82)",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  stepValue: {
    marginTop: 10,
    color: agriPalette.white,
    fontSize: 24,
    fontWeight: "900",
  },
  stepCopy: {
    marginTop: 8,
    color: "rgba(255,255,255,0.84)",
    fontSize: 14,
    lineHeight: 21,
  },
  infoChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 22,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  infoChipText: {
    marginLeft: 7,
    color: agriPalette.white,
    fontSize: 13,
    fontWeight: "700",
  },
  panel: {
    width: "100%",
    maxWidth: Platform.OS === "web" ? 460 : 560,
    alignSelf: "center",
    borderRadius: 30,
    paddingHorizontal: 22,
    paddingVertical: 24,
    backgroundColor: agriPalette.surface,
    borderWidth: 1,
    borderColor: agriPalette.border,
    shadowColor: "#10251a",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 6,
  },
  panelCompact: {
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
});
