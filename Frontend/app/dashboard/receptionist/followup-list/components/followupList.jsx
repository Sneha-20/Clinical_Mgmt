"use client"
import React, { useState } from "react";
import FollowupTabs from "./followUpTabs";
import AppointmentList from "@/components/modules/receptionist/component/AppointmentList";

export default function FollowupList() {
  const [activeTab, setActiveTab] = useState("completed");
  return (
    <div>
      <FollowupTabs
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        completed={
          <>
         <AppointmentList />
          </>
        }
        pending={<div>follow up list</div>}
      />
    </div>
  );
}
