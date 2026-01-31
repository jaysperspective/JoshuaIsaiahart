"use client";

import Link from "next/link";

export type WorkTab = "photography" | "videography" | "design" | "book";

interface WorkNavigationProps {
  activeTab: WorkTab;
  onTabChange: (tab: WorkTab) => void;
}

const tabs: { id: WorkTab; label: string }[] = [
  { id: "photography", label: "Photo" },
  { id: "videography", label: "Video" },
  { id: "design", label: "Design" },
  { id: "book", label: "Book" },
];

function TabIcon({ tab, active }: { tab: WorkTab; active: boolean }) {
  const className = `w-6 h-6 ${active ? "text-white" : "text-white/50"}`;

  switch (tab) {
    case "photography":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "videography":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case "design":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      );
    case "book":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
  }
}

export default function WorkNavigation({ activeTab, onTabChange }: WorkNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#1a1a1a]/95 backdrop-blur-sm border-t border-white/10 safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {/* Home/Back button */}
        <Link
          href="/"
          className="flex flex-col items-center gap-1 px-4 py-2 text-white/50 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-body">Home</span>
        </Link>

        {/* Tab buttons */}
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
              activeTab === tab.id
                ? "text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            <TabIcon tab={tab.id} active={activeTab === tab.id} />
            <span className={`text-xs font-body ${activeTab === tab.id ? "font-medium" : ""}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
