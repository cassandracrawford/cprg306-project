"use client";

import { signOut } from "@/utils/auth";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.log("Error: ", error.message);
      return;
    }

    router.push("/");
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