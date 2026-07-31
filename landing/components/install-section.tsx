"use client";

import { useState } from "react";
import { CopyButton } from "./copy-button";
import { usePeople } from "./people-provider";
import { copy } from "@/lib/copy";

/**
 * The setup steps, held back until you are on the wall.
 *
 * Not a hard gate, since the repository is public and the commands are in the
 * README either way. It is a trade: the wall is worth more with people on it,
 * and one name is a fair price for the thing you came here to install. The
 * locked state says exactly what it wants rather than pretending the section
 * is not there.
 */
export function InstallSection() {
  const { joined } = usePeople();

  return (
    <section id="install" className="scroll-mt-24 border-t px-6 md:px-12 lg:px-24 py-24 sm:py-32">
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-4">
            <p className="text-muted-foreground font-mono text-[11px] tracking-[0.2em] uppercase">
              {copy.install.label}
            </p>
            <h2 className="mt-5 font-serif text-3xl leading-tight sm:text-4xl">
              {copy.install.heading}
            </h2>
            <p className="text-muted-foreground mt-5 text-base leading-relaxed">
              {copy.install.intro}
            </p>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            {joined ? <Steps /> : <Locked />}
            <p className="text-muted-foreground mt-8 text-sm">
              <a href="/experiences" className="underline underline-offset-4 hover:text-foreground">
                {copy.experiences.label}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Steps() {
  const [activeTab, setActiveTab] = useState<"docker" | "native" | "windows">("docker");

  return (
    <div>
      <div className="flex gap-6 border-b border-border mb-8">
        <button
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === "docker"
              ? "border-b-2 border-foreground text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("docker")}
        >
          With Docker (Recommended)
        </button>
        <button
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === "windows"
              ? "border-b-2 border-foreground text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("windows")}
        >
          {copy.install.windows.tab}
        </button>
        <button
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === "native"
              ? "border-b-2 border-foreground text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("native")}
        >
          {copy.install.noDocker.heading}
        </button>
      </div>

      {activeTab === "docker" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <ol className="space-y-8">
            {copy.install.steps.map((step, i) => (
              <li key={step.title} className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-muted-foreground/60 font-mono text-xs tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 className="text-sm font-medium">{step.title}</h4>
                </div>
                <CopyButton command={step.command} />
                <p className="text-muted-foreground text-xs">{step.note}</p>
              </li>
            ))}
          </ol>
          <p className="mt-9 text-sm">
            {copy.install.outroBefore}{" "}
            <a href={copy.install.port} className="font-mono underline underline-offset-4">
              {copy.install.portLabel}
            </a>{" "}
            {copy.install.outroAfter}
          </p>
        </div>
      )}

      {activeTab === "windows" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="text-base leading-relaxed">{copy.install.windows.body}</p>
          <a
            href={copy.install.windows.href}
            className="btn-solid mt-6 inline-flex"
          >
            {copy.install.windows.cta}
          </a>
          <p className="text-muted-foreground mt-4 text-xs">{copy.install.windows.note}</p>
        </div>
      )}

      {activeTab === "native" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <ol className="space-y-8">
            {copy.install.noDocker.steps.map((step, i) => (
              <li key={step.title} className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-muted-foreground/60 font-mono text-xs tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 className="text-sm font-medium">{step.title}</h4>
                </div>
                <CopyButton command={step.command} />
                <p className="text-muted-foreground text-xs">{step.note}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function Locked() {
  return (
    <div className="card flex flex-col items-start gap-5">
      <div className="space-y-3">
        {/* Three blurred bars standing in for the commands, so it is obvious
            what is behind this rather than being a mystery. */}
        {[80, 64, 72].map((width, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-muted-foreground/40 font-mono text-xs tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div
              className="bg-muted h-8 rounded-md blur-[3px]"
              style={{ width: `${width}%`, minWidth: "12rem" }}
            />
          </div>
        ))}
      </div>
      <p className="text-base">{copy.install.locked}</p>
      <a href="#wall" className="btn-solid">
        {copy.join.submit}
      </a>
    </div>
  );
}
