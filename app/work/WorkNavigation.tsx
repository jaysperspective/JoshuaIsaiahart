"use client";

import Link from "next/link";

export type WorkTab = "photography" | "videography" | "design" | "contact";

interface WorkNavigationProps {
  activeTab: WorkTab;
  onTabChange: (tab: WorkTab) => void;
}

const tabs: { id: WorkTab; label: string }[] = [
  { id: "photography", label: "Photo" },
  { id: "videography", label: "Video" },
  { id: "design", label: "Design" },
  { id: "contact", label: "Contact" },
];

export default function WorkNavigation({ activeTab, onTabChange }: WorkNavigationProps) {
  return (
    <nav className="mb-12">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="group inline-block">
          <p className="font-body text-white/40 text-sm italic">the portfolio of</p>
          <h1 className="font-heading text-white text-2xl sm:text-3xl font-bold tracking-tight group-hover:text-white/80 transition-colors">
            Joshua Isaiah
          </h1>
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
