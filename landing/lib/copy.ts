/**
 * Every user-facing string on this page, in one file.
 *
 * Two reasons it lives here rather than inline in JSX. The em dash check has a
 * single file to walk, and a tone pass is one diff instead of a hunt through
 * components.
 *
 * Rules for anything added here: no em dash, no en dash, no double hyphen
 * standing in for a dash, no ellipsis character. `scripts/check-copy.mjs`
 * enforces that and the build runs it.
 */
export const copy = {
  meta: {
    title: "unemployed",
    description:
      "A free job hunting tool that runs on your own laptop. Finds roles, shows you why they fit, and writes a resume from things you actually did.",
  },

  nav: {
    links: [
      { href: "/#story", label: "Why" },
      { href: "/#what", label: "What it does" },
      { href: "/#local", label: "Your laptop" },
      { href: "/#wall", label: "The wall" },
      { href: "/experiences", label: "Interview experiences" },
    ],
    cta: "Join the wall",
  },

  hero: {
    badge: "Free forever. No account. Runs on your laptop.",
    tagline: "Job hunting is a full time job.",
    taglineEmphasis: "Nobody pays you for it.",
    sub: "So this does the boring half. It finds the roles, scores them against what you have actually done, and writes the resume.",
    primary: "Get started",
    secondary: "See what it does",
    counting: (n: number) =>
      n === 1 ? "1 person on the wall" : `${n} people on the wall`,
    scroll: "Scroll",
  },

  story: {
    label: "Why this exists",
    heading: "I built this because I was the one job hunting.",
    body: [
      "Final year, off campus, and the whole thing was manual. Open twenty career pages, read the same job description written five different ways, guess whether I stood a chance, then rewrite my resume for the fourth time that week.",
      "The part that got me was how little of it was thinking. It was tab management. So I spent my evenings building the thing I wanted to exist, and then I used it to apply to the jobs it found.",
    ],
    kicker: "It is open source because there is no reason it should not be.",
  },

  what: {
    label: "What it does",
    heading: "Four things, done properly.",
    items: [
      {
        title: "Builds your pipeline",
        body: "Reads careers pages straight from ninety plus companies on Greenhouse, Lever, Ashby and SmartRecruiters. Search any company to add it, or just upload a JD you found elsewhere.",
        detail: "No feed, no promoted posts, no listings that closed in March.",
      },
      {
        title: "Shows the arithmetic",
        body: "Every role gets a score out of a hundred. It cross-references the job description with your personal knowledge base to show exactly which skills you have and which you lack.",
        detail: "Filtered a job out? It names the exact rule that did it.",
      },
      {
        title: "Generates targeted resumes",
        body: "It writes a tailored resume using only facts from your knowledge base. Every bullet traces back to something you actually did, so you can defend it in an interview. No hallucinations.",
        detail: "Paste your own Overleaf resume and it edits that, not a generic template.",
      },
      {
        title: "Automates the outreach",
        body: "Tracks what you sent and what came back. It also figures out exactly who to message at the company and drafts a highly personalized opening line to get their attention.",
        detail: "Everything stays organized in one place, locally on your machine.",
      },
    ],
  },

  local: {
    label: "Your laptop",
    heading: "Your resume never leaves your machine.",
    body: "No account, nothing to log into, no API key to buy. The model runs locally through Ollama and the database is a container on your own disk. The only requests it makes are to public job boards, which is what happens when you open a careers page yourself.",
    points: [
      { title: "Free", body: "There is no server bill, because there is no server." },
      { title: "Private", body: "Your career history sits in a database only you can reach." },
      { title: "Yours", body: "Read it, change it, keep it." },
    ],
  },

  install: {
    label: "Getting it running",
    heading: "Two commands.",
    locked: "Add yourself to the wall and the setup steps open up.",
    intro:
      "Fifteen minutes, and most of that is a download you can walk away from. No database to install, and no Docker — you need Python, Node and Ollama.",
    steps: [
      {
        title: "Clone it",
        command: "git clone https://github.com/Maan-Teckwani/unemployed.git",
        note: "Then open the folder in a terminal.",
      },
      {
        title: "Run it",
        command: "powershell -ExecutionPolicy Bypass -File .\\run.ps1",
        note: "On macOS or Linux: ./run.sh — the same script. It installs what's missing, downloads the model (~2 GB, once), sets up the database and starts everything. Run the same command every time after; it skips straight to launching.",
      },
    ],
    outroBefore: "Then open",
    outroAfter: "and work through the four setup steps it shows you.",
    port: "http://localhost:3000",
    portLabel: "localhost:3000",
    windows: {
      tab: "Windows, no command line",
      body: "One download. It checks for Docker, installs it if you don't have it, pulls everything, and opens the app when it's ready.",
      cta: "Download install.exe",
      href: "https://github.com/Maan-Teckwani/unemployed/releases/latest/download/install.exe",
      note: "Windows will warn you it's from an unrecognized publisher. That's expected for a project run by one person with no code signing budget. Click 'More info', then 'Run anyway'.",
    },
    noDocker: {
      heading: "Rather do it by hand?",
      steps: [
        {
          title: "Get the model",
          command: "ollama pull llama3.2:3b",
          note: "You will also need Node 20+ and Python 3.10+. There is no database to install — the app creates a SQLite file.",
        },
        {
          title: "Start Backend",
          command: "cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && alembic upgrade head && uvicorn app.main:app --port 8000",
          note: "On Windows, use .venv\\Scripts\\Activate.ps1",
        },
        {
          title: "Start Frontend",
          command: "cd web && npm install && npm run dev",
          note: "Run this in a new terminal window.",
        },
      ],
    },
  },

  join: {
    label: "The wall",
    heading: "Put yourself on the wall.",
    body: "A name, where you are, and a face. No email, nothing gets sent to you, and there is nothing to log into later.",
    why: "It is here so the next person landing on this page can see they are not the only one doing this.",
    nameLabel: "What should we call you",
    namePlaceholder: "first name + last name",
    countryLabel: "Where are you",
    genderLabel: "Avatar",
    genderOptions: {
      female: "Female",
      male: "Male",
      neutral: "Rather not say",
    },
    reroll: "Try another face",
    submit: "Join the wall",
    submitting: "Adding you",
    joined: "You are on the wall",
    joinedBody: "Look up, you are in the crowd behind the headline. The setup steps are open now.",
    errors: {
      empty: "Needs a name, any name.",
      tooLong: "Twenty four characters or fewer.",
      profane: "Pick something else.",
      country: "Pick a country.",
      rateLimited: "That is a few too many. Try again in ten minutes.",
      generic: "That did not go through. Try again in a moment.",
    },
  },

  wall: {
    heading: "Who else is here",
    empty: "Nobody yet. You can be first.",
    caption: (n: number) =>
      n === 1 ? "1 person is running this" : `${n} people are running this`,
    offline: "Cannot reach the wall right now.",
  },

  experiences: {
    label: "Interview experiences",
    heading: "What actually got asked.",
    body: "Structured reports from people on the wall. Company, role, and a round by round breakdown of what happened.",
    filterLabel: "Filter by company",
    filterPlaceholder: "Type a company name",
    empty: "Nobody has posted one yet. You can be first.",
    noMatches: (company: string) => `Nobody has posted about ${company} yet.`,
    postCta: "Share your experience",
    locked: "Join the wall to share or read the full detail.",
    resultLabels: {
      offer: "Offer",
      rejected: "Rejected",
      withdrawn: "Withdrew",
      pending: "In progress",
    },
    roundTypeLabels: {
      oa: "Online assessment",
      technical: "Technical",
      system_design: "System design",
      hr: "HR",
      managerial: "Managerial",
      group_discussion: "Group discussion",
      other: "Other",
    },
    outcomeLabels: {
      cleared: "Cleared",
      rejected: "Rejected",
      pending: "Pending",
    },
    flag: "Report",
    flagged: "Reported",
    form: {
      companyLabel: "Company",
      companyPlaceholder: "e.g. Freshworks",
      roleLabel: "Role",
      rolePlaceholder: "e.g. SDE 1",
      resultLabel: "Result",
      summaryLabel: "Summary",
      summaryPlaceholder: "How the process went overall",
      roundsLabel: "Rounds",
      roundTypeLabel: "Type",
      roundDescriptionLabel: "What happened",
      roundOutcomeLabel: "Outcome",
      addRound: "Add another round",
      removeRound: "Remove",
      submit: "Post",
      submitting: "Posting",
      posted: "Posted. Thanks for sharing.",
      errors: {
        empty: "This field can't be empty.",
        tooLong: "That's too long.",
        profane: "Pick different words.",
        rounds: "Fill in every round properly.",
        mustJoinWall: "Join the wall first, then come back to post.",
        rateLimited: "That's a few too many. Try again later.",
        generic: "That did not go through. Try again in a moment.",
      },
    },
  },

  footer: {
    built: "Built by a student who was job hunting and got tired of doing it by hand.",
    repo: "Source on GitHub",
    licence: "MIT licensed",
    avatars: "Avatars by DiceBear, Open Peeps, CC0",
  },
} as const;
