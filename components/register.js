"use client";

// Register Form uses the signUp function from the utils/auth
import { signUp } from "@/utils/auth";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useRouter } from "next/navigation";

const inputStyle =
  "text-white text-sm px-2 border-b-2 border-b-white placeholder-white placeholder:font-normal w-1/2";
const inputFocusStyle = "focus:outline-none";

export default function RegisterForm({ onSwitch }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await signUp(
        String(email).trim().toLowerCase(),
        password
      );

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes("already registered")) {
          setError("This email is already in use. Please log in instead.");
        } else {
          setError(signUpError.message);
        }
        return;
      }

      // Supabase duplicate detection
      const duplicate =
        data?.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0;

      if (duplicate) {
        setError("This email is already in use. Please log in instead.");
        return;
      }

      // When email confirmation is required, data.session is null
      const emailConfirmationRequired = !data?.session;

      if (emailConfirmationRequired) {
        setSuccessMsg("Success! Check your email for a confirmation link.");
        // Clear form fields
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        router.push("/my-itineraries");
      }
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
        onSubmit={handleSignUp}
        className="flex flex-col w-full items-center justify-center"
      >
        {/* Email */}
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null); // clears old error
            if (successMsg) setSuccessMsg(""); // clears old success
          }}
          placeholder="Email Address"
          className={inputStyle + " " + inputFocusStyle + " mb-4"}
          required
          autoComplete="email"
          disabled={loading}
        />
        <div className="relative w-1/2">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null); // clears old error
            }}
            placeholder="Password"
            className={
              inputStyle + " " + inputFocusStyle + " w-full pr-10 mb-4"
            }
            required
            autoComplete="new-password"
            disabled={loading}
            minLength={6}
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
        <div className="relative w-1/2">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error) setError(null); // clears old error
            }}
            placeholder="Confirm Password"
            className={
              inputStyle + " " + inputFocusStyle + " w-full pr-10 mb-4"
            }
            required
            autoComplete="new-password"
            disabled={loading}
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-1 pb-5 flex items-center text-white"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </button>
        </div>
        {/* Display Error / Success Message */}
        {error && <p className="text-white text-xs mt-2">{error}</p>}
        {!error && successMsg && (
          <p className="text-white text-xs mt-2">{successMsg}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-white/50 text-sm rounded-md w-[40%] mt-4 py-1.5 border-2 border-white/40 text-white/50 
                        hover:bg-white/80 hover:cursor-pointer hover:text-white hover:border-white/60
                "
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {/* Login Link */}
      <p className="text-white text-center mt-2 text-sm">
        {`Already have an account? `}
        <button
          type="button"
          onClick={onSwitch}
          className="text-amber-200 hover:underline hover:text-amber-300"
        >
          Login
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
          //onClick={handleGoogleLogin}
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
