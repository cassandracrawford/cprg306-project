"use client";

// Use Next.js navigation for routing back to login page and
// custom signOut function from utils/auth
import { signOut } from "@/utils/auth";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  // Handles the user logout
  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        alert("Logout failed: " + error.message);
        console.log("Error: ", error.message);
        return;
      }
      // Redirect to login page after successful logout
      router.push("/");
    } catch (error) {
      console.error("Unexpected error during logout:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="underline hover:cursor-pointer"
    >
      Logout
    </button>
  );
}
