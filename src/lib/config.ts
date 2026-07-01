// App configuration
export const ADMIN_EMAILS = ["john@witfawn.com"];

// FedEx Ground terminals
export const TERMINALS = [
  { code: "971", name: "Troutdale", address: "2460 NW Sundial Rd, Troutdale, OR 97060" },
  { code: "961", name: "Swan Island", address: "6447 N Cutter Circle, Portland, OR 97217" },
];

export const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Avatar colors
export const AVATAR_COLORS = [
  "#7c3aed", // purple
  "#f97316", // orange
  "#3b82f6", // blue
  "#22c55e", // green
  "#ec4899", // pink
  "#14b8a6", // teal
  "#eab308", // yellow
  "#ef4444", // red
];

export function getRandomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}
