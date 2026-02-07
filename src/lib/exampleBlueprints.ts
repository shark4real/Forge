/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Example AI Responses
 *
 * Pre-baked UIBlueprint outputs for each required demo prompt.
 * These are used as fallback when Tambo Cloud is unavailable (no API key)
 * and as reference examples that demonstrate the expected AI output shape.
 * ════════════════════════════════════════════════════════════════════════
 */

import type { UIBlueprint } from "../types/blueprint";

/* ── 1. Habit Tracking App ─────────────────────────────────────────── */

export const habitTrackerBlueprint: UIBlueprint = {
  appType: "tracker",
  layout: "sidebar-detail",
  sections: [
    {
      id: "shell",
      components: [
        {
          componentName: "AppShell",
          props: {
            appName: "HabitFlow",
            tagline: "Build better habits, one day at a time",
            accentColor: "#22c55e",
            showSidebar: true,
            sidebarItems: ["Dashboard", "My Habits", "Statistics", "Streaks", "Settings"],
          },
        },
      ],
    },
    {
      id: "stats",
      heading: "Today's Overview",
      components: [
        {
          componentName: "StatsRow",
          props: {
            accentColor: "#22c55e",
            stats: [
              { label: "Completed", value: "5/8", change: "+2 vs yesterday", trend: "up" },
              { label: "Streak", value: "12 days", change: "Personal best!", trend: "up" },
              { label: "Consistency", value: "87%", change: "+3%", trend: "up" },
              { label: "Total Habits", value: "8", trend: "neutral" },
            ],
          },
        },
      ],
    },
    {
      id: "habits",
      heading: "My Habits",
      components: [
        {
          componentName: "CardList",
          props: {
            accentColor: "#22c55e",
            layout: "vertical",
            cards: [
              { title: "Morning Meditation", badge: "✅ Done", description: "10 min guided session", metadata: "7:00 AM · Streak: 12 days" },
              { title: "Exercise", badge: "✅ Done", description: "30 min workout", metadata: "8:00 AM · Streak: 8 days" },
              { title: "Read 20 Pages", badge: "⏳ Pending", description: "Currently: Atomic Habits", metadata: "Due by 9:00 PM" },
              { title: "Drink 8 Glasses of Water", badge: "6/8", description: "Stay hydrated!", metadata: "Ongoing" },
              { title: "Journal", badge: "⏳ Pending", description: "Reflect on the day", metadata: "Due by 10:00 PM" },
            ],
          },
        },
      ],
    },
    {
      id: "weekly-chart",
      heading: "Weekly Progress",
      components: [
        {
          componentName: "ChartView",
          props: {
            title: "Habits Completed per Day",
            type: "bar",
            accentColor: "#22c55e",
            data: [
              { label: "Mon", value: 6 },
              { label: "Tue", value: 7 },
              { label: "Wed", value: 5 },
              { label: "Thu", value: 8 },
              { label: "Fri", value: 7 },
              { label: "Sat", value: 4 },
              { label: "Sun", value: 5 },
            ],
          },
        },
      ],
    },
  ],
  state: [
    { name: "habits", type: "Habit[]", example: [{ id: 1, name: "Meditate", completed: true }] },
    { name: "currentStreak", type: "number", example: 12 },
  ],
  styleHints: {
    accentColor: "#22c55e",
    darkMode: true,
    density: "normal",
  },
  explanation: {
    reasoning:
      "A habit tracker benefits from a sidebar-detail layout so users can navigate between dashboard, habits list, and stats. I used StatsRow for at-a-glance KPIs, CardList for the habit entries with status badges, and ChartView for weekly progress visualization.",
    componentRationale: {
      shell: "AppShell with sidebar provides app-like navigation between sections",
      stats: "StatsRow shows key metrics (completion rate, streak, consistency) at a glance",
      habits: "CardList with vertical layout gives each habit its own card with status badges",
      "weekly-chart": "Bar chart shows daily completion counts for the past week",
    },
    suggestedImprovements: [
      "Add a habit creation form with FormBuilder",
      "Include a monthly heatmap calendar view",
      "Add user profiles for accountability partners",
      "Add a settings panel for notification preferences",
    ],
  },
};

/* ── 2. SaaS Landing Page with Pricing ─────────────────────────────── */

export const saasLandingBlueprint: UIBlueprint = {
  appType: "landing-page",
  layout: "multi-section",
  sections: [
    {
      id: "nav",
      components: [
        {
          componentName: "NavigationBar",
          props: {
            brand: "CloudSync",
            links: ["Features", "Pricing", "Docs", "Blog"],
            ctaLabel: "Start Free Trial",
            accentColor: "#6366f1",
          },
        },
      ],
    },
    {
      id: "hero",
      components: [
        {
          componentName: "HeroSection",
          props: {
            headline: "Sync your data across every cloud",
            subheading:
              "CloudSync unifies your data pipelines with one API. Stop wrestling with integrations — ship features instead.",
            primaryCta: "Start Free Trial",
            secondaryCta: "Watch Demo",
            accentColor: "#6366f1",
            backgroundStyle: "gradient",
          },
        },
      ],
    },
    {
      id: "features",
      components: [
        {
          componentName: "FeatureGrid",
          props: {
            heading: "Everything you need to sync at scale",
            accentColor: "#6366f1",
            columns: 3,
            features: [
              { icon: "⚡", title: "Real-time Sync", description: "Sub-second data propagation across all connected services." },
              { icon: "🔒", title: "Enterprise Security", description: "SOC 2 Type II certified with end-to-end encryption." },
              { icon: "📊", title: "Smart Analytics", description: "Built-in dashboards to monitor data flow and health." },
              { icon: "🔌", title: "200+ Integrations", description: "Connect to databases, SaaS tools, and cloud providers." },
              { icon: "🚀", title: "One-click Deploy", description: "Go from zero to production in under 5 minutes." },
              { icon: "🛟", title: "24/7 Support", description: "Dedicated support engineers available around the clock." },
            ],
          },
        },
      ],
    },
    {
      id: "pricing",
      components: [
        {
          componentName: "PricingTable",
          props: {
            heading: "Simple, transparent pricing",
            accentColor: "#6366f1",
            tiers: [
              {
                name: "Starter",
                price: "Free",
                features: ["1,000 syncs/month", "3 integrations", "Community support", "Basic analytics"],
                ctaLabel: "Get Started",
              },
              {
                name: "Pro",
                price: "$49",
                period: "month",
                highlighted: true,
                features: ["50,000 syncs/month", "Unlimited integrations", "Priority support", "Advanced analytics", "Team collaboration"],
                ctaLabel: "Start Free Trial",
              },
              {
                name: "Enterprise",
                price: "$199",
                period: "month",
                features: ["Unlimited syncs", "Custom integrations", "Dedicated support", "SLA guarantee", "SSO & RBAC", "On-premise option"],
                ctaLabel: "Contact Sales",
              },
            ],
          },
        },
      ],
    },
    {
      id: "footer",
      components: [
        {
          componentName: "Footer",
          props: {
            brand: "CloudSync",
            accentColor: "#6366f1",
            columns: [
              { heading: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { heading: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { heading: "Legal", links: ["Privacy", "Terms", "Security"] },
            ],
            copyright: "© 2026 CloudSync Inc. All rights reserved.",
          },
        },
      ],
    },
  ],
  styleHints: { accentColor: "#6366f1", density: "spacious" },
  explanation: {
    reasoning:
      "A SaaS landing page follows a classic multi-section layout: nav → hero → features → pricing → footer. Each section maps directly to a registry component designed for that purpose.",
    componentRationale: {
      nav: "NavigationBar with CTA button for conversion",
      hero: "HeroSection with gradient background and dual CTAs for engagement",
      features: "FeatureGrid with 6 items in 3 columns for easy scanning",
      pricing: "PricingTable with 3 tiers, Pro highlighted as recommended",
      footer: "Footer with organized link columns and copyright",
    },
    suggestedImprovements: [
      "Add customer testimonial cards",
      "Include a comparison table vs competitors",
      "Add an FAQ section",
      "Include social proof stats (e.g., '10,000+ teams trust CloudSync')",
    ],
  },
};

/* ── 3. Personal Finance Tracker ───────────────────────────────────── */

export const financeTrackerBlueprint: UIBlueprint = {
  appType: "dashboard",
  layout: "dashboard",
  sections: [
    {
      id: "header",
      components: [
        {
          componentName: "NavigationBar",
          props: {
            brand: "WealthLens",
            links: ["Overview", "Transactions", "Budgets", "Goals"],
            accentColor: "#f59e0b",
          },
        },
      ],
    },
    {
      id: "kpis",
      heading: "Financial Snapshot",
      components: [
        {
          componentName: "StatsRow",
          props: {
            accentColor: "#f59e0b",
            stats: [
              { label: "Net Worth", value: "$48,320", change: "+$2,150 this month", trend: "up" },
              { label: "Monthly Income", value: "$6,500", trend: "neutral" },
              { label: "Monthly Spend", value: "$4,350", change: "-8% vs last month", trend: "down" },
              { label: "Savings Rate", value: "33%", change: "+5%", trend: "up" },
            ],
          },
        },
      ],
    },
    {
      id: "spending-chart",
      heading: "Spending Breakdown",
      components: [
        {
          componentName: "ChartView",
          props: {
            title: "Expenses by Category",
            type: "pie",
            data: [
              { label: "Housing", value: 1500 },
              { label: "Food", value: 650 },
              { label: "Transport", value: 350 },
              { label: "Entertainment", value: 280 },
              { label: "Utilities", value: 220 },
              { label: "Shopping", value: 450 },
              { label: "Other", value: 900 },
            ],
          },
        },
      ],
    },
    {
      id: "transactions",
      heading: "Recent Transactions",
      components: [
        {
          componentName: "DataTable",
          props: {
            accentColor: "#f59e0b",
            columns: ["Date", "Description", "Category", "Amount"],
            rows: [
              { Date: "Feb 7", Description: "Whole Foods", Category: "Food", Amount: "-$82.40" },
              { Date: "Feb 6", Description: "Salary Deposit", Category: "Income", Amount: "+$3,250.00" },
              { Date: "Feb 6", Description: "Netflix", Category: "Entertainment", Amount: "-$15.99" },
              { Date: "Feb 5", Description: "Gas Station", Category: "Transport", Amount: "-$45.20" },
              { Date: "Feb 5", Description: "Amazon", Category: "Shopping", Amount: "-$67.30" },
              { Date: "Feb 4", Description: "Electric Bill", Category: "Utilities", Amount: "-$110.00" },
            ],
          },
        },
      ],
    },
    {
      id: "trend",
      heading: "Monthly Trend",
      components: [
        {
          componentName: "ChartView",
          props: {
            title: "Net Savings Over 6 Months",
            type: "line",
            accentColor: "#f59e0b",
            data: [
              { label: "Sep", value: 1200 },
              { label: "Oct", value: 1800 },
              { label: "Nov", value: 1400 },
              { label: "Dec", value: 900 },
              { label: "Jan", value: 2100 },
              { label: "Feb", value: 2150 },
            ],
          },
        },
      ],
    },
  ],
  state: [
    { name: "transactions", type: "Transaction[]", example: [{ id: 1, amount: -82.4, category: "Food" }] },
    { name: "netWorth", type: "number", example: 48320 },
  ],
  styleHints: { accentColor: "#f59e0b", darkMode: true, density: "normal" },
  explanation: {
    reasoning:
      "A personal finance tracker is best as a dashboard layout. KPI stats at the top give an instant snapshot, a pie chart breaks down spending categories, a data table shows recent transactions, and a trend line shows savings over time.",
    componentRationale: {
      header: "NavigationBar for switching between overview, transactions, budgets",
      kpis: "StatsRow for financial KPIs with trend indicators",
      "spending-chart": "Pie chart is perfect for category-based spending breakdown",
      transactions: "DataTable for structured transaction history",
      trend: "Line chart shows savings trend over months",
    },
    suggestedImprovements: [
      "Add budget goal progress bars",
      "Include a form for adding new transactions",
      "Add weekly vs monthly toggle for charts",
      "Include investment portfolio section",
    ],
  },
};

/* ── 4. "Make it mobile friendly" (modifier applied to habit tracker) ── */

export const mobileHabitTrackerBlueprint: UIBlueprint = {
  ...habitTrackerBlueprint,
  layout: "single-page",
  sections: [
    {
      id: "shell",
      components: [
        {
          componentName: "AppShell",
          props: {
            appName: "HabitFlow",
            tagline: "Build better habits, one day at a time",
            accentColor: "#22c55e",
            showSidebar: false, // removed sidebar for mobile
          },
        },
      ],
    },
    ...habitTrackerBlueprint.sections.slice(1),
  ],
  styleHints: {
    ...habitTrackerBlueprint.styleHints,
    density: "compact",
  },
  explanation: {
    reasoning:
      "For mobile-friendly layout: removed the sidebar (replaced with top header), switched to single-page layout, and set density to compact to reduce whitespace on small screens. All content remains accessible via scrolling.",
    componentRationale: {
      shell: "Switched from sidebar to top-bar AppShell layout for narrow screens",
      stats: "StatsRow grid auto-adapts to 2 columns on mobile",
      habits: "Vertical CardList works naturally on mobile — full-width cards",
      "weekly-chart": "Bar chart scales responsively with SVG viewBox",
    },
    suggestedImprovements: [
      "Add a bottom tab navigation bar",
      "Implement swipe gestures for completing habits",
      "Add pull-to-refresh for data updates",
    ],
  },
};

/* ── 5. "Add user profiles" (modifier applied to habit tracker) ───── */

export const habitTrackerWithProfilesBlueprint: UIBlueprint = {
  ...habitTrackerBlueprint,
  sections: [
    ...habitTrackerBlueprint.sections,
    {
      id: "profile",
      heading: "Your Profile",
      components: [
        {
          componentName: "UserProfile",
          props: {
            name: "Alex Johnson",
            email: "alex@example.com",
            role: "Premium Member",
            bio: "On a 12-day streak! Focused on building morning routines and daily exercise habits.",
            accentColor: "#22c55e",
          },
        },
      ],
    },
    {
      id: "profile-settings",
      heading: "Profile Settings",
      components: [
        {
          componentName: "SettingsPanel",
          props: {
            accentColor: "#22c55e",
            settings: [
              { label: "Push Notifications", type: "toggle", value: true, description: "Daily reminders for pending habits" },
              { label: "Weekly Report", type: "toggle", value: true, description: "Email summary every Sunday" },
              { label: "Display Name", type: "text", value: "Alex Johnson" },
              { label: "Timezone", type: "select", value: "PST", options: ["EST", "CST", "MST", "PST", "UTC"] },
            ],
          },
        },
      ],
    },
  ],
  explanation: {
    reasoning:
      "Added user profiles to the existing habit tracker: a UserProfile card showing the user's identity and streak, plus a SettingsPanel for profile-related preferences. All previous sections are preserved.",
    componentRationale: {
      ...habitTrackerBlueprint.explanation!.componentRationale,
      profile: "UserProfile card shows avatar, name, role, and a bio highlighting their streak",
      "profile-settings": "SettingsPanel provides profile configuration with toggles and inputs",
    },
    suggestedImprovements: [
      "Add a friends/accountability partners list",
      "Include achievement badges",
      "Add profile photo upload",
      "Add social sharing for streaks",
    ],
  },
};

/* ── Prompt → Blueprint mapping ────────────────────────────────────── */

export const demoBlueprints: Record<string, UIBlueprint> = {
  "habit": habitTrackerBlueprint,
  "saas": saasLandingBlueprint,
  "finance": financeTrackerBlueprint,
  "mobile": mobileHabitTrackerBlueprint,
  "profile": habitTrackerWithProfilesBlueprint,
};

/**
 * Match a user prompt to a demo blueprint. Returns null if no match,
 * letting the AI generate a fresh one.
 */
export function matchDemoBlueprint(prompt: string): UIBlueprint | null {
  const lower = prompt.toLowerCase();

  if (lower.includes("habit") && !lower.includes("mobile") && !lower.includes("profile")) {
    return habitTrackerBlueprint;
  }
  if (lower.includes("saas") || (lower.includes("landing") && lower.includes("pricing"))) {
    return saasLandingBlueprint;
  }
  if (lower.includes("finance") || lower.includes("personal") && lower.includes("track")) {
    return financeTrackerBlueprint;
  }
  if (lower.includes("mobile")) {
    return mobileHabitTrackerBlueprint;
  }
  if (lower.includes("profile")) {
    return habitTrackerWithProfilesBlueprint;
  }

  return null;
}
