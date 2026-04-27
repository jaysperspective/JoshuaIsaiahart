interface BadgeProps {
  accent?: string;
  variant?: "outline" | "solid";
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  accent = "var(--accent-about)",
  variant = "outline",
  children,
  className = "",
}: BadgeProps) {
  const style =
    variant === "solid"
      ? { background: accent, color: "var(--background)", border: `1px solid ${accent}` }
      : { color: accent, border: `1px solid ${accent}` };

  return (
    <span
      className={`inline-block font-medium px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide font-body ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
