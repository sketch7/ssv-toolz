import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import * as v from "valibot";

import { ShellSchema } from "./config-schema";

const SsvSettingsSchema = v.object({
	configRoot: v.optional(v.pipe(v.string(), v.description("Registered directory scanned for mass-exec config files"))),
	wsRoot: v.optional(v.pipe(v.string(), v.description("Global workspace root — default directory where repos are cloned"))),
	shell: v.optional(
		v.pipe(ShellSchema, v.description("Default shell for all mass-exec commands. Overridden by config-level shell or --shell flag.")),
	),
});

export type SsvSettings = v.InferOutput<typeof SsvSettingsSchema>;

export function getSettingsPath(): string {
	return join(homedir(), ".ssv", "config.json");
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export function readSettings(): SsvSettings {
	const settingsPath = getSettingsPath();
	if (!existsSync(settingsPath)) {
		return {};
	}
	try {
		const raw: unknown = JSON.parse(readFileSync(settingsPath, "utf8"));
		// migrate legacy massExecDir field
		if (isRecord(raw) && !("configRoot" in raw) && "massExecDir" in raw) {
			raw.configRoot = raw.massExecDir;
		}
		const result = v.safeParse(SsvSettingsSchema, raw);
		return result.success ? result.output : {};
	} catch {
		return {};
	}
}

export function writeSettings(settings: SsvSettings): void {
	const settingsPath = getSettingsPath();
	mkdirSync(dirname(settingsPath), { recursive: true });
	writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
}
