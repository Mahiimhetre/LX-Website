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
  });
});
