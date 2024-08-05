export async function register() {
  // Check if the code is running in the production environment on Vercel
  if (process.env.VERCEL_ENV === "production") {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      await import("./sentry.server.config");
    }

    if (process.env.NEXT_RUNTIME === "edge") {
      await import("./sentry.edge.config");
    }
  } else {
    console.log("Sentry is not initialized in the development environment.");
  }
}
