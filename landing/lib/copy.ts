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
      "A job hunting tool that runs on your own laptop. Finds roles, shows you why they fit, and writes a resume from things you actually did.",
  },

  nav: {
    links: [
      { href: "#what", label: "What it does" },
      { href: "#local", label: "Why local" },
      { href: "#install", label: "Run it" },
      { href: "#wall", label: "The wall" },
    ],
    cta: "Join the wall",
  },

  hero: {
    // Sits above the wordmark, small, so the joke has something to land against.
    eyebrow: "For students doing an off campus job hunt",
    tagline: "Job hunting is a full time job. Nobody pays you for it.",
    sub: "This does the boring half. It reads job boards, scores every role against what you have actually done, and writes the resume. All of it on your own laptop, for free.",
    primary: "Put yourself on the wall",
    secondary: "See how it works",
    counting: (n: number) =>
      n === 1 ? "1 person on the wall" : `${n} people on the wall`,
    scroll: "Scroll",
  },

  problem: {
    heading: "You already know how this goes",
    lines: [
      "You open LinkedIn, there are two hundred new posts, and maybe six are for people with your experience.",
      "You rewrite the same resume for the fourth time this week because this one says React and yours says frontend.",
      "You send out twelve applications on a Sunday night and then never find out what happened to any of them.",
    ],
    closer:
      "None of that is hard. It is just slow, and it eats the hours you were going to spend actually building something.",
  },

  what: {
    heading: "What it does",
    items: [
      {
        title: "Finds the jobs",
        body: "Reads careers pages directly from ninety plus companies on Greenhouse, Lever, Ashby and SmartRecruiters. Search any company by name and it gets added. No feed, no promoted posts, no ghost listings from March.",
      },
      {
        title: "Tells you why, not just how much",
        body: "Every role gets a score out of a hundred, and you can open the score. Which required skills you have, which you do not, how close the match actually is. If a job got dropped, it says which rule dropped it.",
      },
      {
        title: "Writes a resume you can defend",
        body: "It rewrites your real accomplishments for the specific job. Every bullet links back to the thing you actually did, and any number the model invents gets thrown out before you ever see it. Paste in your own Overleaf resume and it edits that instead of handing you a template.",
      },
      {
        title: "Keeps track",
        body: "What you sent, where it went, what came back. Plus who to message at the company and a first line that is not generic.",
      },
    ],
  },

  local: {
    heading: "It runs on your laptop",
    body: "There is no account and there is nothing to sign into. The language model runs on your machine through Ollama, the database is a container on your disk, and your resume never gets uploaded anywhere. The only requests it makes are to public job boards, which is the same thing that happens when you open a careers page yourself.",
    aside:
      "That is also why it is free. There is no server bill because there is no server.",
  },

  install: {
    heading: "Getting it running",
    intro:
      "Fifteen minutes, and most of that is a model download you can walk away from. You need Docker installed.",
    steps: [
      {
        title: "Clone it",
        command: "git clone https://github.com/YOUR_GITHUB/unemployed.git",
        note: "Then open the folder in a terminal.",
      },
      {
        title: "Start it",
        command: "docker compose --profile app up -d",
        note: "Brings up Postgres, Ollama and the app.",
      },
      {
        title: "Pull a model",
        command: "docker exec jobsearch-ollama ollama pull llama3.2:3b",
        note: "About 2 GB, once. On 16 GB of RAM you can use llama3.1:8b instead and get better writing.",
      },
    ],
    // Split so the port can be a real link without slicing the sentence apart
    // at render time.
    outroBefore: "Then open",
    outroAfter: "and fill in the four setup steps it shows you.",
    port: "http://localhost:3000",
    portLabel: "localhost:3000",
  },

  join: {
    heading: "Put yourself on the wall",
    body: "Pick a name, where you are, and a face. That is the whole thing. No email, nothing gets sent to you, and there is nothing to log into later.",
    why: "It is here so the next person who lands on this page can see somebody else is doing the same grind.",
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
    joinedBody: "Scroll down, you are the first one there.",
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
    built: "Built by a student who was job hunting and got tired of doing this by hand.",
    repo: "Source on GitHub",
    licence: "MIT licensed",
    avatars: "Avatars by DiceBear, Open Peeps style, CC0",
  },
} as const;
