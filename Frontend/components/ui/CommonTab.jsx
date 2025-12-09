"use client";
import { useState, useEffect } from "react";

export default function Tabs({ tabs, defaultTab, activeTab, onChange }) {
  const [localTab, setLocalTab] = useState(activeTab || defaultTab || tabs[0].value);

  // Sync when parent changes activeTab
  useEffect(() => {
    if (activeTab) setLocalTab(activeTab);
  }, [activeTab]);

  const handleTabClick = (value) => {
    setLocalTab(value);
    onChange && onChange(value);
  };

  return (
    <div className="w-full">
      {/* Tab Buttons */}
      <div className="flex border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className={`px-4 py-2 text-sm ${
              localTab === tab.value
                ? "border-b-2 border-primary text-primary font-medium"
                : "text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-2">
        {tabs.map(
          (tab) =>
            localTab === tab.value && (
              <div key={tab.value}>{tab.content}</div>
            )
        )}
      </div>
    </div>
  );
}
