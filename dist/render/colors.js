export const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const MAGENTA = "\x1b[35m";
const CYAN = "\x1b[36m";
const BRIGHT_BLUE = "\x1b[94m";
const BRIGHT_MAGENTA = "\x1b[95m";
const CLAUDE_ORANGE = "\x1b[38;5;208m";
const ANSI_BY_NAME = {
    red: RED,
    green: GREEN,
    yellow: YELLOW,
    magenta: MAGENTA,
    cyan: CYAN,
    brightBlue: BRIGHT_BLUE,
    brightMagenta: BRIGHT_MAGENTA,
};
/** Convert a hex color string (#rrggbb) to a truecolor ANSI escape sequence. */
function hexToAnsi(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `\x1b[38;2;${r};${g};${b}m`;
}
/**
 * Resolve a color value to an ANSI escape sequence.
 * Accepts named presets, 256-color indices (0-255), or hex strings (#rrggbb).
 */
function resolveAnsi(value, fallback) {
    if (value === undefined || value === null) {
        return fallback;
    }
    if (typeof value === "number") {
        return `\x1b[38;5;${value}m`;
    }
    if (typeof value === "string" &&
        value.startsWith("#") &&
        value.length === 7) {
        return hexToAnsi(value);
    }
    return ANSI_BY_NAME[value] ?? fallback;
}
function colorize(text, color) {
    return `${color}${text}${RESET}`;
}
export function green(text) {
    return colorize(text, GREEN);
}
export function yellow(text) {
    return colorize(text, YELLOW);
}
export function red(text) {
    return colorize(text, RED);
}
export function cyan(text) {
    return colorize(text, CYAN);
}
export function magenta(text) {
    return colorize(text, MAGENTA);
}
export function dim(text) {
    return colorize(text, DIM);
}
export function claudeOrange(text) {
    return colorize(text, CLAUDE_ORANGE);
}
export function warning(text, colors) {
    return colorize(text, resolveAnsi(colors?.warning, YELLOW));
}
export function critical(text, colors) {
    return colorize(text, resolveAnsi(colors?.critical, RED));
}
/**
 * Colorize git branch name by repo state.
 * green = clean, yellow = dirty, red = detached HEAD
 */
export function gitBranchColor(text, isDirty, branch) {
    if (branch === "HEAD")
        return colorize(text, RED);
    if (isDirty)
        return colorize(text, YELLOW);
    return colorize(text, GREEN);
}
/**
 * Colorize speed value: fast(≥40)=green → medium(20)=yellow → slow(<5)=red
 */
export function speedColor(text, tokPerSec) {
    let r, g, b;
    const clamped = Math.max(0, Math.min(60, tokPerSec));
    if (clamped >= 30) {
        // green → yellow-green
        const t = (60 - clamped) / 30;
        [r, g, b] = [
            Math.round(34 + t * 200),
            Math.round(197 - t * 18),
            Math.round(94 - t * 86),
        ];
    }
    else {
        // yellow → red
        const t = (30 - clamped) / 30;
        [r, g, b] = [
            Math.round(234 + t * 5),
            Math.round(179 - t * 111),
            Math.round(8 + t * 60),
        ];
    }
    return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
}
export function getContextColor(percent, colors, gradient) {
    if (gradient)
        return contextGradientAt(Math.min(percent, 100) / 100);
    if (percent >= 85)
        return resolveAnsi(colors?.critical, RED);
    if (percent >= 70)
        return resolveAnsi(colors?.warning, YELLOW);
    return resolveAnsi(colors?.context, GREEN);
}
export function getQuotaColor(percent, colors, gradient) {
    if (gradient)
        return quotaGradientAt(Math.min(percent, 100) / 100);
    if (percent >= 90)
        return resolveAnsi(colors?.critical, RED);
    if (percent >= 75)
        return resolveAnsi(colors?.usageWarning, BRIGHT_MAGENTA);
    return resolveAnsi(colors?.usage, BRIGHT_BLUE);
}
const EMPTY_START = [60, 60, 60];
const EMPTY_END = [30, 30, 30];
function lerpRgb(r1, g1, b1, r2, g2, b2, t) {
    return [
        Math.round(r1 + (r2 - r1) * t),
        Math.round(g1 + (g2 - g1) * t),
        Math.round(b1 + (b2 - b1) * t),
    ];
}
function rgb(r, g, b) {
    return `\x1b[38;2;${r};${g};${b}m`;
}
/**
 * Context gradient: green(0%) → yellow(70%) → red(100%)
 * Each char's color is based on its position in the bar.
 */
function contextGradientAt(position) {
    let r, g, b;
    if (position <= 0.7) {
        const t = position / 0.7;
        [r, g, b] = lerpRgb(34, 197, 94, 234, 179, 8, t);
    }
    else {
        const t = (position - 0.7) / 0.3;
        [r, g, b] = lerpRgb(234, 179, 8, 239, 68, 68, t);
    }
    return rgb(r, g, b);
}
/**
 * Quota gradient: blue(0%) → magenta(75%) → red(100%)
 */
function quotaGradientAt(position) {
    let r, g, b;
    if (position <= 0.75) {
        const t = position / 0.75;
        [r, g, b] = lerpRgb(59, 130, 246, 217, 70, 239, t);
    }
    else {
        const t = (position - 0.75) / 0.25;
        [r, g, b] = lerpRgb(217, 70, 239, 239, 68, 68, t);
    }
    return rgb(r, g, b);
}
function renderGradientBar(filled, empty, width, filledChar, emptyChar, gradientFn) {
    let result = "";
    // Filled portion: position-based gradient
    for (let i = 0; i < filled; i++) {
        const position = width > 1 ? i / (width - 1) : 0;
        result += `${gradientFn(position)}${filledChar}`;
    }
    if (empty > 0 && filled > 0) {
        // Glow transition: fade from last gradient color → empty start color
        // Parse the last gradient color's RGB values
        const lastPosition = width > 1 ? (filled - 1) / (width - 1) : 0;
        const lastColorStr = gradientFn(lastPosition);
        const match = lastColorStr.match(/\x1b\[38;2;(\d+);(\d+);(\d+)m/);
        const lastRgb = match
            ? [+match[1], +match[2], +match[3]]
            : EMPTY_START;
        const glowLen = Math.min(3, empty);
        for (let i = 0; i < glowLen; i++) {
            const t = (i + 1) / (glowLen + 1);
            const [r, g, b] = lerpRgb(...lastRgb, ...EMPTY_START, t);
            result += `${rgb(r, g, b)}${emptyChar}`;
        }
        // Remaining empty: subtle fade to darker
        const remaining = empty - glowLen;
        for (let i = 0; i < remaining; i++) {
            const t = remaining > 1 ? i / (remaining - 1) : 0;
            const [r, g, b] = lerpRgb(...EMPTY_START, ...EMPTY_END, t);
            result += `${rgb(r, g, b)}${emptyChar}`;
        }
    }
    else {
        // No filled chars — just render the empty fade
        for (let i = 0; i < empty; i++) {
            const t = empty > 1 ? i / (empty - 1) : 0;
            const [r, g, b] = lerpRgb(...EMPTY_START, ...EMPTY_END, t);
            result += `${rgb(r, g, b)}${emptyChar}`;
        }
    }
    result += RESET;
    return result;
}
// --- Public bar functions ---
export function quotaBar(percent, width = 10, colors, barChars) {
    const safeWidth = Number.isFinite(width) ? Math.max(0, Math.round(width)) : 0;
    const safePercent = Number.isFinite(percent)
        ? Math.min(100, Math.max(0, percent))
        : 0;
    const filled = Math.round((safePercent / 100) * safeWidth);
    const empty = safeWidth - filled;
    const filledChar = barChars?.filled ?? "━";
    const emptyChar = barChars?.empty ?? "━";
    if (barChars?.style === "gradient" || barChars?.style === undefined) {
        return renderGradientBar(filled, empty, safeWidth, filledChar, emptyChar, quotaGradientAt);
    }
    // Solid mode (legacy)
    const color = getQuotaColor(safePercent, colors);
    return `${color}${filledChar.repeat(filled)}${DIM}${emptyChar.repeat(empty)}${RESET}`;
}
export function coloredBar(percent, width = 10, colors, barChars) {
    const safeWidth = Number.isFinite(width) ? Math.max(0, Math.round(width)) : 0;
    const safePercent = Number.isFinite(percent)
        ? Math.min(100, Math.max(0, percent))
        : 0;
    const filled = Math.round((safePercent / 100) * safeWidth);
    const empty = safeWidth - filled;
    const filledChar = barChars?.filled ?? "━";
    const emptyChar = barChars?.empty ?? "━";
    if (barChars?.style === "gradient" || barChars?.style === undefined) {
        return renderGradientBar(filled, empty, safeWidth, filledChar, emptyChar, contextGradientAt);
    }
    // Solid mode (legacy)
    const color = getContextColor(safePercent, colors);
    return `${color}${filledChar.repeat(filled)}${DIM}${emptyChar.repeat(empty)}${RESET}`;
}
//# sourceMappingURL=colors.js.map