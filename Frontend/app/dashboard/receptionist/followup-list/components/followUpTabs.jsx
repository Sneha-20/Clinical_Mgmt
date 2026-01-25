import Tabs from "@/components/ui/CommonTab";

export default function FollowupTabs({
  pending,
  completed,
  activeTab,
  onTabChange,
}) {
  const tabs = [
    { label: "Completed", value: "completed", content: completed },
    { label: "Pending", value: "pending", content: pending },
  ];

  return (
    <Tabs
      tabs={tabs}
      defaultTab="completed"
      onChange={onTabChange}
      activeTab={activeTab}
    />
  );
}
