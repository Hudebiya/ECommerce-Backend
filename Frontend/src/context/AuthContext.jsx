import { useEffect, useState } from "react";
import { AuthContext } from "./auth-context";

const AUTH_URL = "http://localhost:3000/api/auth";

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Authentication request failed.");
  }
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const response = await fetch(`${AUTH_URL}/me`, { credentials: "include" });
        if (!response.ok) return;

        const data = await response.json();
        if (active) setUser(data.user);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    checkSession();
    return () => {
      active = false;
    };
  }, []);

  const login = async (credentials) => {
    const response = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await readResponse(response);
    setUser(data.user);
    return data.user;
  };

  const signup = async (details) => {
    const response = await fetch(`${AUTH_URL}/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details),
    });
    const data = await readResponse(response);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      const response = await fetch(`${AUTH_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
      await readResponse(response);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

