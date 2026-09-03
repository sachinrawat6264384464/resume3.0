function getApiBase(): string {
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  }
  return process.env.NEXT_PUBLIC_API_URL || "https://resume3-0.onrender.com/api/v1";
}

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

  const apiBase = getApiBase();
  const url = endpoint.startsWith("http") ? endpoint : `${apiBase}${endpoint}`;

  let attempts = 0;
  const maxAttempts = 4;
  // Exponential backoff delays: 2s, 5s, 12s — handles Render cold-start (30-40s total)
  const retryDelays = [2000, 5000, 12000];

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const res = await fetch(url, {
        ...options,
        headers,
      });

      const responseText = await res.text();

      // Retry on 502/503/504 gateway errors (Render cold-start)
      if ((res.status === 502 || res.status === 503 || res.status === 504) && attempts < maxAttempts) {
        const delay = retryDelays[attempts - 1] ?? 5000;
        console.warn(`[apiFetch] Server ${res.status} - cold-start detected. Retry ${attempts}/${maxAttempts} in ${delay/1000}s for ${endpoint}...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

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
      // Retry on network errors (Failed to fetch / NetworkError) — Render sleeping
      if (attempts < maxAttempts && (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError") || err.message?.includes("network"))) {
        const delay = retryDelays[attempts - 1] ?? 5000;
        console.warn(`[apiFetch] Network error (cold-start) - retry ${attempts}/${maxAttempts} in ${delay/1000}s for ${endpoint}...`);
        await new Promise((r) => setTimeout(r, delay));
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
