import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AgriButton from "../../components/AgriButton";
import DashboardShell from "../../components/DashboardShell";
import { agriPalette } from "../../constants/agriTheme";
import { apiRoutes, apiUrl, parseJsonResponse } from "../../lib/api";

const LIST_URL = apiUrl(apiRoutes.notifications.list);
const MARK_READ_URL = apiUrl(apiRoutes.notifications.markRead);
const CATEGORY_COUNTS_TEMPLATE = {
  all: 0,
  unread: 0,
  renewals: 0,
  schedules: 0,
  forms: 0,
  system: 0,
};
const FILTER_ORDER = ["all", "unread", "renewals", "schedules", "forms", "system"];
const FILTER_LABELS = {
  all: "All",
  unread: "Unread",
  renewals: "Renewals",
  schedules: "Schedules",
  forms: "Forms",
  system: "System",
};
const CATEGORY_TONES = {
  renewals: {
    backgroundColor: "#FFF4D6",
    borderColor: "#F2DC9F",
    color: "#7A5A12",
  },
  schedules: {
    backgroundColor: "#E4F1EB",
    borderColor: "#C7DDD1",
    color: agriPalette.fieldDeep,
  },
  forms: {
    backgroundColor: "#EEF7E9",
    borderColor: "#D8EBC9",
    color: agriPalette.field,
  },
  system: {
    backgroundColor: "#F5EEE1",
    borderColor: "#DFCDB4",
    color: agriPalette.inkSoft,
  },
};

function normalizeNotificationType(type) {
  return String(type || "general")
    .trim()
    .toLowerCase();
}

function getNotificationCategory(type) {
  const normalizedType = normalizeNotificationType(type);

  if (["renewal_request", "renewal_completed", "renewal_cancelled"].includes(normalizedType)) {
    return "renewals";
  }

  if (["schedule_created", "schedule_status", "schedule_cancelled"].includes(normalizedType)) {
    return "schedules";
  }

  if (normalizedType === "form_batch") {
    return "forms";
  }

  return "system";
}

function getNotificationCategoryLabel(category) {
  return FILTER_LABELS[category] || "System";
}

function getNotificationTypeLabel(type) {
  const normalizedType = normalizeNotificationType(type);
  const labels = {
    form_batch: "Form batch",
    schedule_created: "New schedule",
    schedule_status: "Schedule update",
    schedule_cancelled: "Schedule cancelled",
    renewal_request: "Renewal request",
    renewal_completed: "Renewal completed",
    renewal_cancelled: "Renewal cancelled",
    general: "General",
  };

  return labels[normalizedType] || "General";
}

function hydrateNotifications(items) {
  return (Array.isArray(items) ? items : []).map((item) => {
    const type = normalizeNotificationType(item?.type);
    const category = item?.category || getNotificationCategory(type);

    return {
      ...item,
      type,
      category,
      category_label: item?.category_label || getNotificationCategoryLabel(category),
      type_label: item?.type_label || getNotificationTypeLabel(type),
      is_read: Number(item?.is_read) || 0,
    };
  });
}

function deriveCategoryCounts(items) {
  const counts = { ...CATEGORY_COUNTS_TEMPLATE };

  for (const item of items) {
    counts.all += 1;

    if (counts[item.category] !== undefined) {
      counts[item.category] += 1;
    }

    if (!item.is_read) {
      counts.unread += 1;
    }
  }

  return counts;
}

function mergeCategoryCounts(rawCounts, notifications) {
  const derivedCounts = deriveCategoryCounts(notifications);

  return Object.keys(CATEGORY_COUNTS_TEMPLATE).reduce((acc, key) => {
    const nextValue = Number(rawCounts?.[key]);
    acc[key] = Number.isFinite(nextValue) ? nextValue : derivedCounts[key];
    return acc;
  }, {});
}

function filterNotifications(items, activeFilter) {
  if (activeFilter === "all") {
    return items;
  }

  if (activeFilter === "unread") {
    return items.filter((item) => !item.is_read);
  }

  return items.filter((item) => item.category === activeFilter);
}

function formatNotificationDate(dateValue) {
  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return parsed.toLocaleString();
}

function buildEmptyState(activeFilter) {
  if (activeFilter === "unread") {
    return {
      title: "No unread alerts",
      copy: "You are all caught up. New schedule, renewal, and form updates will appear here when they arrive.",
    };
  }

  if (activeFilter === "renewals") {
    return {
      title: "No renewal alerts",
      copy: "Renewal requests, completed renewals, and auto-cancelled renewal notices will appear here.",
    };
  }

  if (activeFilter === "schedules") {
    return {
      title: "No schedule alerts",
      copy: "Booking confirmations, status updates, and cancellations will appear here.",
    };
  }

  if (activeFilter === "forms") {
    return {
      title: "No form alerts",
      copy: "Batch form submissions and related record activity will show up here.",
    };
  }

  if (activeFilter === "system") {
    return {
      title: "No system alerts",
      copy: "General account notifications will appear here when there is something you need to know.",
    };
  }

  return {
    title: "No notifications yet",
    copy: "New form, renewal, and schedule activity will appear here for your account.",
  };
}

async function requestNotifications(accountId) {
  const response = await fetch(LIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account_id: accountId }),
  });

  return parseJsonResponse(response, "Invalid notifications response.");
}

export default function NotificationsScreen() {
  const [accountId, setAccountId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState(CATEGORY_COUNTS_TEMPLATE);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const applyNotificationResponse = (data) => {
    const normalizedNotifications = hydrateNotifications(data.notifications);
    const nextCounts = mergeCategoryCounts(data.category_counts, normalizedNotifications);

    setNotifications(normalizedNotifications);
    setCategoryCounts(nextCounts);
    setUnreadCount(Number(data.unread_count) || nextCounts.unread);
  };

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const storedId = await AsyncStorage.getItem("account_id");
        const parsedId = parseInt(storedId, 10);

        if (!parsedId) {
          Alert.alert("Error", "User not logged in.");
          return;
        }

        setAccountId(parsedId);
        const data = await requestNotifications(parsedId);

        if (data.status === "success") {
          applyNotificationResponse(data);
        } else {
          throw new Error(data.message || "Failed to fetch notifications.");
        }
      } catch (error) {
        console.error("Notification load error:", error);
        Alert.alert("Error", "Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const refreshNotifications = async (nextAccountId = accountId) => {
    if (!nextAccountId) {
      return;
    }

    const data = await requestNotifications(nextAccountId);

    if (data.status === "success") {
      applyNotificationResponse(data);
    } else {
      throw new Error(data.message || "Failed to fetch notifications.");
    }
  };

  const markRead = async (notificationId = null) => {
    if (!accountId) {
      return;
    }

    try {
      const response = await fetch(MARK_READ_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: accountId,
          notification_id: notificationId,
          mark_all: !notificationId,
        }),
      });

      const data = await parseJsonResponse(response, "Invalid update response.");

      if (data.status === "success") {
        await refreshNotifications(accountId);
      } else {
        Alert.alert("Error", data.message || "Failed to update notifications.");
      }
    } catch (error) {
      console.error("Notification update error:", error);
      Alert.alert("Error", "Failed to update notifications.");
    }
  };

  const filteredNotifications = filterNotifications(notifications, activeFilter);
  const filterKeys = FILTER_ORDER.filter(
    (key) => key !== "system" || categoryCounts.system > 0 || activeFilter === "system",
  );
  const summary =
    loading
      ? "Loading your notifications..."
      : activeFilter === "all"
        ? `${categoryCounts.all} alert${categoryCounts.all === 1 ? "" : "s"} total, ${unreadCount} unread.`
        : `${filteredNotifications.length} ${FILTER_LABELS[activeFilter].toLowerCase()} alert${
            filteredNotifications.length === 1 ? "" : "s"
          } shown, ${unreadCount} unread overall.`;
  const emptyState = buildEmptyState(activeFilter);

  return (
    <DashboardShell
      eyebrow="Notification center"
      title="Your alerts"
      subtitle="Track schedule updates, form activity, and other account events in one place."
      summary={summary}
    >
      <View style={styles.actions}>
        <AgriButton
          title="Refresh"
          subtitle="Check for the latest account activity"
          icon="refresh"
          compact
          onPress={() => refreshNotifications(accountId)}
          disabled={!accountId}
        />
        <AgriButton
          title="Mark all read"
          subtitle="Clear all unread notifications"
          icon="check-all"
          variant="secondary"
          compact
          onPress={() => markRead(null)}
          disabled={!accountId || unreadCount === 0}
        />
      </View>

      <View style={styles.filterRail}>
        <Text style={styles.filterHeading}>Browse by category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filterKeys.map((key) => {
            const active = key === activeFilter;
            const count = Number(categoryCounts[key]) || 0;

            return (
              <Pressable
                key={key}
                onPress={() => setActiveFilter(key)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {FILTER_LABELS[key]}
                </Text>
                <View style={[styles.filterCount, active && styles.filterCountActive]}>
                  <Text
                    style={[
                      styles.filterCountText,
                      active && styles.filterCountTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.list}>
        {!loading && filteredNotifications.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.title}>{emptyState.title}</Text>
            <Text style={styles.copy}>{emptyState.copy}</Text>
          </View>
        ) : null}

        {filteredNotifications.map((item) => {
          const tone = CATEGORY_TONES[item.category] || CATEGORY_TONES.system;

          return (
            <Pressable
              key={item.notification_id}
              style={[styles.card, item.is_read ? styles.cardRead : styles.cardUnread]}
              onPress={() => {
                if (!item.is_read) {
                  markRead(item.notification_id);
                }
              }}
            >
              <View style={styles.header}>
                <Text style={styles.title}>{item.title}</Text>
                {!item.is_read ? <View style={styles.dot} /> : null}
              </View>
              <Text style={styles.copy}>{item.message}</Text>
              <View style={styles.metaRow}>
                <View
                  style={[
                    styles.metaBadge,
                    {
                      backgroundColor: tone.backgroundColor,
                      borderColor: tone.borderColor,
                    },
                  ]}
                >
                  <Text style={[styles.metaBadgeText, { color: tone.color }]}>
                    {item.category_label}
                  </Text>
                </View>
                <Text style={styles.metaType}>{item.type_label}</Text>
              </View>
              <Text style={styles.meta}>{formatNotificationDate(item.created_at)}</Text>
            </Pressable>
          );
        })}
      </View>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 12,
    marginBottom: 18,
  },
  filterRail: {
    backgroundColor: "rgba(255,253,247,0.9)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: agriPalette.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  filterHeading: {
    color: agriPalette.ink,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 12,
  },
  filterRow: {
    gap: 10,
    paddingRight: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: agriPalette.border,
    backgroundColor: agriPalette.cream,
  },
  filterChipActive: {
    borderColor: agriPalette.fieldDeep,
    backgroundColor: agriPalette.fieldDeep,
  },
  filterChipText: {
    color: agriPalette.fieldDeep,
    fontSize: 13,
    fontWeight: "900",
  },
  filterChipTextActive: {
    color: agriPalette.white,
  },
  filterCount: {
    minWidth: 26,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: agriPalette.surface,
    borderWidth: 1,
    borderColor: agriPalette.border,
    alignItems: "center",
  },
  filterCountActive: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.2)",
  },
  filterCountText: {
    color: agriPalette.fieldDeep,
    fontSize: 12,
    fontWeight: "900",
  },
  filterCountTextActive: {
    color: agriPalette.white,
  },
  list: {
    gap: 12,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: agriPalette.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: agriPalette.border,
    padding: 18,
  },
  cardUnread: {
    borderColor: agriPalette.field,
  },
  cardRead: {
    opacity: 0.84,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    color: agriPalette.ink,
    fontSize: 18,
    fontWeight: "900",
    flex: 1,
  },
  copy: {
    marginTop: 8,
    color: agriPalette.inkSoft,
    fontSize: 14,
    lineHeight: 21,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  metaBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  metaType: {
    color: agriPalette.inkSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  meta: {
    marginTop: 8,
    color: agriPalette.field,
    fontSize: 12,
    fontWeight: "800",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: agriPalette.field,
  },
});
