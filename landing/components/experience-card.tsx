"use client";

import { useState } from "react";

import { AvatarImage } from "./avatar";
import { copy } from "@/lib/copy";
import type { ExperienceRow } from "@/lib/db";

export function ExperienceCard({ experience }: { experience: ExperienceRow }) {
  const [expanded, setExpanded] = useState(false);
  const [flagged, setFlagged] = useState(false);

  async function flag() {
    if (flagged) return;
    setFlagged(true);
    try {
      await fetch("/api/experiences/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experienceId: Number(experience.id) }),
      });
    } catch {
      // The button already reads "reported"; a failed request isn't worth
      // surfacing to someone who's just trying to flag a post.
    }
  }

  return (
    <li className="card">
      <div className="flex items-start gap-3">
        <AvatarImage seed={experience.seed} gender={experience.gender} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h3 className="font-serif text-xl leading-tight">{experience.company}</h3>
            <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap">
              {copy.experiences.resultLabels[experience.result as keyof typeof copy.experiences.resultLabels]}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {experience.role} &middot; {experience.name}
          </p>
          <p className="mt-3 text-sm leading-relaxed">{experience.summary}</p>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-muted-foreground hover:text-foreground mt-3 text-xs underline underline-offset-4"
          >
            {expanded ? "Hide rounds" : `${experience.rounds.length} round(s)`}
          </button>

          {expanded && (
            <ol className="mt-3 space-y-3 border-l pl-4">
              {experience.rounds.map((round) => (
                <li key={round.round_number}>
                  <div className="flex flex-wrap items-baseline gap-x-2 text-xs">
                    <span className="font-medium">
                      {String(round.round_number).padStart(2, "0")}.{" "}
                      {copy.experiences.roundTypeLabels[round.round_type as keyof typeof copy.experiences.roundTypeLabels]}
                    </span>
                    <span className="text-muted-foreground">
                      {copy.experiences.outcomeLabels[round.outcome as keyof typeof copy.experiences.outcomeLabels]}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {round.description}
                  </p>
                </li>
              ))}
            </ol>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-muted-foreground text-[11px]">
              {new Date(experience.created_at).toLocaleDateString()}
            </span>
            <button
              type="button"
              onClick={flag}
              disabled={flagged}
              className="text-muted-foreground hover:text-foreground text-xs disabled:opacity-50"
            >
              {flagged ? copy.experiences.flagged : copy.experiences.flag}
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
