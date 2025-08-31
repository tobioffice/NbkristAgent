import { DynamicStructuredTool } from "@langchain/core/tools";
import z from "zod";

export const attOverallTool = new DynamicStructuredTool({
  name: "getOverallAttendanceTool",
  description: "get attendance percentage for a student",
  schema: z.object({
    rollNo: z.string().describe("The roll number of the student"),
  }),
  func: async (input) => {
    const { rollNo } = input as {
      rollNo: string;
    };
    // Logic to track attendance
    return "attendance percentage for " + rollNo + " is 68.72%";
  },
});

export const attDetailedTool = new DynamicStructuredTool({
  name: "getDetailedAttendanceTool",
  description: "get detailed attendance for a student",
  schema: z.object({
    rollNo: z.string().describe("The roll number of the student"),
  }),
  func: async (input) => {
    const { rollNo } = input as {
      rollNo: string;
    };
    // Logic to track attendance
    return (
      "detailed attendance for " +
      rollNo +
      `{
  "student_id": "${rollNo}",
  "branch": "2_MECH_B",
  "overall_percentage": 68.72,
  "classes_attended": 134,
  "total_classes": 195,
  "subjects": [
    {"name": "UHV", "attended": 11, "total": 15, "last_updated": "18 days ago"},
    {"name": "TD-", "attended": 11, "total": 20, "last_updated": "21 days ago"}
  ]
}`
    );
  },
});

// Define tools
export const adderTool = new DynamicStructuredTool({
  name: "adder",
  description: "Adds two numbers together",
  schema: z.object({
    a: z.number().describe("The first number to add"),
    b: z.number().describe("The second number to add"),
  }),
  func: async (input) => {
    const { a, b } = input as { a: number; b: number };
    const sum = a + b;
    return `The sum of ${a} and ${b} is ${sum}`;
  },
});
