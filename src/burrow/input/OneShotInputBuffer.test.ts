import { describe, expect, it } from "vitest";

import { OneShotInputBuffer } from "./OneShotInputBuffer";

describe("OneShotInputBuffer", () => {
  it("keeps a pressed action until the next fixed simulation step consumes it", () => {
    const buffer = new OneShotInputBuffer();

    buffer.queue();

    expect(buffer.hasPending).toBe(true);
    expect(buffer.consume()).toBe(true);
    expect(buffer.consume()).toBe(false);
  });

  it("can discard a queued action when a scene restarts", () => {
    const buffer = new OneShotInputBuffer();
    buffer.queue();

    buffer.clear();

    expect(buffer.hasPending).toBe(false);
  });
});
