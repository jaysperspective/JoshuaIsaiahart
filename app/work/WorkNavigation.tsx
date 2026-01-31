"use client";

export type WorkTab = "photography" | "videography" | "design" | "book";

interface WorkNavigationProps {
  activeTab: WorkTab;
  onTabChange: (tab: WorkTab) => void;
}

const tabs: { id: WorkTab; label: string }[] = [
  { id: "photography", label: "Photography" },
  { id: "videography", label: "Videography" },
  { id: "design", label: "Design" },
  { id: "book", label: "Book" },
];

export default function WorkNavigation({ activeTab, onTabChange }: WorkNavigationProps) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-full font-body text-sm whitespace-nowrap transition-all duration-200 ${
            activeTab === tab.id
              ? "bg-white text-gray-900"
              : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
