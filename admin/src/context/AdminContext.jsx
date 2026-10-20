
import { createContext, useState, useCallback } from "react";

export const adminContext = createContext(undefined);

const AdminContextProvider = ({ children }) => {
    const [token, setTokenState] = useState(
        () => localStorage.getItem("adminToken") || ""
    );

    const backendUrl = (
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
    ).replace(/\/+$/, "");




    const setToken = useCallback((newToken) => {
        if (newToken) {
            localStorage.setItem("adminToken", newToken);
            setTokenState(newToken);
        } else {
            localStorage.removeItem("adminToken");
            setTokenState("");
        }
    }, []);

    const value = {
        token,
        setToken,
        backendUrl,
    };

    return (
        <adminContext.Provider value={value}>
            {children}
        </adminContext.Provider>
    );
};

export default AdminContextProvider;
