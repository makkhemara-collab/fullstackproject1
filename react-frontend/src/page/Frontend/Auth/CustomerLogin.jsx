import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const CustomerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, setError } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const from = location.state?.from || "/index";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen bg-background-light font-display dark:bg-background-dark">
      {/* Left Side - Café Image */}
      <div
        className="hidden w-1/2 bg-cover bg-center lg:block"
        style={{
          backgroundImage: 'linear-gradient(rgba(139, 90, 43, 0.6), rgba(0, 0, 0, 0.8)), url("https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80")',
        }}
      >
        <div className="flex h-full flex-col items-center justify-center px-12 text-white">
          <span className="material-symbols-outlined mb-6 text-6xl text-accent">local_cafe</span>
          <h1 className="mb-4 text-4xl font-bold">Welcome to ClubCode Café</h1>
          <p className="text-center text-lg text-white/90">
            Sign in to earn loyalty points, view your order history, and re-order your favorites with one click.
          </p>
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
            <h2 className="text-3xl font-bold text-text-light dark:text-text-dark">Sign In</h2>
            <p className="mt-2 text-subtle-light dark:text-subtle-dark">
              Enter your email and password to access your profile
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-100 p-4 text-red-700">
                <span className="material-symbols-outlined">error</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light">mail</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border-light bg-card-light py-3 pl-10 pr-4 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="coffee@lover.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light">lock</span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border-light bg-card-light py-3 pl-10 pr-12 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-light hover:text-text-light"
                >
                  <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent font-bold text-white transition-all hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-subtle-light">
            Don't have an account?{" "}
            <Link to="/index/register" state={{ from }} className="font-medium text-accent hover:underline">
              Create an account
            </Link>
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

export default CustomerLogin;