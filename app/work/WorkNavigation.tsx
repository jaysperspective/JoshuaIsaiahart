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
    <nav className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="group">
          <p className="font-body text-white/40 text-sm italic">the portfolio of</p>
          <h1 className="font-heading text-white text-2xl sm:text-3xl font-bold tracking-tight group-hover:text-white/80 transition-colors">
            Joshua Isaiah
          </h1>
        </Link>

        {/* Back arrow */}
        <Link
          href="/"
          className="text-white/40 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      </div>

      {/* Tab pills */}
      <div className="flex items-center gap-1.5 bg-white/5 rounded-full p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 px-5 py-2.5 rounded-full font-body text-base transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white/15 text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
