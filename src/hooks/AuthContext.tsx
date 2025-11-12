import { createContext, useContext, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

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

  const login = (token: string) => {
    localStorage.setItem("token", token);
    const decoded: any = jwtDecode(token);
    setUser({
      id: decoded.id,
      name: decoded.name,
      role: decoded.role,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
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
