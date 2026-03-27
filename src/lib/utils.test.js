import { describe, it, expect } from "vitest";
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
    expect(cn("base", ["arr1", ["arr2"]], { obj1: true, obj2: false })).toBe(
      "base arr1 arr2 obj1"
    );
  });
});
