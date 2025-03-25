import { createContext, useContext, useEffect, useState } from "react";

export interface IAuthContext {
  user: IGoogleUser;
  setUser: (user: IGoogleUser) => void;
  tokens?: any;
  loading: boolean;
  error?: any;
  login: () => void;
  logOut: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<IGoogleUser | null>();
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on component mount
  useEffect(() => {
    const handleAuthSuccess = (data) => {
      if (data?.user?.id) {
        setUser(data.user);
        setTokens(data.tokens);
      }
      setLoading(false);
    };

    const handleAuthRefreshFailed = (errorMessage) => {
      setError(errorMessage);
      setUser(null);
      setTokens(null);
      setLoading(false);
    };

    // Listen for auth events from main process
    window.electronAPI?.ipcRenderer?.on("auth-success", handleAuthSuccess);
    window.electronAPI?.ipcRenderer?.on(
      "auth-refresh-failed",
      handleAuthRefreshFailed,
    );

    // Cleanup listeners
    return () => {
      window.electronAPI?.ipcRenderer?.removeListener?.(
        "auth-success",
        handleAuthSuccess,
      );
      window.electronAPI?.ipcRenderer?.removeListener?.(
        "auth-refresh-failed",
        handleAuthRefreshFailed,
      );
    };
  }, []);

  // Login function
  const login = async () => {
    try {
      setLoading(true);
      setError(null);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);

      // await authService.logout();

      setUser(null);
      setTokens(null);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    setUser,
    tokens,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
  } as unknown as IAuthContext;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
