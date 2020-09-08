// Manage a local sqlite3 database.

import { FileUtils as flu } from './fileutils';
import { sep } from 'path';
import { exec } from 'child_process';

class DatabaseService {
    #db_name: string;
    #db_ready: Promise<boolean>;

    constructor(db_name: string) {
        this.#db_name = db_name;
        this.#db_ready = this.checkDb();
        this.dbIsReady();
    }

    // Check the database exists else create it.
    private async checkDb() {
        if (! await flu.isFile(this.#db_name)) {
            console.log("About to call setupDatabase");
            await this.setupDatabase();
        }
        return true;
    }

    private async setupDatabase() {
        console.log("Setting up new database '" + this.#db_name + "'.");
        let dir = __dirname.split(sep);
        dir.pop();
        let dbDir = dir.join(sep) + sep + "data";
        console.log("Database directory: " + dbDir);
        await flu.mkDir(dbDir);
        console.log("Database directory has been created.");
        let command = 'sqlite3 ' + this.#db_name + ' ".open ' + this.#db_name + ' .quit"';
        console.log(command);
        exec(command, { cwd: dbDir },
            (error, stdout, stderr) => {
                if (error) {
                    console.log("Error running command '" + command + ": " + error.code
                        + ", " + error.message);
                    return false;
                }
                if (stdout != null) {
                    console.log(stdout);
                    return true;
                }
                if (stderr != null) {
                    console.log(stderr);
                }
                return true;
            });
    }

    private async dbIsReady() {
        await Promise.all([this.#db_ready]);
        console.log("Database is ready");
    }
}



let dbs = new DatabaseService("myDatabaseName.db");

