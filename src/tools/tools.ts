import { DynamicStructuredTool } from "@langchain/core/tools";
import z from "zod";
import { getAttendance } from "../services/student.service.js";

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
    const attendance = await getAttendance(rollNo);
    if (attendance && typeof attendance === "object") {
      const { subjects, ...attendanceWithoutSubjects } = attendance;
      return JSON.stringify(attendanceWithoutSubjects);
    }
    return attendance;
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
    const attendance = await getAttendance(rollNo);
    return JSON.stringify(attendance);
  },
});
