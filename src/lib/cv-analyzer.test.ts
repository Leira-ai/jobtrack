import { describe, expect, it } from "vitest";
import { analyzeCv, CV_SCORING_RULES } from "./cv-analyzer";

const cv = `
SUMMARY
Frontend engineer building accessible web products.
EXPERIENCE
- Developed React and TypeScript interfaces used by 10,000 users.
- Improved checkout performance by 40% across 5 projects.
- Led a team of 6 people and shipped 12 releases.
- Optimized REST API integration and reduced defects by 25%.
EDUCATION
Bachelor of Computer Science
SKILLS
React, TypeScript, Next.js, JavaScript, Tailwind CSS, Playwright, Git
engineer@example.com | +62 812 3456 7890 | https://github.com/example
${"Product delivery collaboration testing accessibility. ".repeat(25)}
`;

const englishJd = `We need a Frontend Engineer experienced with React, TypeScript,
Next.js, JavaScript, Tailwind CSS, Playwright, Git, REST API, web development,
user experience, accessibility, performance, testing, and collaboration.`;

const indonesianJd = `Kami mencari Frontend Engineer yang menguasai React, TypeScript,
Next.js, JavaScript, Tailwind CSS, Playwright, Git, REST API, pengembangan web,
pengalaman pengguna, aksesibilitas, performa, pengujian, dan kolaborasi.`;

describe("analyzeCv", () => {
  it("uses explainable weights totaling exactly 100", () => {
    expect(CV_SCORING_RULES.reduce((sum, rule) => sum + rule.weight, 0)).toBe(
      100,
    );
    const result = analyzeCv({ cvText: cv, jobDescriptionText: englishJd });
    expect(result.checks.reduce((sum, check) => sum + check.weight, 0)).toBe(
      100,
    );
    for (const check of result.checks) {
      expect(check.earned).toBeGreaterThanOrEqual(0);
      expect(check.earned).toBeLessThanOrEqual(check.weight);
    }
  });

  it.each([
    ["English", englishJd],
    ["Indonesian", indonesianJd],
  ])(
    "finds bilingual skill and domain matches in %s",
    (_, jobDescriptionText) => {
      const result = analyzeCv({ cvText: cv, jobDescriptionText });
      expect(result.score).toBeGreaterThanOrEqual(70);
      expect(result.matchedKeywords).toEqual(
        expect.arrayContaining(["react", "typescript", "next.js", "rest api"]),
      );
      expect(result.missingKeywords).not.toContain("gender");
    },
  );

  it("returns a bounded empty-input result", () => {
    const result = analyzeCv({ cvText: "", jobDescriptionText: "" });
    expect(result.score).toBe(0);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.matchedKeywords).toEqual([]);
  });

  it("keeps score and terms invariant when sensitive traits are added", () => {
    const base = analyzeCv({ cvText: cv, jobDescriptionText: englishJd });
    const withSensitiveTraits = analyzeCv({
      cvText: `${cv}\nName: Fictional Person\nAge: 42\nGender: woman\nReligion: fictional`,
      jobDescriptionText: `${englishJd}\nAge: 30\nGender: woman\nReligion: fictional`,
    });
    expect(withSensitiveTraits.score).toBe(base.score);
    expect(withSensitiveTraits.matchedKeywords).toEqual(base.matchedKeywords);
    expect(withSensitiveTraits.missingKeywords).toEqual(base.missingKeywords);
    expect(withSensitiveTraits.excludedSensitiveTraits.join(" ")).toContain(
      "Gender",
    );
    expect(withSensitiveTraits.disclaimer).toContain("merangking kandidat");
  });

  it("never exceeds score bounds for unusually repetitive input", () => {
    const repeated = `${cv}\n${"React improved 99% for 100 users. ".repeat(500)}`;
    const result = analyzeCv({
      cvText: repeated,
      jobDescriptionText: englishJd,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
