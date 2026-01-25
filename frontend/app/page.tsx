"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login"); // Redirect to the new dedicated login page
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0E1117]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00CC96]"></div>
    </div>
  );
}
