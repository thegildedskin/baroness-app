import { describe, it, expect } from "vitest";
import { scoreWork, topMatches } from "@/lib/matcher";

const works = [
  { t: "Dagger & rose", st: ["Neo-Traditional", "Traditional"], vb: ["Bold", "Ornate"] },
  { t: "Sacred band", st: ["Geometric", "Blackwork"], vb: ["Minimal", "Bold"] },
  { t: "Koi", st: ["Japanese", "Realism"], vb: ["Bold"] },
];

describe("matcher", () => {
  it("scores 2 per style hit + 1 per temperament hit", () => {
    expect(scoreWork(works[0], ["Neo-Traditional"], "Ornate")).toBe(3); // 2 + 1
    expect(scoreWork(works[0], ["Neo-Traditional", "Traditional"], null)).toBe(4); // 2 + 2
    expect(scoreWork(works[0], ["Realism"], "Minimal")).toBe(0);
  });

  it("topMatches ranks, filters zero, and caps the list", () => {
    const ranked = topMatches(works, ["Neo-Traditional", "Geometric"], "Ornate");
    expect(ranked[0].t).toBe("Dagger & rose"); // 2(style)+1(temperament)=3, tops Sacred band's 2
    expect(ranked.map((w) => w.t)).not.toContain("Koi"); // no style + no "Ornate" temperament → filtered
    expect(topMatches(works, ["Neo-Traditional"], null, 1)).toHaveLength(1);
  });

  it("returns nothing when there are no hits", () => {
    expect(topMatches(works, ["Watercolor"], "Delicate")).toHaveLength(0);
  });
});
