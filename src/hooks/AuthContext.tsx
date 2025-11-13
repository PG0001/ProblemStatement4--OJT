import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
// Lightweight JWT payload decoder (browser-safe) to avoid fragile imports of `jwt-decode`.
function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return {};
    // URL-safe base64 -> base64
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Pad with '='
    while (base64.length % 4) base64 += '=';
    const json = atob(base64);
    try {
      return JSON.parse(json);
    } catch (err) {
      // Some tokens may be URI encoded
      const decoded = decodeURIComponent(
        json
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(decoded);
    }
  } catch (err) {
    return {};
  }
}

interface User {
  id: string;
  name: string;
  role: "Admin" | "Organizer" | "Attendee";
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Initialize user from token or sessionStorage on mount
useEffect(() => {
  try {
    const token = localStorage.getItem("token");
    const sessId = sessionStorage.getItem("user_Id");
    const sessName = sessionStorage.getItem("user_name");
    const sessRole = sessionStorage.getItem("user_role") as User["role"] | null;
    const sessEmail = sessionStorage.getItem("user_email");

    if (sessId && sessName && sessRole) {
      // ✅ Use sessionStorage directly if available
      const normalizedRole =
        sessRole.charAt(0).toUpperCase() + sessRole.slice(1).toLowerCase() as User["role"];
      setUser({ id: sessId, name: sessName, role: normalizedRole });
    } 
    else if (token) {
      // ✅ Decode token only if session data missing
      const decoded: any = decodeJwtPayload(token);
      console.log("Decoded token on init:", decoded);

      const id = decoded.UserId || decoded.id || decoded.sub || decoded.userId || decoded.user_id || "";
      const name = decoded.name || decoded.fullname || decoded.username || decoded.email || "";
      const roleRaw = (decoded.role as string) || "Attendee";
      const normalizedRole =
        roleRaw.charAt(0).toUpperCase() + roleRaw.slice(1).toLowerCase() as User["role"];

      setUser({ id, name, role: normalizedRole });

      // ✅ Optionally sync back to sessionStorage for next reloads
      // sessionStorage.setItem("user_Id", id);
      // sessionStorage.setItem("user_name", name);
      // sessionStorage.setItem("user_role", normalizedRole);
      // sessionStorage.setItem("user_email", decoded.email || "");
    }
  } catch (err) {
    console.error("Auth init failed:", err);
  }
}, []);


  const login = (token: string) => {
    try {
      localStorage.setItem("token", token);
      const decoded: any = decodeJwtPayload(token);
      const sessName = sessionStorage.getItem("user_name");
      const sessRole = sessionStorage.getItem("user_role");

      const id = decoded.id || decoded.sub || decoded.userId || decoded.user_id || "";
      const name = decoded.name || decoded.fullname || decoded.username || sessName || decoded.email || "";
      let roleRaw = (decoded.role as string) || (decoded?.roles && decoded.roles[0]) || sessRole || "attendee";
      // Normalize role to expected casing
      const role = (roleRaw || "attendee").toString();
      const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

      // Persist name/role for other parts of the app
      if (name) sessionStorage.setItem("user_name", name);
      if (normalizedRole) sessionStorage.setItem("user_role", normalizedRole);

      setUser({ id, name, role: normalizedRole as User["role"] });
    } catch (err) {
      console.error("Login decode error:", err);
      // Fallback: set minimal user state
      setUser(null);
    }
  };

  const logout = () => {
    // Clear authentication token and any user info stored in session/local storage
    try {
      localStorage.removeItem("token");
      sessionStorage.removeItem("user_role");
      sessionStorage.removeItem("user_name");
      sessionStorage.removeItem("user_email");
    } catch (err) {
      // ignore storage errors
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
