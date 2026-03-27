<<<<<<< HEAD
import { describe, it, expect } from 'vitest';
import { cn } from "./utils.js";

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("base-class", "extra-class")).toBe("base-class extra-class");
  });

  it("handles conditional classes", () => {
    expect(cn("base", true && "truthy", false && "falsy")).toBe("base truthy");
  });

  it("handles objects correctly", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("handles arrays correctly", () => {
    expect(cn(["class1", "class2"], "class3")).toBe("class1 class2 class3");
  });

  it("resolves tailwind class conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("p-4 p-2", "p-8")).toBe("p-8");
  });

  it("handles null, undefined, and empty inputs", () => {
    expect(cn(null, undefined, "", "real-class")).toBe("real-class");
  });

  it("handles complex nested inputs", () => {
    expect(cn("base", ["arr1", ["arr2"]], { obj1: true, obj2: false })).toBe("base arr1 arr2 obj1");
=======
import { test } from "node:test";
import assert from "node:assert";
import { cn } from "./utils.js";

test("cn utility", async (t) => {
  await t.test("merges class names correctly", () => {
    assert.strictEqual(cn("base-class", "extra-class"), "base-class extra-class");
  });

  await t.test("handles conditional classes", () => {
    assert.strictEqual(cn("base", true && "truthy", false && "falsy"), "base truthy");
  });

  await t.test("handles objects correctly", () => {
    assert.strictEqual(cn("base", { active: true, disabled: false }), "base active");
  });

  await t.test("handles arrays correctly", () => {
    assert.strictEqual(cn(["class1", "class2"], "class3"), "class1 class2 class3");
  });

  await t.test("resolves tailwind class conflicts", () => {
    assert.strictEqual(cn("px-2", "px-4"), "px-4");
    assert.strictEqual(cn("p-4 p-2", "p-8"), "p-8");
  });

  await t.test("handles null, undefined, and empty inputs", () => {
    assert.strictEqual(cn(null, undefined, "", "real-class"), "real-class");
  });

  await t.test("handles complex nested inputs", () => {
    assert.strictEqual(
      cn("base", ["arr1", ["arr2"]], { obj1: true, obj2: false }),
      "base arr1 arr2 obj1"
    );
>>>>>>> jules-1479046961394913710-1ab7a0fd
  });
});
