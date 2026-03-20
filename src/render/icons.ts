/**
 * Nerd Font icon mappings.
 * When useNerdFont is false, returns plain text fallbacks.
 */

const NERD: Record<string, string> = {
  context: "\uf0e4", //  tachometer
  usage: "\uf080", //  bar-chart
  folder: "\uf07b", //  folder
  git: "\ue725", //  git-branch
  model: "\uf544", // 󰕄 robot (nf-md-robot)
  terminal: "\uf120", //  terminal
  edit: "\uf040", //  pencil
  read: "\uf15c", //  file-text
  agent: "\uf0c1", //  link (subagent)
  clock: "\uf017", //  clock
  rules: "\uf0ad", //  wrench
  mcp: "\uf1e6", //  plug
  hooks: "\uf0e7", //  bolt
  file: "\uf15c", //  file-text (CLAUDE.md)
  todo: "\uf00c", //  check
};

const PLAIN: Record<string, string> = {
  context: "Context",
  usage: "Usage",
  folder: "",
  git: "git:",
  model: "",
  terminal: "",
  edit: "",
  read: "",
  agent: "",
  clock: "⏱️ ",
  rules: "",
  mcp: "",
  hooks: "",
  file: "",
  todo: "",
};

export function icon(key: string, useNerdFont: boolean): string {
  if (useNerdFont) {
    return NERD[key] ?? "";
  }
  return PLAIN[key] ?? "";
}
