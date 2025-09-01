import { attOverallTool, attDetailedTool, adderTool } from "../tools";

describe("Tools Tests", () => {
  describe("attOverallTool", () => {
    it("should return attendance percentage for a given roll number", async () => {
      const input = { rollNo: "12345" };
      const result = await attOverallTool.func(input);
      expect(result).toBe("attendance percentage for 12345 is 68.72%");
    });
  });

  describe("attDetailedTool", () => {
    it("should return detailed attendance for a given roll number", async () => {
      const input = { rollNo: "12345" };
      const result = await attDetailedTool.func(input);
      expect(result).toContain("detailed attendance for 12345");
      expect(result).toContain('"student_id": "12345"');
      expect(result).toContain('"overall_percentage": 68.72');
    });
  });

  describe("adderTool", () => {
    it("should add two numbers and return the sum", async () => {
      const input = { a: 5, b: 3 };
      const result = await adderTool.func(input);
      expect(result).toBe("The sum of 5 and 3 is 8");
    });

    it("should handle negative numbers", async () => {
      const input = { a: -2, b: 7 };
      const result = await adderTool.func(input);
      expect(result).toBe("The sum of -2 and 7 is 5");
    });

    it("should handle zero", async () => {
      const input = { a: 0, b: 0 };
      const result = await adderTool.func(input);
      expect(result).toBe("The sum of 0 and 0 is 0");
    });
  });
});
