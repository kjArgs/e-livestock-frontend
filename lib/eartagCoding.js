export const EARTAG_SHAPE_OPTIONS = [
  { label: "Round", value: "round" },
  { label: "Square", value: "square" },
  { label: "Rectangle", value: "rectangle" },
];

export const EARTAG_COLOR_OPTIONS = [
  { label: "Orange", value: "orange" },
  { label: "Yellow", value: "yellow" },
  { label: "Blue", value: "blue" },
  { label: "Red", value: "red" },
  { label: "Green", value: "green" },
];

function formatOptionLabel(value, options) {
  return (
    options.find((option) => option.value === String(value || "").trim().toLowerCase())
      ?.label || ""
  );
}

export function formatEartagShape(value) {
  return formatOptionLabel(value, EARTAG_SHAPE_OPTIONS);
}

export function formatEartagColor(value) {
  return formatOptionLabel(value, EARTAG_COLOR_OPTIONS);
}

export function hasAssignedEartagCoding(record) {
  return Boolean(
    String(record?.eartag_shape || "").trim() &&
      String(record?.eartag_color || "").trim()
  );
}

export function formatAssignedEartagCoding(record) {
  const shape = formatEartagShape(record?.eartag_shape);
  const color = formatEartagColor(record?.eartag_color);

  if (!shape || !color) {
    return "";
  }

  return `${shape} / ${color}`;
}

export function getEartagColorSwatch(value) {
  switch (String(value || "").trim().toLowerCase()) {
    case "orange":
      return "#E48B3C";
    case "yellow":
      return "#D2A64A";
    case "blue":
      return "#4A82C3";
    case "red":
      return "#BC5D3E";
    case "green":
      return "#4F8A4D";
    default:
      return "#AAB7A0";
  }
}

