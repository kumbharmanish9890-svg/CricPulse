
export const getRoleFromToken = (token: string): string | null => {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = JSON.parse(atob(base64));

    return decoded.role || null;
  } catch (error) {
    console.error("Invalid JWT token", error);
    return null;
  }
};
