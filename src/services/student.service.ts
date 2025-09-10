import { Academic } from "./student.utils/Academic.js";

export const createAcademic = (rollNumber: string) => {
  const academic = new Academic(rollNumber);
  return academic;
};

// Export helper methods
export const getAttendance = (rollNumber: string) =>
  createAcademic(rollNumber).getAttendanceJSON();

export const getMidMarks = (rollNumber: string) =>
  createAcademic(rollNumber).getMidmarksJSON();
