import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import request from "../utils/request";
import { showAlert } from "../utils/alert";

const useLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // If already logged in, skip login page
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard");
        }
    }, [navigate]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.email || !formData.password) {
            showAlert("warning", "Email and password are required");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await request("api/user/login", "POST", formData);
            
            if (response?.success && response?.token) {
                // ✅ CRITICAL: Save both Token and User object for roles
                localStorage.setItem("token", response.token);
                localStorage.setItem("user", JSON.stringify(response.data));
                
                showAlert("success", response.message || "Login successful");
                navigate("/dashboard");
                return;
            }

            showAlert("error", response?.message || "Login failed");
        } catch (error) {
            const message = error?.response?.data?.message || "Cannot login. Please check connection.";
            showAlert("error", message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formData,
        isSubmitting,
        handleChange,
        handleSubmit,
    };
};

export default useLogin;