import { atom } from "jotai";
import { Session } from "./types/session.js";
import { Screen } from "./types/screens.js";
export const sessionAtom = atom<Session | null>(null);

export const screenAtom = atom<Screen>('login');