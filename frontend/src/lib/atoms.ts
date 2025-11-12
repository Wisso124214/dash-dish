import { atomWithStorage } from "jotai/utils";
import type { Cart } from "./types";

interface UserData {
  isLoggedIn: boolean;
}

export const userAtom = atomWithStorage<UserData | null>("user", null);
export const cartAtom = atomWithStorage<Cart>("cart", []);
