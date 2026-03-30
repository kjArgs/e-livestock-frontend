import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import AgriButton from "../components/AgriButton";
import SeoHead from "../components/SeoHead";
import { agriPalette } from "../constants/agriTheme";
import { SITE_NAME } from "../lib/seo";

const PAGE_TITLE = `404 | ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  "The page you tried to open does not exist. Return to the e-Livestock login page.";

export default function NotFoundScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const useSplitLayout = width >= 980;

  return (
    <>
      <SeoHead
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
        path="/404"
        robots="noindex,nofollow"
      />
      <LinearGradient
        colors={[agriPalette.fieldDeep, agriPalette.field, agriPalette.cream]}
        locations={[0, 0.46, 1]}
        style={styles.root}
      >
        <View style={styles.glowTopLeft} />
        <View style={styles.glowBottomRight} />

        <ScrollView
          contentContainerStyle={[
            styles.content,
            useSplitLayout ? styles.contentSplit : styles.contentStacked,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroBlock}>
            <View style={styles.brandRow}>
              <Image
                source={require("../assets/logo.png")}
                resizeMode="contain"
                style={styles.logo}
              />
              <View style={styles.brandTextWrap}>
                <Text style={styles.eyebrow}>Municipal Agriculture Office</Text>
                <Text style={styles.brandTitle}>
                  e-Livestock services for Sipocot
                </Text>
              </View>
            </View>

            <View style={styles.heroPill}>
              <MaterialCommunityIcons
                name="map-marker-alert-outline"
                size={18}
                color={agriPalette.white}
              />
              <Text style={styles.heroPillText}>Route not found</Text>
            </View>

            <Text style={styles.heroTitle}>404</Text>
            <Text style={styles.heroSubtitle}>
              The page address is invalid or no longer available. Head back to
              the login screen to continue.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>Missing page</Text>
            <Text style={styles.cardTitle}>This link does not exist</Text>
            <Text style={styles.cardSubtitle}>
              Check the URL and return to the main sign-in page to access
              permits, inspections, and records.
            </Text>

            <View style={styles.infoRow}>
              <View style={styles.infoChip}>
                <MaterialCommunityIcons
                  name="web-off"
                  size={16}
                  color={agriPalette.field}
                />
                <Text style={styles.infoChipText}>Invalid URL</Text>
              </View>
              <View style={styles.infoChip}>
                <MaterialCommunityIcons
                  name="login"
                  size={16}
                  color={agriPalette.field}
                />
                <Text style={styles.infoChipText}>Return to login</Text>
              </View>
            </View>

            <AgriButton
              title="Back to login"
              subtitle="Open the e-Livestock sign-in page"
              icon="arrow-left"
              trailingIcon="home-outline"
              onPress={() => router.replace("/")}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
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
    right: -24,
    bottom: -48,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 1120,
    alignSelf: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
    gap: 28,
  },
  contentSplit: {
    flexDirection: "row",
    alignItems: "center",
  },
  contentStacked: {
    flexDirection: "column",
  },
  heroBlock: {
    flex: 1,
    minWidth: 0,
    maxWidth: 620,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 86,
    height: 86,
    marginRight: 16,
  },
  brandTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: "rgba(255,244,214,0.86)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  brandTitle: {
    marginTop: 4,
    color: agriPalette.white,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
  },
  heroPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  heroPillText: {
    marginLeft: 8,
    color: agriPalette.white,
    fontSize: 13,
    fontWeight: "800",
  },
  heroTitle: {
    marginTop: 24,
    color: agriPalette.white,
    fontSize: Platform.OS === "web" ? 72 : 58,
    fontWeight: "900",
    lineHeight: Platform.OS === "web" ? 78 : 64,
  },
  heroSubtitle: {
    marginTop: 10,
    maxWidth: 520,
    color: "rgba(255,255,255,0.82)",
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    borderRadius: 30,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: agriPalette.border,
    backgroundColor: agriPalette.surface,
    ...Platform.select({
      web: {
        boxShadow: "0px 24px 48px rgba(16, 37, 26, 0.18)",
      },
      default: {
        shadowColor: "#10251a",
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.16,
        shadowRadius: 28,
        elevation: 6,
      },
    }),
  },
  cardEyebrow: {
    color: agriPalette.field,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  cardTitle: {
    marginTop: 10,
    color: agriPalette.ink,
    fontSize: 30,
    fontWeight: "900",
  },
  cardSubtitle: {
    marginTop: 10,
    marginBottom: 18,
    color: agriPalette.inkSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(47,107,61,0.08)",
    borderWidth: 1,
    borderColor: "rgba(47,107,61,0.12)",
  },
  infoChipText: {
    marginLeft: 6,
    color: agriPalette.field,
    fontSize: 13,
    fontWeight: "700",
  },
});
