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

export default function WorkNavigation({ activeTab, onTabChange }: WorkNavigationProps) {
  return (
    <nav className="mb-8">
      <div className="flex items-center justify-between">
        {/* Back to home */}
        <Link
          href="/"
          className="text-white/50 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        {/* Tab pills */}
        <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-1.5 rounded-full font-body text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white/15 text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
