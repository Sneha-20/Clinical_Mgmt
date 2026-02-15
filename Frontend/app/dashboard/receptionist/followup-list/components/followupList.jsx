"use client"
import React, { useState } from "react";
import FollowupTabs from "./followUpTabs";
import CompletedFollowupList from "./CompletedFollowupList";
import PendingFollowupList from "./PendingFollowupList";
import Backbutton from "@/components/ui/Backbutton";

export default function FollowupList() {
  const [activeTab, setActiveTab] = useState("completed");
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Back Button, Title and Message */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Backbutton />
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-primaryText">
            Follow-up Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Track and manage patient follow-ups. Mark patients as contacted once you've reached out to them.
          </p>
        </div>
      </div>

      {/* Tabs and Content */}
      <FollowupTabs
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        completed={<CompletedFollowupList />}
        pending={<PendingFollowupList />}
      />
    </div>
  );
}
