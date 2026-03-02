import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Venus Tracker — Support",
  description:
    "Support page for Venus Tracker, an astronomy & astrology companion for Venus by Joshua Harrington.",
};

const faqs = [
  {
    q: "What is Venus Tracker?",
    a: "Venus Tracker is an iOS app that lets you follow Venus across the sky and through its ancient synodic calendar. It includes real-time sky positioning, an AR viewfinder, a 13-month Venus calendar with holidays, curated astronomy and astrology news, and detailed planetary data powered by NASA JPL Horizons.",
  },
  {
    q: "What is the Venus Synodic Calendar?",
    a: "The Venus synodic cycle is the roughly 585-day period it takes Venus to return to the same position relative to the Sun as seen from Earth. Venus Tracker divides this cycle into 13 months of 45 days each, tracking where we are in Venus's journey as Morning Star, Evening Star, and through its conjunctions.",
  },
  {
    q: "How does the Sky Finder work?",
    a: "Sky Finder uses your device's compass and motion sensors along with AR to point you toward Venus in real time. Just hold up your phone and follow the on-screen guide — when Venus is above the horizon, you'll see its position overlaid on your camera view.",
  },
  {
    q: "Does the app collect my data?",
    a: "No. Venus Tracker does not collect, transmit, or store any personal data. Your location is used on-device only to calculate Venus's position. The camera is used solely for the AR viewfinder — no images are captured or saved. There are no analytics, cookies, tracking, or advertising of any kind.",
  },
  {
    q: "What are the Venus holidays?",
    a: "Venus Tracker celebrates eight holidays throughout the synodic cycle: Superior Conjunction, First Apparition (Evening), Evening Star Peak, Greatest Brilliance (Evening), Inferior Conjunction, First Apparition (Morning), Morning Star Peak, and Greatest Brilliance (Morning). Each marks a key moment in Venus's journey.",
  },
  {
    q: "How is the news feed curated?",
    a: "The news feed pulls from Google News RSS using astronomy and astrology search queries related to Venus. Articles are fetched anonymously with no personal information sent. The feed updates automatically so you always have fresh Venus-related content.",
  },
];

const privacyPoints = [
  "Location data is used on-device only and never transmitted to any server.",
  "The camera is used solely for the AR viewfinder — no images are captured or stored.",
  "News articles are fetched anonymously with no personal information attached.",
  "No analytics, telemetry, or usage data is collected.",
  "Third-party services (Nominatim for geocoding, NASA JPL Horizons for ephemeris data) receive no personally identifiable information.",
  "There are no cookies, tracking pixels, or advertising of any kind.",
];

export default function VenusTrackerSupport() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1a1510 0%, #0f0d0a 100%)",
        color: "#f5f0e8",
        fontFamily: "var(--font-geist), system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "64px 24px 96px",
        }}
      >
        {/* Header */}
        <header style={{ marginBottom: 56 }}>
          <h1
            style={{
              fontFamily: "var(--font-spline-sans), system-ui, sans-serif",
              fontSize: "2.5rem",
              fontWeight: 700,
              color: "#f5f0e8",
              marginBottom: 8,
              lineHeight: 1.15,
            }}
          >
            Venus Tracker
          </h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: "#b8a88a",
              marginBottom: 4,
            }}
          >
            Astronomy &amp; astrology companion for Venus
          </p>
          <p style={{ fontSize: "0.925rem", color: "#8a7e6b" }}>
            by Joshua Harrington
          </p>
        </header>

        {/* Contact */}
        <section style={{ marginBottom: 48 }}>
          <SectionHeading>Contact &amp; Support</SectionHeading>
          <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "#d4cabb" }}>
            For questions, feedback, or support requests, reach out at{" "}
            <a
              href="mailto:digitalsov2026@gmail.com"
              style={{
                color: "#c9b97a",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              digitalsov2026@gmail.com
            </a>
          </p>
        </section>

        {/* Privacy */}
        <section style={{ marginBottom: 48 }}>
          <SectionHeading>Privacy</SectionHeading>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {privacyPoints.map((point) => (
              <li
                key={point}
                style={{
                  fontSize: "0.95rem",
                  lineHeight: 1.65,
                  color: "#d4cabb",
                  paddingLeft: 20,
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    color: "#7a8a6b",
                  }}
                >
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section>
          <SectionHeading>FAQ</SectionHeading>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 32,
            }}
          >
            {faqs.map(({ q, a }) => (
              <div key={q}>
                <h3
                  style={{
                    fontFamily:
                      "var(--font-spline-sans), system-ui, sans-serif",
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: "#f5f0e8",
                    marginBottom: 8,
                  }}
                >
                  {q}
                </h3>
                <p
                  style={{
                    fontSize: "0.95rem",
                    lineHeight: 1.7,
                    color: "#d4cabb",
                  }}
                >
                  {a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-spline-sans), system-ui, sans-serif",
        fontSize: "1.35rem",
        fontWeight: 600,
        color: "#c9b97a",
        marginBottom: 20,
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </h2>
  );
}
