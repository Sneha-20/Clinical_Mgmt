"use client";
import { useState } from "react";

export default function Tabs({ tabs, defaultTab, onChange }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].value);

  const handleTabClick = (value) => {
    setActiveTab(value);
    onChange && onChange(value);
  };

  return (
    <div className="w-full">
      {/* Tab Button Row */}
      <div className="flex border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className={`px-4 py-2 text-sm 
              ${activeTab === tab.value 
                ? "border-b-2 border-primary text-primary font-medium" 
                : "text-gray-600"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-2">
        {tabs.map(
          (tab) =>
            activeTab === tab.value && (
              <div key={tab.value}>{tab.content}</div>
            )
        )}
      </div>
    </div>
  );
}
