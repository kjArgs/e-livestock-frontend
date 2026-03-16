export const apiRoutes = {
  auth: {
    login: "auth/login",
    register: "auth/register",
    sendOtp: "auth/send-otp",
    verifyOtp: "auth/verify-otp",
    resetPassword: "auth/reset-password",
  },
  profile: {
    info: "accounts/user-info",
    update: "accounts/update",
  },
  owner: {
    forms: "forms/owner",
    schedules: "schedules/owner",
  },
  appointments: {
    available: "schedules/appointments/available",
    create: "schedules/appointments/create",
  },
  inspector: {
    summary: "analytics/inspection-summary",
    createForm: "forms/create",
    suggestions: "dss/check-suggestion",
    forms: "forms/list",
    formDetails: "forms/details",
  },
  antemortem: {
    analytics: "analytics/antemortem",
    schedules: {
      pending: "schedules/antemortem/pending",
      accepted: "schedules/antemortem/accepted",
      ongoing: "schedules/antemortem/ongoing",
      done: "schedules/antemortem/done",
      cancelled: "schedules/antemortem/cancelled",
    },
    updateScheduleStatus: "schedules/antemortem/update-status",
    cancelSchedule: "schedules/antemortem/cancel",
    verifyQr: "verification/qr",
  },
};
