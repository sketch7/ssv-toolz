import { describe, expect, it } from "vitest";

import { LinkConfigSchema } from "./schema";

describe("LinkConfigSchema", () => {
	it("is available for validating link configuration", () => {
		expect(LinkConfigSchema).toBeDefined();
	});
});
