import type { RenderContext } from "../types.js";
import { yellow, green, cyan, dim, magenta, claudeOrange } from "./colors.js";

const SPINNER_FRAMES = ["◐", "◓", "◑", "◒"];

function getSpinner(): string {
  const frame = Math.floor(Date.now() / 300) % SPINNER_FRAMES.length;
  return SPINNER_FRAMES[frame];
}

function toolColor(name: string): (text: string) => string {
  switch (name) {
    case "Edit":
    case "Write":
    case "NotebookEdit":
      return claudeOrange; // mutation — orange
    case "Read":
    case "Glob":
    case "Grep":
      return green; // read-only — green
    case "Bash":
      return yellow; // shell — yellow
    case "Agent":
      return magenta; // subagent — magenta
    default:
      return cyan; // everything else — cyan
  }
}

export function renderToolsLine(ctx: RenderContext): string | null {
  const { tools } = ctx.transcript;

  if (tools.length === 0) {
    return null;
  }

  const parts: string[] = [];

  const runningTools = tools.filter((t) => t.status === "running");
  const completedTools = tools.filter(
    (t) => t.status === "completed" || t.status === "error",
  );

  for (const tool of runningTools.slice(-2)) {
    const target = tool.target ? truncatePath(tool.target) : "";
    const colorFn = toolColor(tool.name);
    parts.push(
      `${yellow(getSpinner())} ${colorFn(tool.name)}${target ? dim(`: ${target}`) : ""}`,
    );
  }

  const toolCounts = new Map<string, number>();
  for (const tool of completedTools) {
    const count = toolCounts.get(tool.name) ?? 0;
    toolCounts.set(tool.name, count + 1);
  }

  const sortedTools = Array.from(toolCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  for (const [name, count] of sortedTools) {
    const colorFn = toolColor(name);
    parts.push(`${green("✓")} ${colorFn(name)} ${dim(`×${count}`)}`);
  }

  if (parts.length === 0) {
    return null;
  }

  return parts.join(" | ");
}

function truncatePath(path: string, maxLen: number = 20): string {
  // Normalize Windows backslashes to forward slashes for consistent display
  const normalizedPath = path.replace(/\\/g, "/");

  if (normalizedPath.length <= maxLen) return normalizedPath;

  // Split by forward slash (already normalized)
  const parts = normalizedPath.split("/");
  const filename = parts.pop() || normalizedPath;

  if (filename.length >= maxLen) {
    return filename.slice(0, maxLen - 3) + "...";
  }

  return ".../" + filename;
}
