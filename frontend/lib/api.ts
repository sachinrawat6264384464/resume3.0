const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://resume3-0.onrender.com/api/v1";

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const res = await fetch(url, {
        ...options,
        headers,
      });

      const responseText = await res.text();

      if (!res.ok) {
        let errorMsg = `API Error: ${res.statusText}`;
        if (responseText && responseText.trim()) {
          try {
            const errJson = JSON.parse(responseText);
            errorMsg = errJson.detail || errJson.message || errorMsg;
          } catch {
            errorMsg = responseText;
          }
        }
        throw new Error(errorMsg);
      }

      if (!responseText || !responseText.trim()) {
        return {} as T;
      }

      try {
        return JSON.parse(responseText);
      } catch (parseErr) {
        console.warn("API response was not valid JSON:", parseErr);
        return {} as T;
      }
    } catch (err: any) {
      if (attempts < maxAttempts && (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError"))) {
        console.warn(`[apiFetch] Network/Cold-start retry attempt ${attempts} of ${maxAttempts} for ${endpoint}...`);
        await new Promise((r) => setTimeout(r, 1200));
        continue;
      }
      throw err;
    }
  }

  return {} as T;
}

export async function firebasePhoneLogin(idToken: string, fullName?: string, role: string = "CANDIDATE") {
  return apiFetch("/auth/firebase-phone-login", {
    method: "POST",
    body: JSON.stringify({
      id_token: idToken,
      full_name: fullName,
      role: role
    })
  });
}
