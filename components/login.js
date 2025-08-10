"use client";

// LoginForm Component - uses the auth helpers for sign in

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, googleSignIn } from "@/utils/auth";

const inputStyle =
  "text-white text-sm px-2 border-b-2 border-b-white placeholder-white placeholder:font-normal w-1/2";
const inputFocusStyle = "focus:outline-none";

export default function LoginForm({ onSwitch }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Handles email and password login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return; // to prevent double submit
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await signIn(
        String(email).trim().toLowerCase(),
        password
      );
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push("/my-itineraries");
    } catch (error) {
      setError(
        typeof error?.message === "string"
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth Login (Supabase handles redirect)
  const handleGoogleLogin = async () => {
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const { error: gError } = await googleSignIn();
      if (gError) setError(gError.message);
    } catch (error) {
      setError(
        typeof error?.message === "string"
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleLogin}
        className="flex flex-col w-full items-center justify-center"
      >
        {/* Email */}
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputStyle + " " + inputFocusStyle + " mb-4"}
          required
          disabled={loading}
          autoComplete="email"
        />
        {/* Password with show/hide toggle */}
        <div className="relative w-1/2">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={
              inputStyle + " " + inputFocusStyle + " w-full pr-10 mb-2"
            }
            required
            disabled={loading}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-1 pb-5 flex items-center text-white"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Display error message */}
        <div className="w-1/2">
          {error && (
            <p className="text-white text-sm text-center mt-4">{error}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-white/50 text-sm rounded-md w-[40%] mt-6 py-1.5 border-2 border-white/40 text-white/50
                        hover:bg-white/80 hover:cursor-pointer hover:text-white hover:border-white/60
                "
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      {/* Register Link */}
      <p className="text-white text-center mt-2 text-sm">
        {`Don't have an account? `}
        <button
          type="button"
          onClick={onSwitch}
          className="text-amber-200 hover:underline hover:text-amber-300"
        >
          Register
        </button>
      </p>

      {/* divider */}
      <div className="flex items-center justify-center w-full mt-6 mb-2">
        <div className="w-1/2 flex items-center">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
          <span className="px-3 text-white/60 text-sm">or</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        </div>
      </div>

      {/* Google Button */}
      <div className="flex justify-center items-center mt-2">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex items-center h-10 w-[40%] justify-center gap-2 border border-gray-300 rounded-md py-2 px-4 bg-white hover:cursor-pointer"
        >
          <img
            src="/g-logo.png"
            alt="Google Logo"
            className="h-5 w-5 object-contain"
          />
          <span className="text-gray-700 text-sm font-medium leading-tight">
            Continue with Google
          </span>
        </button>
      </div>
    </div>
  );
}
