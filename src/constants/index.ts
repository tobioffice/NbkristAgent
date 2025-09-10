//exporting variables

export const BRANCHES: { [key: number]: string } = {
  5: "CSE",
  23: "AIDS",
  7: "MECH",
  4: "ECE",
  2: "EEE",
  11: "CIV",
  22: "IT",
  32: "CSE_DS",
  33: "CSE_AIML",
};

//exporting request urls
const BASE_URL = "http://103.203.175.90:94";

export const urls = {
  base: BASE_URL,
  login: BASE_URL + "/attendance/attendanceLogin.php",
  attendance: BASE_URL + "/attendance/attendanceTillTodayReport.php",
  midmarks: BASE_URL + "/mid_marks/marksConsolidateReport.php",
};

export const headers = (command: string) => {
  const hdrs: Record<string, string> = {
    "Cache-Control": "max-age=0",
    "Upgrade-Insecure-Requests": "1",
    Origin: urls.base,
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    Referer: command === "mid" ? urls.midmarks : urls.attendance,
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9",
    Cookie: ``,
    Connection: "close",
  };
  return hdrs;
};

export const ROLL_REGEX = /^\d{2}[a-zA-Z]{2}[a-zA-Z0-9]{6}$/;
export type Signal = "mid" | "att";
