export const CHANNELS = ["orders:new", "orders:updated"] as const;

export type Channels = (typeof CHANNELS)[number];
