import { createContext, useContext, useEffect, useState } from 'react';
import { insforge } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage to prevent logout on refresh
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('cp_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("AuthContext: Failed to parse user from localStorage", e);
      return null;
    }
  });
  const [role, setRole] = useState(() => {
    try {
      return localStorage.getItem('cp_role');
    } catch (e) {
      return null;
    }
  });
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch role from database
  const fetchRole = async (userId, currentUser) => {
    console.log("AuthContext: Fetching role for", userId, "User object:", currentUser);
    try {
      const { data, error } = await insforge.database
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        console.log("AuthContext: Profile found in DB:", data.role);
        localStorage.setItem('cp_role', data.role);
        setRole(data.role);
        setUserData(data);
        return data.role;
      } else {
        console.log("AuthContext: Profile DB fetch error or missing:", error);
        // Fallback to various metadata locations
        const metadataRole =
          currentUser?.user_metadata?.role ||
          currentUser?.metadata?.role ||
          currentUser?.profile?.role ||
          currentUser?.app_metadata?.role;

        if (metadataRole) {
          console.log("AuthContext: Role found in metadata:", metadataRole);
          setRole(metadataRole);
          localStorage.setItem('cp_role', metadataRole);
          return metadataRole;
        }
        console.warn("AuthContext: No role found in DB or metadata, defaulting to student");
        localStorage.setItem('cp_role', 'student');
        setRole('student');
        return 'student';
      }
    } catch (err) {
      console.error("AuthContext: Error fetching role:", err);
      setRole('student');
      return 'student';
    }
  };

  // Helper to safely clear session
  const clearSession = () => {
    console.log("AuthContext: Clearing session...");
    localStorage.removeItem('cp_user');
    localStorage.removeItem('cp_role');
    setUser(null);
    setRole(null);
  };

  const syncSession = async (retryCount = 0) => {
    console.log(`AuthContext: Syncing session (attempt ${retryCount + 1})...`);
    try {
      const { data, error } = await insforge.auth.getCurrentUser();

      if (error) {
        console.error("AuthContext: getCurrentUser error", error);
        // If it's a network error, retry once after a delay
        if (retryCount < 1) {
          console.log("AuthContext: Retrying sync in 500ms...");
          setTimeout(() => syncSession(retryCount + 1), 500);
          return;
        }

        // If we still have an error but already have a user in state, don't logout
        if (user) {
          console.log("AuthContext: Keeping existing user due to persistent error");
          setLoading(false);
          return;
        }
      }

      if (!data?.user) {
        console.log("AuthContext: No valid user session found from server");
        // Only clear if we are certain there's no session and it's not a transient error
        if (!error) {
          clearSession();
        }
      } else {
        const currentUser = data.user;
        console.log("AuthContext: User synced successfully:", currentUser.email);
        setUser(currentUser);
        localStorage.setItem('cp_user', JSON.stringify(currentUser));

        // Wait for role to be fetched before finishing loading
        await fetchRole(currentUser.id, currentUser);
      }
    } catch (err) {
      console.error("AuthContext: Sync session exception:", err);
    } finally {
      console.log("AuthContext: Sync process complete, setting loading=false");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Small delay to allow SDK internal initialization if needed
    const timer = setTimeout(() => {
      syncSession();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const login = async (email, password) => {
    const res = await insforge.auth.signInWithPassword({ email, password });
    let resolvedRole = null;
    if (!res.error && res.data?.user) {
      const currentUser = res.data.user;
      resolvedRole = await fetchRole(currentUser.id, currentUser);
      setUser(currentUser);
      localStorage.setItem('cp_user', JSON.stringify(currentUser));
    }
    return { ...res, role: resolvedRole };
  };

  const signup = async (email, password, roleData, name) => {
    console.log("AuthContext: Starting signup for", email, "as", roleData);
    // Store pending role to ensure it's picked up after verification
    localStorage.setItem('cp_pending_role', roleData);
    localStorage.setItem('cp_pending_name', name);

    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name,
      options: {
        data: { name, role: roleData }
      }
    });

    if (error) throw error;

    if (data?.user) {
      // Try to store role in profile immediately
      try {
        await insforge.auth.setProfile({ name, role: roleData });
      } catch (e) {
        console.error("AuthContext: setProfile error:", e);
      }

      // Try to create profile record in database (might fail if session not fully active, but verifyOTP will catch it)
      try {
        await insforge.database.from('profiles').insert([
          { id: data.user.id, role: roleData, email, name }
        ]);
      } catch (e) {
        console.warn("AuthContext: Initial profile insert failed, will retry after verification", e);
      }

      if (!data.requireEmailVerification) {
        setUser(data.user);
        localStorage.setItem('cp_user', JSON.stringify(data.user));
        setRole(roleData);
        localStorage.setItem('cp_role', roleData);
        localStorage.removeItem('cp_pending_role');
        localStorage.removeItem('cp_pending_name');
      }
    }
    return { data, error };
  };

  const logout = async () => {
    try {
      await insforge.auth.signOut();
    } catch (e) {
      console.error("Logout error:", e);
    }
    localStorage.removeItem('cp_user');
    localStorage.removeItem('cp_role');
    localStorage.removeItem('cp_pending_role');
    localStorage.removeItem('cp_pending_name');
    setUser(null);
    setRole(null);
    setUserData(null);
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    await fetchRole(user.id, user);
  };

  const verifyOTP = async (email, otp) => {
    const res = await insforge.auth.verifyEmail({ email, otp });
    if (!res.error && res.data?.user) {
      const currentUser = res.data.user;
      const pendingRole = localStorage.getItem('cp_pending_role');
      const pendingName = localStorage.getItem('cp_pending_name');

      console.log("AuthContext: OTP Verified. Pending role:", pendingRole);

      setUser(currentUser);
      localStorage.setItem('cp_user', JSON.stringify(currentUser));

      if (pendingRole) {
        // Ensure profile exists in DB
        await insforge.database.from('profiles').upsert([
          { id: currentUser.id, role: pendingRole, email, name: pendingName }
        ]);
        setRole(pendingRole);
        localStorage.setItem('cp_role', pendingRole);
        localStorage.removeItem('cp_pending_role');
        localStorage.removeItem('cp_pending_name');
      } else {
        await fetchRole(currentUser.id, currentUser);
      }
    }
    return res;
  };

  const loginWithOAuth = async (provider) => {
    return insforge.auth.signInWithOAuth({
      provider,
      redirectTo: `${window.location.origin}/dashboard`
    });
  };

  const sendResetPasswordEmail = async (email) => {
    return insforge.auth.sendResetPasswordEmail({
      email,
      redirectTo: `${window.location.origin}/reset-password`
    });
  };

  const resetPassword = async (newPassword, token) => {
    return insforge.auth.resetPassword({
      newPassword,
      otp: token
    });
  };

  return (
    <AuthContext.Provider value={{ user, role, setRole, userData, refreshProfile, loading, login, signup, logout, verifyOTP, loginWithOAuth, sendResetPasswordEmail, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


