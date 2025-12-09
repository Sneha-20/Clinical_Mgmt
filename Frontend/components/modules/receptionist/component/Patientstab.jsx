import Tabs from "@/components/ui/CommonTab";

export default function PatientTabs({
  todayContent,
  totalContent,
  activeTab,
  onTabChange,
}) {
  const tabs = [
    { label: "Today", value: "today", content: todayContent },
    { label: "Total", value: "total", content: totalContent },
  ];

  return (
    <Tabs
      tabs={tabs}
      defaultTab="today"
      onChange={onTabChange}
      activeTab={activeTab}
    />
  );
}
