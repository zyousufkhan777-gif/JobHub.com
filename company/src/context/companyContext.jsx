import {
    createContext,
    useState,
    useCallback,
} from "react";

import axios from "axios";
import { toast } from "react-toastify";

export const companyContext = createContext(undefined);

const CompanyContextProvider = ({ children }) => {
    const [token, setTokenState] = useState(
        () => localStorage.getItem("companyToken") || ""
    );

    const [companyInfo, setCompanyInfo] = useState(null);
    const [loadingCompany, setLoadingCompany] = useState(false);

    const [jobs, setJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(false);

    const backendUrl = (
        import.meta.env.VITE_BACKEND_URL ||
        "http://localhost:3000"
    ).replace(/\/+$/, "");

    // Save or remove company token.
    const setToken = useCallback((newToken) => {
        if (newToken) {
            localStorage.setItem("companyToken", newToken);
            setTokenState(newToken);
        } else {
            localStorage.removeItem("companyToken");
            setTokenState("");
            setCompanyInfo(null);
            setJobs([]);
        }
    }, []);

    // Fetch company profile.
    const getCompany = useCallback(async () => {
        if (!token) {
            setCompanyInfo(null);
            return null;
        }

        setLoadingCompany(true);

        try {
            const { data } = await axios.get(
                `${backendUrl}/api/companies/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    timeout: 10000,
                }
            );

            if (data.success && data.company) {
                setCompanyInfo(data.company);
                return data.company;
            }

            setCompanyInfo(null);

            toast.error(
                data.message ||
                "Company information was not found."
            );

            return null;
        } catch (error) {
            console.error(
                "Get Company Error:",
                error.response?.data || error.message
            );

            if (error.response?.status === 401) {
                toast.error(
                    "Session expired. Please log in again."
                );
            } else {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to load company information."
                );
            }

            return null;
        } finally {
            setLoadingCompany(false);
        }
    }, [token, backendUrl]);

    // Fetch all jobs belonging to the logged-in company.
    const getallJob = useCallback(async () => {
        if (!token) {
            setJobs([]);
            return;
        }

        setLoadingJobs(true);

        try {
            const { data } = await axios.get(
                `${backendUrl}/api/jobs`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    timeout: 10000,
                }
            );

            if (data.success) {
                setJobs(
                    Array.isArray(data.jobs)
                        ? data.jobs
                        : []
                );
            } else {
                toast.error(
                    data.message ||
                    "Failed to fetch jobs."
                );
            }
        } catch (error) {
            console.error(
                "Get All Jobs Error:",
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to fetch jobs."
            );
        } finally {
            setLoadingJobs(false);
        }
    }, [backendUrl, token]);

    // Context values available to child components.
    const value = {
        token,
        setToken,
        backendUrl,

        companyInfo,
        setCompanyInfo,
        getCompany,
        loadingCompany,

        jobs,
        setJobs,
        getallJob,
        loadingJobs,
    };

    return (
        <companyContext.Provider value={value}>
            {children}
        </companyContext.Provider>
    );
};

export default CompanyContextProvider;