// src/bookroom-api/api/SDK/sqlite/index.ts

import sqlite3 from "sqlite3";

class SqliteDB {
    private dbPath: string;
    private db?: sqlite3.Database;

    constructor(dbPath: string) {
        this.dbPath = dbPath;
    }

    private async connect(): Promise<sqlite3.Database> {
        if (this.db) return this.db; // 已经连接过，直接返回

        return new Promise((resolve, reject) => {
            try {
                const db = new sqlite3.Database(this.dbPath, error => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(db);
                    }
                });
                console.log(`Connected to database at ${this.dbPath}`);
                this.db = db;
            } catch (error) {
                reject(error);
            }
        });
    }

    private async closeConnection(): Promise<void> {
        if (this.db) {
            await new Promise((resolve, reject) => {
                this.db?.close(error => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(null);
                    }
                });
            });
            console.log(`Closed connection to database at ${this.dbPath}`);
            this.db = undefined;
        }
    }

    public async run(query: string, params?: any[]): Promise<any> {
        try {
            await this.connect();
            return await new Promise((resolve, reject) => {
                this.db?.run(query, params, (error) => {
                    if (error) return reject(error);
                    resolve(undefined);
                });
            });
        } catch (error) {
            console.error(`Error running query: ${query}`, error);
            throw error;
        }
    }

    public async get(query: string, params?: any[]): Promise<any> {
        try {
            await this.connect();
            return await new Promise((resolve, reject) => {
                this.db?.get(query, params, (error, row) => {
                    if (error) return reject(error);
                    resolve(row);
                });
            });
        } catch (error) {
            console.error(`Error getting query: ${query}`, error);
            throw error;
        }
    }

    public async all(query: string, params?: any[]): Promise<any> {
        try {
            await this.connect();
            return await new Promise((resolve, reject) => {
                this.db?.all(query, params, (error, rows) => {
                    if (error) return reject(error);
                    resolve(rows);
                });
            });
        } catch (error) {
            console.error(`Error getting all query: ${query}`, error);
            throw error;
        }
    }

    public async close(): Promise<void> {
        await this.closeConnection();
    }
}

export default SqliteDB;