const tools = [
  {
    name: "JSON Formatter",
    description: "Beautify, minify & validate JSON with syntax highlighting",
    icon: "{ }",
    href: "/tools/json-formatter",
    tag: "Popular",
  },
  {
    name: "Base64 Codec",
    description: "Encode and decode Base64 strings instantly",
    icon: "B64",
    href: "/tools/base64",
  },
  {
    name: "UUID Generator",
    description: "Generate v4 UUIDs with bulk & formatted output",
    icon: "#id",
    href: "/tools/uuid",
  },
  {
    name: "Regex Tester",
    description: "Test regular expressions with real-time match highlighting",
    icon: ".*",
    href: "/tools/regex",
    tag: "Popular",
  },
  {
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes",
    icon: "###",
    href: "/tools/hash",
  },
  {
    name: "Color Converter",
    description: "Convert between HEX, RGB, HSL, and CSS color formats",
    icon: "🎨",
    href: "/tools/color",
  },
  {
    name: "JWT Decoder",
    description: "Decode and inspect JSON Web Tokens",
    icon: "JWT",
    href: "/tools/jwt",
  },
  {
    name: "URL Encoder",
    description: "Encode and decode URL components safely",
    icon: "%20",
    href: "/tools/url-encoder",
  },
  {
    name: "Diff Checker",
    description: "Compare two blocks of text side by side",
    icon: "±",
    href: "/tools/diff",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* ===== Hero Section ===== */}
      <section className="relative overflow-hidden">
        {/* Gradient mesh background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, var(--accent-glow), transparent)",
          }}
        />

        <div className="relative mx-auto max-w-4xl px-6 pb-20 pt-24 text-center sm:pb-28 sm:pt-32">
          {/* Badge */}
          <div className="animate-fade-in mb-8 inline-flex items-center gap-2 rounded-full border border-border-accent bg-accent-subtle px-4 py-1.5 text-sm font-medium text-accent">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            100% free · No signup · No tracking
          </div>

          {/* Heading */}
          <h1 className="animate-fade-in-up mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight text-fg-primary sm:text-5xl md:text-6xl">
            Developer micro-tools
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--accent), #a78bfa, #f472b6)",
              }}
            >
              that just work.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up delay-2 mx-auto mt-6 max-w-xl text-lg leading-relaxed text-fg-secondary sm:text-xl">
            A curated collection of fast, privacy-first tools built for
            developers. No ads, no data collection — runs entirely in your
            browser.
          </p>

          {/* CTA */}
          <div className="animate-fade-in-up delay-3 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="#tools"
              className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-accent px-8 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-accent-hover hover:shadow-xl"
              id="cta-explore"
            >
              <span>Explore Tools</span>
              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </a>
          </div>

          {/* Stats */}
          <div className="animate-fade-in-up delay-4 mt-16 grid grid-cols-3 gap-8 border-t border-border-primary pt-10">
            {[
              { value: `${tools.length}+`, label: "Tools" },
              { value: "0ms", label: "Server Calls" },
              { value: "100%", label: "Client-Side" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-2xl font-bold text-fg-primary sm:text-3xl">
                  {stat.value}
                </span>
                <span className="mt-1 text-sm text-fg-tertiary">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Tool Grid ===== */}
      <section id="tools" className="scroll-mt-20 bg-bg-secondary">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-fg-primary sm:text-4xl">
              All Tools
            </h2>
            <p className="mt-3 text-fg-tertiary">
              Click any tool to get started — no setup required.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, i) => (
              <a
                key={tool.name}
                href={tool.href}
                className={`animate-fade-in-up delay-${Math.min(i + 1, 6)} group relative flex flex-col gap-3 rounded-2xl border border-border-primary bg-bg-elevated p-6 transition-all duration-300 hover:border-border-accent hover:shadow-lg hover:-translate-y-0.5`}
                id={`tool-${tool.href.split("/").pop()}`}
              >
                {/* Tag */}
                {tool.tag && (
                  <span className="absolute right-4 top-4 rounded-full bg-accent-subtle px-2.5 py-0.5 text-xs font-medium text-accent">
                    {tool.tag}
                  </span>
                )}

                {/* Icon */}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bg-subtle font-mono text-sm font-bold text-fg-secondary transition-colors duration-300 group-hover:bg-accent-subtle group-hover:text-accent">
                  {tool.icon}
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-base font-semibold text-fg-primary">
                    {tool.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-fg-tertiary">
                    {tool.description}
                  </p>
                </div>

                {/* Arrow */}
                <div className="mt-auto flex items-center text-sm font-medium text-accent opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <span>Open tool</span>
                  <svg
                    className="ml-1 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Features / Why Section ===== */}
      <section className="bg-bg-primary">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-fg-primary sm:text-4xl">
              Built different.
            </h2>
            <p className="mt-3 text-fg-tertiary">
              No compromises on speed, privacy, or developer experience.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                    />
                  </svg>
                ),
                title: "Instant",
                desc: "Every tool runs client-side with zero network latency. Your data never leaves your browser.",
              },
              {
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                ),
                title: "Private",
                desc: "No analytics, no cookies, no tracking. Open source and auditable. Your data stays yours.",
              },
              {
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                    />
                  </svg>
                ),
                title: "Developer-First",
                desc: "Keyboard shortcuts, dark mode, monospace fonts where it matters. Designed by devs, for devs.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center rounded-2xl border border-border-secondary bg-bg-secondary p-8 text-center transition-all duration-300 hover:border-border-primary hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-subtle text-accent">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-fg-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-tertiary">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
