import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const CustomerRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isLoading, error, setError } = useAuth();

  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const from = location.state?.from || "/index";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!agreeTerms) {
      setError("Please agree to the Terms and Conditions");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const userData = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    };

    const result = await register(userData);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen bg-background-light font-display dark:bg-background-dark">
      {/* Left Side - Image */}
      <div
        className="hidden w-1/2 bg-cover bg-center lg:block"
        style={{
          backgroundImage: 'linear-gradient(rgba(139, 90, 43, 0.7), rgba(0, 0, 0, 0.8)), url("https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80")',
        }}
      >
        <div className="flex h-full flex-col items-center justify-center px-12 text-white">
          <span className="material-symbols-outlined mb-6 text-6xl text-accent">local_cafe</span>
          <h1 className="mb-4 text-4xl font-bold">Join ClubCode Café</h1>
          <p className="text-center text-lg text-white/90">
            Create an account to skip the line with mobile ordering and start earning free coffee!
          </p>
          <div className="mt-8 grid grid-cols-3 gap-8 text-center">
            <div>
              <span className="material-symbols-outlined mb-2 text-3xl">bolt</span>
              <p className="text-sm">Fast Ordering</p>
            </div>
            <div>
              <span className="material-symbols-outlined mb-2 text-3xl">loyalty</span>
              <p className="text-sm">Earn Points</p>
            </div>
            <div>
              <span className="material-symbols-outlined mb-2 text-3xl">redeem</span>
              <p className="text-sm">Free Rewards</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-3 text-accent lg:hidden">
            <span className="material-symbols-outlined text-4xl">local_cafe</span>
            <h1 className="text-2xl font-bold">ClubCode Café</h1>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-text-light dark:text-text-dark">Create Account</h2>
            <p className="mt-2 text-subtle-light dark:text-subtle-dark">Fill in your details to join the club</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-100 p-4 text-red-700">
                <span className="material-symbols-outlined">error</span>
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full rounded-lg border border-border-light bg-card-light py-3 px-4" placeholder="Jane" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full rounded-lg border border-border-light bg-card-light py-3 px-4" placeholder="Doe" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-lg border border-border-light bg-card-light py-3 px-4" placeholder="coffee@lover.com" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-lg border border-border-light bg-card-light py-3 px-4" placeholder="096 80 77 189" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Password *</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="w-full rounded-lg border border-border-light bg-card-light py-3 px-4 pr-12" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-light">
                  <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Confirm Password *</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full rounded-lg border border-border-light bg-card-light py-3 px-4 pr-12" placeholder="••••••••" />
              </div>
            </div>

            <label className="flex items-start gap-2">
              <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-1" />
              <span className="text-sm text-subtle-light">
                I agree to the Terms of Service and Privacy Policy
              </span>
            </label>

            <button type="submit" disabled={isLoading} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent font-bold text-white transition-all hover:bg-accent/90 disabled:opacity-50">
              {isLoading ? "Creating account..." : "Join the Club"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-subtle-light">
            Already a member? <Link to="/index/login" state={{ from }} className="font-medium text-accent hover:underline">Sign in</Link>
          </p>

          <div className="mt-6 text-center">
            <Link to="/index" className="inline-flex items-center gap-1 text-sm text-subtle-light hover:text-accent">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegister;