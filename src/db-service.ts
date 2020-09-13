// Manage a local sqlite3 database.
// The difference between this class and the SqliteUtils class is that
// this operates on one database whereas SqliteUtils sends files to sqlite3
// which contain the name of the database to operate on. 

import { FileUtils as flu } from './fileutils';
import { sep } from 'path';
import { exec } from 'child_process';

export class DatabaseService {
    #db_name: string;
    #db_directory: string;
    #db_ready: Promise<boolean>;

    constructor(db_name: string) {
        this.#db_name = db_name;
        console.log("Database name: " + this.#db_name);
        let dir = __dirname.split(sep);
        dir.pop();
        this.#db_directory = dir.join(sep) + sep + "data";
        console.log("Database directory: " + this.#db_directory);
        this.#db_ready = this.checkDb();
        this.dbIsReady();
    }

    // Check the database exists else create it.
    private async checkDb() {
        if (! await flu.isFile(this.#db_directory + sep + this.#db_name)) {
            console.log("The database file doesn't yet exist. Creating it now...");
            return await this.setupDatabase();
        }
        else {
            console.log("The database file already exists.");
            return true;
        }
    }

    private async setupDatabase() {
        await flu.mkDir(this.#db_directory);
        return new Promise<boolean>((resolve, reject) => {
            // touch would probably work just as well:
            let command = 'sqlite3 ' + this.#db_name + ' ".open ' + this.#db_name + ' .quit"';
            console.log(command);
            exec(command, { cwd: this.#db_directory },
                (error, stdout, stderr) => {
                    if (error) {
                        console.log("Error running command '" + command + ": " + error.code
                            + ", " + error.message);
                        resolve(false);
                    }
                    if (stdout != null) {
                        console.log(stdout);
                        resolve(true);
                    }
                    if (stderr != null) {
                        console.log(stderr);
                    }
                    resolve(true);
                });
        });
    }

    private async dbIsReady() {
        await Promise.all([this.#db_ready]);
        console.log("The database is ready.");
    }

    // Use double quotes "" in the sql sent and terminate with a ;.
    public async sendSql(sql: string): Promise<string> {
        await Promise.all([this.#db_ready]);
        //console.log("here in sendSql: " + sql);
        return new Promise<string>((resolve, reject) => {
            let command = "sqlite3 " + this.#db_name + " '" + sql + "'";
            //console.log(command);
            exec(command, { cwd: this.#db_directory },
                (error, stdout, stderr) => {
                    if (error) {
                        console.log("Error running command '" + command + ": " + error.code
                            + ", " + error.message);
                        resolve(error.name);
                    }
                    if (stdout != null) {
                        //console.log(stdout);
                        resolve(stdout);
                    }
                    if (stderr != null) {
                        //console.log(stderr);
                    }
                    resolve(stderr);
                });
        });
    }


}




// async function testData() {
//     let result: string;
//     result = await dbs.sendSql('delete from test1;');
//     result = await dbs.sendSql('insert into test1 values ("first");');
//     result = await dbs.sendSql('insert into test1 values ("second");');
//     result = await dbs.sendSql('insert into test1 values ("third");');
//     result = await dbs.sendSql('select * from test1;');
//     if (result != null) {
//         console.log(result);
//     }
    
// }


// let dbs = new DatabaseService("myDatabaseName.db");
// testData();
