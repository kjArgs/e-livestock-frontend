import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AgriButton from "../../components/AgriButton";
import DashboardShell from "../../components/DashboardShell";
import StatCard from "../../components/StatCard";
import { apiRoutes, apiUrl } from "../../lib/api";
import { agriPalette } from "../../constants/agriTheme";

const API_URL = apiUrl(apiRoutes.owner.schedules);

const statusOptions = ["All", "Pending", "Accepted", "Ongoing", "Done", "Cancelled"];

const statusStyles = {
  Pending: {
    icon: "clock-outline",
    backgroundColor: "#FFF4D6",
    textColor: "#8A6510",
  },
  Accepted: {
    icon: "calendar-check-outline",
    backgroundColor: "#E4F1EB",
    textColor: agriPalette.field,
  },
  Ongoing: {
    icon: "progress-clock",
    backgroundColor: "#EAF1F7",
    textColor: "#3A6780",
  },
  Done: {
    icon: "check-circle-outline",
    backgroundColor: "#EEF7E9",
    textColor: agriPalette.fieldDeep,
  },
  Cancelled: {
    icon: "close-circle-outline",
    backgroundColor: "#F7E1D5",
    textColor: agriPalette.redClay,
  },
};

function normalizeFullName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function formatScheduleDate(dateValue) {
  if (!dateValue) {
    return "Date not set";
  }

  const parsed = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  return parsed.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeValue(timeValue) {
  if (!timeValue) {
    return "Time pending";
  }

  const parsed = new Date(`1970-01-01T${timeValue}`);

  if (Number.isNaN(parsed.getTime())) {
    return timeValue;
  }

  return parsed.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function isUpcomingStatus(status) {
  return ["Pending", "Accepted", "Ongoing"].includes(status);
}

async function requestSchedules(ownerAccountId) {
  const [firstName, lastName] = await Promise.all([
    AsyncStorage.getItem("first_name"),
    AsyncStorage.getItem("last_name"),
  ]);

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      account_id: ownerAccountId,
      first_name: firstName || "",
      last_name: lastName || "",
    }),
  });

  return response.json();
}

export default function ScheduleScreen() {
  const router = useRouter();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [accountId, setAccountId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [storedFirst, storedLast, storedAccountId] = await Promise.all([
          AsyncStorage.getItem("first_name"),
          AsyncStorage.getItem("last_name"),
          AsyncStorage.getItem("account_id"),
        ]);

        if (storedFirst) {
          setFirstName(storedFirst);
        }
        if (storedLast) {
          setLastName(storedLast);
        }

        if (storedAccountId) {
          setAccountId(storedAccountId);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    if (accountId) {
      const loadSchedules = async () => {
        setLoading(true);

        try {
          const data = await requestSchedules(accountId);
          const [storedFirstName, storedLastName] = await Promise.all([
            AsyncStorage.getItem("first_name"),
            AsyncStorage.getItem("last_name"),
          ]);

          if (data.status === "success") {
            const fullName = normalizeFullName(
              `${storedFirstName || ""} ${storedLastName || ""}`
            );
            const nextSchedules = (data.schedules || []).filter(
              (schedule) =>
                !fullName ||
                normalizeFullName(schedule.owner_name) === fullName
            );
            setSchedules(nextSchedules);
          } else {
            setSchedules([]);
          }
        } catch (err) {
          console.error(err);
          Alert.alert("Error", "Failed to fetch schedules.");
        }

        setLoading(false);
      };

      loadSchedules();
    }
  }, [accountId]);

  const fetchSchedules = async (ownerAccountId = accountId) => {
    if (!ownerAccountId) {
      return;
    }

    setLoading(true);

    try {
      const data = await requestSchedules(ownerAccountId);

      const [storedFirst, storedLast] = await Promise.all([
        AsyncStorage.getItem("first_name"),
        AsyncStorage.getItem("last_name"),
      ]);
      const fullName = normalizeFullName(
        `${storedFirst || ""} ${storedLast || ""}`
      );

      if (data.status === "success") {
        const nextSchedules = (data.schedules || []).filter(
          (schedule) =>
            !fullName || normalizeFullName(schedule.owner_name) === fullName
        );
        setSchedules(nextSchedules);
      } else {
        setSchedules([]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch schedules.");
    }

    setLoading(false);
  };

  const cancelSchedule = async (scheduleId) => {
    Alert.alert(
      "Cancel schedule",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Cancel schedule",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "cancel",
                  schedule_id: scheduleId,
                }),
              });

              const data = await res.json();

              if (data.status === "success") {
                setSchedules((prev) =>
                  prev.map((schedule) =>
                    schedule.schedule_id === scheduleId
                      ? { ...schedule, status: "Cancelled" }
                      : schedule
                  )
                );
                Alert.alert("Success", "Schedule cancelled successfully.");
              } else {
                Alert.alert(
                  "Error",
                  data.message || "Failed to cancel schedule."
                );
              }
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Something went wrong while cancelling.");
            }

            setLoading(false);
          },
        },
      ]
    );
  };

  const totalSchedules = schedules.length;
  const upcomingSchedules = schedules.filter((item) =>
    isUpcomingStatus(item.status)
  ).length;
  const doneSchedules = schedules.filter((item) => item.status === "Done").length;
  const cancelledSchedules = schedules.filter(
    (item) => item.status === "Cancelled"
  ).length;
  const filteredSchedules =
    statusFilter === "All"
      ? schedules
      : schedules.filter((item) => item.status === statusFilter);

  return (
    <DashboardShell
      eyebrow="Owner schedules"
      title={
        firstName
          ? `${firstName}'s schedule queue`
          : lastName
          ? `${lastName}'s schedule queue`
          : "My schedules"
      }
      subtitle="Review your livestock appointments in a cleaner schedule board, scan the status quickly, and handle cancellations without digging through a plain list."
      summary={
        loading
          ? "Refreshing your appointment queue..."
          : `${upcomingSchedules} upcoming schedules and ${cancelledSchedules} cancelled records in your account.`
      }
    >
      <View style={styles.statsGrid}>
        <StatCard
          label="All schedules"
          value={totalSchedules}
          caption="Every appointment linked to your livestock forms."
          icon="calendar-month-outline"
          accent="meadow"
          loading={loading}
        />
        <StatCard
          label="Upcoming"
          value={upcomingSchedules}
          caption="Pending, accepted, and ongoing visits still ahead."
          icon="calendar-clock-outline"
          accent="wheat"
          loading={loading}
        />
        <StatCard
          label="Completed"
          value={doneSchedules}
          caption="Visits that already reached the done stage."
          icon="check-circle-outline"
          accent="sky"
          loading={loading}
        />
        <StatCard
          label="Cancelled"
          value={cancelledSchedules}
          caption="Appointments you or the office have cancelled."
          icon="close-circle-outline"
          accent="clay"
          loading={loading}
        />
      </View>

      <View style={styles.surfaceCard}>
        <Text style={styles.cardEyebrow}>Schedule board</Text>
        <Text style={styles.cardTitle}>Filter your appointment flow</Text>
        <Text style={styles.cardCopy}>
          Use the status chips to focus on the exact stage you need, then open
          your stockyard or refresh the board when new updates arrive.
        </Text>

        <View style={styles.filterRow}>
          {statusOptions.map((option) => {
            const active = option === statusFilter;

            return (
              <Pressable
                key={option}
                onPress={() => setStatusFilter(option)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.actionRow}>
          <AgriButton
            title="Refresh schedules"
            subtitle="Pull the latest appointment updates"
            icon="refresh"
            variant="secondary"
            compact
            trailingIcon={false}
            onPress={() => fetchSchedules()}
            style={styles.actionButton}
          />
          <AgriButton
            title="Open stockyard"
            subtitle="Return to your livestock permits"
            icon="barn"
            variant="sky"
            compact
            onPress={() => router.push("/stockyard")}
            style={styles.actionButton}
          />
        </View>
      </View>

      <View style={styles.surfaceCard}>
        <Text style={styles.cardEyebrow}>Appointments</Text>
        <Text style={styles.cardTitle}>Your schedule list</Text>
        <Text style={styles.cardCopy}>
          Each card shows the visit date, time block, location, ear tag, and
          live status for the appointment tied to your forms.
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={agriPalette.field}
            style={styles.loadingState}
          />
        ) : filteredSchedules.length ? (
          <View style={styles.scheduleStack}>
            {filteredSchedules.map((item) => {
              const colors =
                statusStyles[item.status] || statusStyles.Pending;
              const canCancel =
                item.status !== "Cancelled" && item.status !== "Done";

              return (
                <View key={item.schedule_id} style={styles.scheduleCard}>
                  <View style={styles.scheduleHeader}>
                    <View style={styles.scheduleTitleWrap}>
                      <Text style={styles.ownerName}>{item.owner_name}</Text>
                      <Text style={styles.scheduleMeta}>
                        Form #{item.form_id} - Eartag {item.eartag_number}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: colors.backgroundColor },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={colors.icon}
                        size={15}
                        color={colors.textColor}
                      />
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: colors.textColor },
                        ]}
                      >
                        {item.status || "Pending"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoGrid}>
                    <View style={styles.infoBlock}>
                      <Text style={styles.infoLabel}>Visit date</Text>
                      <Text style={styles.infoValue}>
                        {formatScheduleDate(item.date)}
                      </Text>
                    </View>
                    <View style={styles.infoBlock}>
                      <Text style={styles.infoLabel}>Time window</Text>
                      <Text style={styles.infoValue}>
                        {`${formatTimeValue(item.start_time)} - ${formatTimeValue(
                          item.end_time
                        )}`}
                      </Text>
                    </View>
                    <View style={[styles.infoBlock, styles.infoBlockFull]}>
                      <Text style={styles.infoLabel}>Location</Text>
                      <Text style={styles.infoValue}>
                        {item.location || "Location pending"}
                      </Text>
                    </View>
                  </View>

                  {canCancel ? (
                    <AgriButton
                      title="Cancel schedule"
                      subtitle="Release this appointment slot"
                      icon="close-circle-outline"
                      variant="danger"
                      compact
                      trailingIcon={false}
                      onPress={() => cancelSchedule(item.schedule_id)}
                      style={styles.cancelButton}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="calendar-blank-outline"
              size={34}
              color={agriPalette.field}
            />
            <Text style={styles.emptyTitle}>No schedules in this filter</Text>
            <Text style={styles.emptyCopy}>
              Try another status chip or refresh the board if you recently
              booked an appointment.
            </Text>
          </View>
        )}
      </View>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 18,
  },
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
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: agriPalette.mist,
  },
  filterChipActive: {
    backgroundColor: agriPalette.field,
  },
  filterChipText: {
    color: agriPalette.fieldDeep,
    fontSize: 13,
    fontWeight: "800",
  },
  filterChipTextActive: {
    color: agriPalette.white,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 18,
  },
  actionButton: {
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 220,
  },
  loadingState: {
    marginVertical: 40,
  },
  scheduleStack: {
    gap: 12,
    marginTop: 18,
  },
  scheduleCard: {
    borderRadius: 24,
    backgroundColor: agriPalette.cream,
    borderWidth: 1,
    borderColor: agriPalette.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  scheduleTitleWrap: {
    flex: 1,
  },
  ownerName: {
    color: agriPalette.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  scheduleMeta: {
    marginTop: 4,
    color: agriPalette.inkSoft,
    fontSize: 13,
    lineHeight: 19,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  infoBlock: {
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 130,
    borderRadius: 18,
    backgroundColor: agriPalette.surface,
    borderWidth: 1,
    borderColor: agriPalette.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  infoBlockFull: {
    flexBasis: "100%",
  },
  infoLabel: {
    color: agriPalette.inkSoft,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  infoValue: {
    marginTop: 8,
    color: agriPalette.ink,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
  },
  cancelButton: {
    marginTop: 14,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderRadius: 24,
    backgroundColor: agriPalette.cream,
    borderWidth: 1,
    borderColor: agriPalette.border,
  },
  emptyTitle: {
    marginTop: 12,
    color: agriPalette.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  emptyCopy: {
    marginTop: 8,
    textAlign: "center",
    color: agriPalette.inkSoft,
    fontSize: 14,
    lineHeight: 21,
  },
});
