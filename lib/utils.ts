export function cn(...inputs: unknown[]): string {
  const parts: string[] = [];

  const collect = (value: unknown) => {
    if (value === null || value === undefined || value === false || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => collect(item));
      return;
    }

    if (typeof value === "object") {
      Object.entries(value as Record<string, unknown>).forEach(([key, enabled]) => {
        if (enabled) {
          parts.push(key);
        }
      });
      return;
    }

    parts.push(String(value));
  };

  inputs.forEach((input) => collect(input));
  return parts.join(" ");
}
