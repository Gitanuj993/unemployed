"use client";

import { avatarSrc } from "./avatar";
import { useCrowd, useLoadOnApproach } from "./use-crowd";
import { usePan } from "./use-pan";
import { countryName } from "@/lib/countries";
import { copy } from "@/lib/copy";
import type { CrowdPage, SignupRow } from "@/lib/db";

/**
 * The people, behind the headline.
 *
 * Everyone who has joined is on screen when the page opens, which does the
 * arguing a testimonial section would otherwise have to do.
 *
 * It used to scatter faces by hashing their seed. That read as a crowd at
 * twenty seven people and as a mess at a thousand, and it could only ever show
 * the handful that fitted the screen. It is a grid now, laid out column by
 * column and dragged sideways, so the crowd is legible and it does not end:
 * pan far enough right and the next page of people loads in front of you.
 *
 * The middle of the hero is masked out rather than kept empty by placement.
 * That is what lets the grid be one continuous surface instead of two separate
 * gutters that would have to scroll in opposite directions to stay symmetric.
 */
export function HeroBoard({ page, me }: { page: CrowdPage; me: SignupRow | null }) {
  const { people, done, loadMore } = useCrowd(page, me);

  const surface = usePan<HTMLDivElement>();
  const onScroll = useLoadOnApproach(surface, "x", { done, loadMore, count: people.length });

  if (people.length === 0) return null;

  return (
    <div ref={surface} onScroll={onScroll} className="hero-board" aria-hidden>
      <div className="hero-board__grid">
        {people.map((person, i) => {
          const isMe = me !== null && person.id === me.id;
          return (
            <span
              key={person.id}
              className="hero-board__face"
              data-me={isMe || undefined}
              // Only the opening screenful is staggered, so it arrives as a
              // crowd rather than a block. Everyone after that appears at once:
              // faces from later pages mount while you are already dragging
              // towards them, and a delay there is just a blank space where a
              // person should be.
              style={i < 60 ? { animationDelay: `${i * 25}ms` } : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarSrc(person.seed, person.gender)}
                alt=""
                width={64}
                height={64}
                // Only the faces that can be on screen before the first drag are
                // worth a request up front. The rest are one image each, and
                // there are hundreds of them.
                loading={i < 40 ? "eager" : "lazy"}
              />
              {isMe && <span className="hero-board__you">{copy.wall.you}</span>}
              <span className="hero-board__name">
                {person.name}
                <span className="hero-board__place">{countryName(person.country)}</span>
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
