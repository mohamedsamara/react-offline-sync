export const handleError = (error: unknown) => {
  if (error instanceof Error) {
    console.error("Error updating note on server:", error.message);
    return { success: false, message: error.message, data: null };
  } else {
    console.error("Unknown error:", error);
    return { success: false, message: "An unknown error occurred", data: null };
  }
};

export const formatDateTimeString = (dateString: string) => {
  const date = new Date(dateString);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    year: "2-digit",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: undefined,
    timeZoneName: "short",
  }).format(date);
  return formattedDate;
};
