import { ResultSet, Row } from "@libsql/client/.";
import { turso } from "./db.js";

export const register = async (chatId: number): Promise<ResultSet> => {
  const res = await turso.execute(
    `INSERT INTO agentKeyStore (id, rollnumber, apikey) VALUES (?, ?, ?)`,
    [String(chatId), "", ""],
  );
  return res;
};

export const isRegistered = async (chatId: number): Promise<boolean> => {
  const resp = await turso.execute(`
        SELECT * from agentKeyStore where id=${chatId}
    `);
  return resp.rows.length > 0;
};

export const getApikey = async (chatId: number) => {
  const resp = await turso.execute(`
        SELECT apikey from agentKeyStore where id=${chatId}
    `);

  console.log("API key query result:", resp);

  if (resp.rows.length === 0) {
    return null;
  }
  return resp.rows[0].apikey as string;
};

export const updateApiKey = async (
  chatId: number,
  apiKey: string,
): Promise<ResultSet> => {
  const res = await turso.execute(
    `
        UPDATE agentKeyStore SET apikey = ? WHERE id = ?
    `,
    [apiKey, String(chatId)],
  );
  return res;
};

export const updateRollNumber = async (
  chatId: number,
  rollnumber: string,
): Promise<ResultSet> => {
  const res = await turso.execute(
    `
        UPDATE agentKeyStore SET rollnumber = ? WHERE id = ?
    `,
    [rollnumber, String(chatId)],
  );
  return res;
};

export const getRollNumber = async (chatId: number): Promise<Row | null> => {
  const resp = await turso.execute(`
        SELECT rollnumber from agentKeyStore where id=${chatId}
    `);

  if (resp.rows.length === 0) {
    return null;
  }
  return resp.rows[0];
};
