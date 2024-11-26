export const handleError = (error: unknown) => {
  if (error instanceof Error) {
    console.error("Error updating note on server:", error.message);
    return { success: false, message: error.message, data: null };
  } else {
    console.error("Unknown error:", error);
    return { success: false, message: "An unknown error occurred", data: null };
  }
};
