import axios from "axios";
import {
    createContext,
    useCallback,
    useEffect,
    useState,
} from "react";
import { toast } from "react-toastify";

export const userContext = createContext(null);

const UserContextProvider = ({ children }) => {
    // TOKEN
    const [token, setTokenState] = useState(
        () => localStorage.getItem("token") || ""
    );

    // USER
    const [user, setUser] = useState(null);

    // RESUMES
    const [resume, setResume] = useState([]);

    // JOBS
    const [jobs, setJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // SET TOKEN
    const setToken = useCallback((newToken) => {
        const value = newToken || "";

        setTokenState(value);

        if (value) {
            localStorage.setItem("token", value);
        } else {
            localStorage.removeItem("token");
        }
    }, []);

    // GET USER INFORMATION
    const getUserInformation = useCallback(async () => {
        if (!token) {
            setUser(null);
            return;
        }

        if (!backendUrl) {
            console.error("VITE_BACKEND_URL is not configured.");
            return;
        }

        try {
            const baseUrl = backendUrl.replace(/\/+$/, "");

            const { data } = await axios.get(
                `${baseUrl}/api/auth/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (data.success && data.user) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error(
                "Get user information error:",
                error.response?.data || error.message
            );

            if (error.response?.status === 401) {
                setToken("");
                setUser(null);
                setResume([]);
                return;
            }

            toast.error(
                error.response?.data?.message ||
                "Could not load user information."
            );
        }
    }, [backendUrl, token, setToken]);

    // GET USER RESUMES
    const getResume = useCallback(async () => {
        if (!token || !backendUrl) {
            setResume([]);
            return;
        }

        try {
            const baseUrl = backendUrl.replace(/\/+$/, "");

            const { data } = await axios.get(
                `${baseUrl}/api/resumes/my-resumes`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (data.success) {
                setResume(
                    (data.resumes || []).map((item) => ({
                        ...item,
                        id: item._id,
                        name: item.title,
                        size: item.size || 0,
                        url: item.fileUrl,
                    }))
                );
            }
        } catch (error) {
            console.error(
                "Get resumes error:",
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to fetch resumes."
            );
        }
    }, [backendUrl, token]);

    // GET ALL JOBS
    // GET ALL JOBS
    const getJob = useCallback(async () => {
        if (!backendUrl) {
            console.error("VITE_BACKEND_URL is not configured.");
            return;
        }

        setJobsLoading(true);

        try {
            const baseUrl = backendUrl.replace(/\/+$/, "");

            const { data } = await axios.get(
                `${baseUrl}/api/users/getjobs`
            );

            if (data.success) {
                setJobs(data.jobs || []);
            } else {
                setJobs([]);
                toast.error(data.message || "Failed to fetch jobs.");
            }
        } catch (error) {
            console.error(
                "Get jobs error:",
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message || "Failed to fetch jobs."
            );
        } finally {
            setJobsLoading(false);
        }
    }, [backendUrl]);

    // LOAD USER INFORMATION WHEN TOKEN CHANGES
    useEffect(() => {
        getUserInformation();
    }, [getUserInformation]);

    // LOAD RESUMES WHEN TOKEN CHANGES
    useEffect(() => {
        getResume();
    }, [getResume]);

    // LOAD JOBS WHEN THE APP STARTS
    useEffect(() => {
        getJob();
    }, [getJob]);

    // CONTEXT VALUE
    const value = {
        backendUrl,
        token,
        setToken,

        user,
        setUser,
        getUserInformation,

        resume,
        setResume,
        getResume,

        jobs,
        setJobs,
        getJob,
        jobsLoading,
    };

    return (
        <userContext.Provider value={value}>
            {children}
        </userContext.Provider>
    );
};

export default UserContextProvider;