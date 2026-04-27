"use client";

export type WorkTab = "photography" | "videography" | "design" | "contact";

interface WorkNavigationProps {
  activeTab: WorkTab;
  onTabChange: (tab: WorkTab) => void;
}

const tabs: { id: WorkTab; label: string; accent: string }[] = [
  { id: "photography", label: "Photography", accent: "var(--accent-photography)" },
  { id: "videography", label: "Videography", accent: "var(--accent-videography)" },
  { id: "design", label: "Design", accent: "var(--accent-design)" },
  { id: "contact", label: "Contact", accent: "var(--accent-contact)" },
];

export default function WorkNavigation({ activeTab, onTabChange }: WorkNavigationProps) {
  return (
    <nav className="mb-8" aria-label="Work sections">
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="neu-button px-3 sm:px-4 py-2 font-body text-sm sm:text-base font-medium"
              style={{
                borderLeftWidth: "3px",
                borderLeftColor: tab.accent,
                background: active ? "var(--card-bg-hover)" : undefined,
                color: active ? "var(--foreground)" : "var(--text-muted)",
                boxShadow: active ? `3px 3px 0 var(--border-color)` : undefined,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
