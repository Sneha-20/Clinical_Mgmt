"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AudiologistDashboard from "@/components/modules/audiologist/Audiologistdashboard";
import AdminDashboard from "@/components/modules/admin/dashboard";
import ReceptionistDashboard from "@/components/modules/receptionist/Receptionistdashboard";
import CommonLoader from "@/components/ui/CommonLoader";

export default function Home() {
  const [userRole, setUserRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Validate user authentication and role
    const role = localStorage.getItem("userRole");

    if (!role) {
      router.push("/login");
      return;
    }

    // Map user role to dashboard component
    const normalizedRole = role.toLowerCase();

    if (
      normalizedRole.includes("audiologist") ||
      normalizedRole.includes("speech")
    ) {
      setUserRole("Doctor");
    } else if (
      normalizedRole.includes("admin") ||
      normalizedRole.includes("clinic manager")
    ) {
      setUserRole("ClinicOwner");
    } else if (normalizedRole.includes("reception")) {
      setUserRole("Reception");
    } else {
      setUserRole("Reception"); // Default to reception
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <CommonLoader />
      </div>
    );
  }

  if (!userRole) {
    return null;
  }

  const renderDashboard = () => {
    switch (userRole) {
      case "Reception":
        return <ReceptionistDashboard />;
      case "Doctor":
        return <AudiologistDashboard />;
      case "ClinicOwner":
        return <AdminDashboard />;
      default:
        return <ReceptionistDashboard />;
    }
  };

  return renderDashboard();
}
