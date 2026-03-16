export async function parseJsonResponse(
  response,
  fallbackMessage = "Invalid JSON response from API."
) {
  const text = await response.text();
  const trimmed = text.trim();

  if (!trimmed) {
    throw new Error(
      `${fallbackMessage} Server returned an empty response (HTTP ${response.status}).`
    );
  }

  try {
    return JSON.parse(trimmed);
  } catch (_error) {
    const snippet = trimmed.replace(/\s+/g, " ").slice(0, 180);
    throw new Error(
      snippet
        ? `${fallbackMessage} Server returned: ${snippet}`
        : `${fallbackMessage} HTTP ${response.status}.`
    );
  }
}
