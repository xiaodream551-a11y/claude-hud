import { dim } from "../colors.js";
import { icon } from "../icons.js";
export function renderEnvironmentLine(ctx) {
    const display = ctx.config?.display;
    const nf = display?.useNerdFont ?? false;
    if (display?.showConfigCounts === false) {
        return null;
    }
    const totalCounts = ctx.claudeMdCount + ctx.rulesCount + ctx.mcpCount + ctx.hooksCount;
    const threshold = display?.environmentThreshold ?? 0;
    if (totalCounts === 0 || totalCounts < threshold) {
        return null;
    }
    const parts = [];
    if (ctx.claudeMdCount > 0) {
        const i = icon("file", nf);
        parts.push(nf ? `${i} ${ctx.claudeMdCount}` : `${ctx.claudeMdCount} CLAUDE.md`);
    }
    if (ctx.rulesCount > 0) {
        const i = icon("rules", nf);
        parts.push(nf ? `${i} ${ctx.rulesCount}` : `${ctx.rulesCount} rules`);
    }
    if (ctx.mcpCount > 0) {
        const i = icon("mcp", nf);
        parts.push(nf ? `${i} ${ctx.mcpCount}` : `${ctx.mcpCount} MCPs`);
    }
    if (ctx.hooksCount > 0) {
        const i = icon("hooks", nf);
        parts.push(nf ? `${i} ${ctx.hooksCount}` : `${ctx.hooksCount} hooks`);
    }
    if (parts.length === 0) {
        return null;
    }
    return dim(parts.join(" | "));
}
//# sourceMappingURL=environment.js.map