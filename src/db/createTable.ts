import { turso } from "./db.js";

turso
  .execute(
    `
    CREATE TABLE agentKeyStore (
        id TEXT PRIMARY KEY CHECK(LENGTH(id) <= 50),
        rollnumber TEXT,
        apikey TEXT CHECK(LENGTH(apikey) <= 50)
    );
`,
  )
  .then((res: any) => {
    console.log("Fallback Responses Table ensured", res);
  });
