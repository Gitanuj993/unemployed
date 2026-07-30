"use client";

import { createContext, useCallback, useContext, useState, useSyncExternalStore } from "react";

import type { SignupRow } from "@/lib/db";

const STORAGE_KEY = "unemployed:signup";

type PeopleState = {
  /** Joined during this visit. Kept apart from the server's list so the page
   *  can still stream the crowd in without waiting for the client. */
  added: SignupRow[];
  joined: boolean;
  add: (row: SignupRow) => void;
};

const PeopleContext = createContext<PeopleState>({
  added: [],
  joined: false,
  add: () => {},
});

export const usePeople = () => useContext(PeopleContext);

/** Whether anything is combined with the server list, in one place. */
export function useEveryone(fromServer: SignupRow[]): SignupRow[] {
  const { added } = usePeople();
  if (added.length === 0) return fromServer;
  const seen = new Set(added.map((row) => row.id));
  return [...added, ...fromServer.filter((row) => !seen.has(row.id))];
}

/** localStorage is state React does not own, so it is read the sanctioned way. */
const NEVER_CHANGES = () => () => {};
const hasJoinedBefore = () => localStorage.getItem(STORAGE_KEY) !== null;
const notOnTheServer = () => false;

/**
 * Holds the one piece of state the whole page shares: did you join, and who
 * arrived while you were looking at it.
 *
 * It exists because joining has to change three separate places at once. Your
 * face appears in the crowd behind the headline, your row appears on the wall,
 * and the setup steps unlock. Before this they were three components that each
 * only knew what the server told them at request time, so joining meant
 * reloading the page to see yourself.
 */
export function PeopleProvider({ children }: { children: React.ReactNode }) {
  const [added, setAdded] = useState<SignupRow[]>([]);

  const joinedBefore = useSyncExternalStore(NEVER_CHANGES, hasJoinedBefore, notOnTheServer);

  const add = useCallback((row: SignupRow) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: row.id, seed: row.seed }));
    setAdded((prev) => (prev.some((p) => p.id === row.id) ? prev : [row, ...prev]));
  }, []);

  return (
    <PeopleContext value={{ added, joined: added.length > 0 || joinedBefore, add }}>
      {children}
    </PeopleContext>
  );
}
