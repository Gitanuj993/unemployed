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
      { href: "#story", label: "Why" },
      { href: "#what", label: "What it does" },
      { href: "#local", label: "Your laptop" },
      { href: "#wall", label: "The wall" },
    ],
    cta: "Join the wall",
  },

  hero: {
    badge: "Free forever. No account. Runs on your laptop.",
    tagline: "Job hunting is a full time job.",
    taglineEmphasis: "Nobody pays you for it.",
    sub: "So this does the boring half. It finds the roles, scores them against what you have actually done, and writes the resume.",
    primary: "Put yourself on the wall",
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
        title: "Finds the jobs",
        body: "Reads careers pages straight from ninety plus companies on Greenhouse, Lever, Ashby and SmartRecruiters. Search any company by name to add it.",
        detail: "No feed, no promoted posts, no listings that closed in March.",
      },
      {
        title: "Shows the arithmetic",
        body: "Every role gets a score out of a hundred and you can open it. Which required skills you have, which you do not, and how close the match really is.",
        detail: "Filtered a job out? It names the rule that did it.",
      },
      {
        title: "Writes a resume you can defend",
        body: "It rewrites your real accomplishments for the specific job. Every bullet traces back to something you actually did, and invented numbers get thrown out before you see them.",
        detail: "Paste your own Overleaf resume and it edits that, not a template.",
      },
      {
        title: "Keeps track",
        body: "What you sent, where it went, what came back. Plus who to message at the company and an opening line that is not generic.",
        detail: "Nothing is scraped. You run the search yourself.",
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
      { title: "Yours", body: "MIT licensed. Read it, change it, keep it." },
    ],
  },

  install: {
    label: "Getting it running",
    heading: "Three commands.",
    locked: "Add yourself to the wall and the setup steps open up.",
    intro: "Fifteen minutes, and most of that is a download you can walk away from. You need Docker.",
    steps: [
      {
        title: "Clone it",
        command: "git clone https://github.com/YOUR_GITHUB/unemployed.git",
        note: "Then open the folder in a terminal.",
      },
      {
        title: "Start it",
        command: "docker compose --profile app up -d",
        note: "Postgres, Ollama and the app, all in containers.",
      },
      {
        title: "Pull a model",
        command: "docker exec jobsearch-ollama ollama pull llama3.2:3b",
        note: "About 2 GB, once. With 16 GB of RAM use llama3.1:8b for better writing.",
      },
    ],
    outroBefore: "Then open",
    outroAfter: "and work through the four setup steps it shows you.",
    port: "http://localhost:3000",
    portLabel: "localhost:3000",
  },

  join: {
    label: "The wall",
    heading: "Put yourself on the wall.",
    body: "A name, where you are, and a face. No email, nothing gets sent to you, and there is nothing to log into later.",
    why: "It is here so the next person landing on this page can see they are not the only one doing this.",
    nameLabel: "What should we call you",
    namePlaceholder: "first name is fine",
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

  footer: {
    built: "Built by a student who was job hunting and got tired of doing it by hand.",
    repo: "Source on GitHub",
    licence: "MIT licensed",
    avatars: "Avatars by DiceBear, Open Peeps, CC0",
  },
} as const;
