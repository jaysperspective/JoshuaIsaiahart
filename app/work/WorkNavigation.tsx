"use client";

import Link from "next/link";

export type WorkTab = "photography" | "videography" | "design" | "contact";

interface WorkNavigationProps {
  activeTab: WorkTab;
  onTabChange: (tab: WorkTab) => void;
}

const tabs: { id: WorkTab; label: string; no: string }[] = [
  { id: "photography", label: "Photo", no: "01" },
  { id: "videography", label: "Video", no: "02" },
  { id: "design", label: "Design", no: "03" },
  { id: "contact", label: "Contact", no: "04" },
];

export default function WorkNavigation({ activeTab, onTabChange }: WorkNavigationProps) {
  return (
    <nav className="mb-12">
      {/* Masthead */}
      <div className="flex items-center justify-between pt-10 sm:pt-14">
        <Link href="/" className="eyebrow transition-colors hover:text-accent">
          ← Joshua Isaiah
        </Link>
        <span className="label numeral">Work — №&nbsp;03</span>
      </div>
      <hr className="rule mt-5" />

      {/* Title */}
      <div className="pt-12 pb-8 sm:pt-16">
        <p className="eyebrow mb-5">The Portfolio Of</p>
        <h1 className="display text-[clamp(2.5rem,8vw,5rem)]">Selected Work</h1>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 border-t border-rule pt-5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`group flex items-baseline gap-2 font-display text-2xl transition-colors sm:text-3xl ${
                isActive ? "text-emerald" : "text-muted hover:text-ink"
              }`}
            >
              <span className="label numeral text-[0.6rem]">{tab.no}</span>
              <span className={`relative ${isActive ? "" : ""}`}>
                {tab.label}
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-accent transition-all duration-300 ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
