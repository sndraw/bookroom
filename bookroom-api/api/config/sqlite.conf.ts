import path from "path";

export const SQLITE_DB_PATH = path.join(
    process.env.SQLITE_DB_PATH || __dirname,
    process.env.SQLITE_DB_PATH ? "/" : "../../db"
);