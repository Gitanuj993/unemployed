"use client";

import { avatarSrc } from "./avatar";
import { countryName } from "@/lib/countries.ts";
import type { SignupRow } from "@/lib/db";

/**
 * The people, scattered behind the headline.
 *
 * Everyone who has joined is on screen when the page opens, which does the
 * arguing a testimonial section would otherwise have to do.
 *
 * Scattered rather than gridded, for one practical reason: a grid of 27 faces
 * on a wide screen is two thin rows with a lot of nothing above and below them,
 * and a grid of 300 is a wall that fights the text. Positions are derived from
 * each person's seed, so the layout is stable across renders and identical on
 * the server and the client, and anything that lands where the headline goes is
 * pushed outside it rather than hidden.
 */

const CENTRE = { x: 50, y: 46 };
// The clear zone the copy sits in, as a percentage of the hero.
const KEEP_OUT = { x: 33, y: 27 };

function hash(text: string, salt: number): number {
  let value = salt * 2654435761;
  for (let i = 0; i < text.length; i += 1) {
    value = (value ^ text.charCodeAt(i)) * 16777619;
  }
  // Convert to a stable 0..1 without relying on bit width.
  return ((value >>> 0) % 100000) / 100000;
}

function place(seed: string) {
  const x = 3 + hash(seed, 1) * 94;
  const y = 4 + hash(seed, 2) * 92;

  // How far inside the keep-out ellipse this landed. Below 1 means it is on top
  // of the copy, so push it out along the same direction.
  const dx = (x - CENTRE.x) / KEEP_OUT.x;
  const dy = (y - CENTRE.y) / KEEP_OUT.y;
  const distance = Math.hypot(dx, dy) || 0.0001;

  const scale = distance < 1 ? 1 / distance : 1;
  const finalX = CENTRE.x + dx * KEEP_OUT.x * scale;
  const finalY = CENTRE.y + dy * KEEP_OUT.y * scale;

  // Further from the copy reads as further away: smaller and fainter.
  const depth = hash(seed, 3);
  return {
    left: `${Math.min(Math.max(finalX, 2), 95)}%`,
    top: `${Math.min(Math.max(finalY, 3), 92)}%`,
    size: 38 + Math.round(depth * 26),
    opacity: 0.26 + depth * 0.24,
  };
}

/**
 * Push overlapping faces apart.
 *
 * Scattering by hash alone puts pairs on top of each other often enough to look
 * careless. A few relaxation passes fix it, and because the input positions are
 * deterministic so is the result, which is what keeps the server and the client
 * rendering the same thing.
 */
function spread(spots: ReturnType<typeof place>[]): ReturnType<typeof place>[] {
  // Percentages of a nominal hero, so px sizes can be compared against them.
  const toX = (px: number) => (px / 1280) * 100;
  const toY = (px: number) => (px / 760) * 100;

  const out = spots.map((s) => ({ ...s, x: parseFloat(s.left), y: parseFloat(s.top) }));

  for (let pass = 0; pass < 5; pass += 1) {
    for (let a = 0; a < out.length; a += 1) {
      for (let b = a + 1; b < out.length; b += 1) {
        const first = out[a];
        const second = out[b];
        const minX = toX((first.size + second.size) / 2) + 1.2;
        const minY = toY((first.size + second.size) / 2) + 1.8;

        const dx = second.x - first.x;
        const dy = second.y - first.y;
        const overlapX = minX - Math.abs(dx);
        const overlapY = minY - Math.abs(dy);
        if (overlapX <= 0 || overlapY <= 0) continue;

        // Separate along whichever axis needs the smaller nudge.
        if (overlapX / minX < overlapY / minY) {
          const shift = (overlapX / 2) * (dx < 0 ? -1 : 1);
          first.x -= shift;
          second.x += shift;
        } else {
          const shift = (overlapY / 2) * (dy < 0 ? -1 : 1);
          first.y -= shift;
          second.y += shift;
        }
      }
    }
  }

  return out.map((s) => ({
    ...s,
    left: `${Math.min(Math.max(s.x, 2), 96)}%`,
    top: `${Math.min(Math.max(s.y, 3), 93)}%`,
  }));
}

// Enough to read as a crowd, few enough to stay out of the copy's way once the
// wall gets long. Everyone is still on the wall itself further down.
const MAX_FACES = 60;

export function HeroBoard({ people }: { people: SignupRow[] }) {
  if (people.length === 0) return null;

  const shown = people.slice(0, MAX_FACES);
  const spots = spread(shown.map((person) => place(person.seed)));

  return (
    <div className="hero-board" aria-hidden>
      {shown.map((person, i) => {
        const spot = spots[i];
        return (
          <span
            key={person.id}
            className="hero-board__face"
            style={{
              left: spot.left,
              top: spot.top,
              width: spot.size,
              height: spot.size,
              // Staggered so they arrive as a crowd rather than a block.
              animationDelay: `${Math.min(i * 40, 1600)}ms`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc(person.seed, person.gender)}
              alt=""
              width={spot.size}
              height={spot.size}
              loading="eager"
              style={{ opacity: spot.opacity }}
            />
            <span className="hero-board__name">
              {person.name}
              <span className="hero-board__place">{countryName(person.country)}</span>
            </span>
          </span>
        );
      })}
    </div>
  );
}
