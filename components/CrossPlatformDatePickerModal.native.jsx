import DateTimePickerModal from "react-native-modal-datetime-picker";

function getSafeDate(value) {
  return value instanceof Date && !Number.isNaN(value.getTime())
    ? value
    : new Date();
}

export default function CrossPlatformDatePickerModal({
  visible,
  value,
  minimumDate,
  maximumDate,
  onConfirm,
  onCancel,
}) {
  return (
    <DateTimePickerModal
      isVisible={visible}
      mode="date"
      date={getSafeDate(value)}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
