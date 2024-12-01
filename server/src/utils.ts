import { Response } from "express";
import { ZodError } from "zod";

// A utility function to handle errors, including Zod validation errors
export const handleApiError = (error: unknown, res: Response) => {
  if (error instanceof ZodError) {
    // If the error is from Zod, send a validation error response
    return res.status(400).json({
      error: "Validation failed",
      details: error.errors,
    });
  }
  // Handle other errors (e.g., database errors, unexpected exceptions)
  console.error("Unexpected error:", error);
  res.status(500).json({
    success: false,
    message: "Your request could not be processed. Please try again.",
  });
};
