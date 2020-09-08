// import fs = require('fs');
// import os = require('os');
// import exec = require('child_process');
// import tmp = require('tmp');
import { stat, readFile, writeFile, unlink, realpath, mkdir } from 'fs';
import { EOL } from 'os';
import { ChildProcess, spawn } from 'child_process';
import { file } from 'tmp';

export class FileUtils {
    constructor() { }

    hello() {
        console.log("Hello world from FileUtils.");
    }

    // use: if (! await flu.isFile(path)) {
    static isFile(path: string): Promise<boolean> {
        if (path == null) {
            return new Promise<boolean>((resolve, reject) => {
                console.log("Error: null path sent to isFile.");
                resolve(false);
            });
        }
        return new Promise<boolean>((resolve, reject) => {
            stat(path, (err, stats) => {
                if (err) {
                    resolve(false);
                }
                else if (stats.isFile()) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            });
        });
    }

    // use: if (! await flu.mkDir(path)) {
    static mkDir(path: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            if (path == null) {
                console.log("Error: null path sent to mkDir.");
                resolve(-1);
            };
            stat(path, (err, stats) => {
                if (err) {
                    if (err.code === "ENOENT") {
                        // Ok: might not yet exist
                    }
                    else {
                        console.log("Error trying to stat path '" + path + " " + err.name
                            + ", " + err.code + ", " + err.message);
                        resolve(-2);
                    }
                }
                if (stats !== undefined) {
                    if (stats.isFile()) {
                        console.log("Error: Path sent to mkDir is already file.");
                        resolve(-3);
                    }
                    else if (stats.isDirectory()) {
                        // Already exists
                        resolve(1);
                    }
                }
                else {
                    console.log("Creating the directory '" + path + "'")
                    mkdir(path, { recursive: true }, (err, path) => {
                        if (err) {
                            console.log("Error trying to create directory '"
                                + path + " " + err.name
                                + ", " + err.code + ", " + err.message);
                            resolve(-4);
                        }
                        else {
                            resolve(0);
                        }
                    });
                }
            });
        });

    }

    static async fullPath(path: string): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            if (! await FileUtils.isFile(path)) {
                console.log(`Error: the file ${path} `
                    + "does not exist.");
                resolve("error: file '" + path
                    + "' doesn't exist");
            }
            realpath(path, (err, resolvedPath) => {
                if (err) {
                    resolve("error: " + err.message);
                }
                else {
                    resolve(resolvedPath);
                }
            });
        });
    }

    static isDirectory(path: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            stat(path, (err, stats) => {
                if (err) {
                    resolve(false);
                }
                else if (stats.isDirectory()) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            });
        });
    }

    static readFile(path: string): Promise<Array<string>> {

        return new Promise<Array<string>>((resolve, reject) => {

            // Check that the file exists
            FileUtils.isFile(path).then(
                (value) => {
                    if (value == true) {
                        readFile(path, (err, data) => {

                            if (err) {
                                let r = new Array<string>();
                                r.push(err.toString());
                                resolve(r);
                            }
                            else {
                                resolve(data.toString().split(EOL));
                            }
                        });
                    }
                    else {
                        reject("Error: File '" + path + "' does not exist.")
                    }
                },
                (reason) => {
                    console.log("isFile rejected");
                    return new Promise<Array<string>>((resolve, reject) => {
                        reject(reason);
                    })
                });
        });
    }

    static writeFile(path: string, data: Array<string>):
        Promise<void> {
        console.log("path='" + path + "'");
        return new Promise<void>((resolve, reject) => {
            writeFile(path,
                data.join(EOL), (err) => {
                    if (err) {
                        console.log("Error: " + err);
                        throw err;
                    }
                    else {
                        resolve();
                    }
                });
        });
    }

    // Returns an array of matched groups from 
    // a string based on regexp
    static regex_extract(pattern: string,
        line: string): Array<string> {
        let r: Array<string> = new Array<string>();
        let regex: RegExp = new RegExp(pattern);
        let match: RegExpExecArray | null = regex.exec(line);
        if (match != null) {
            for (let i = 1; i < 100; i++) {
                if (match[i] != undefined) {
                    r.push(match[i]);
                }
                else {
                    break;
                }
            }
        }
        return r;
    }

    static tmpfile() {
        return new Promise<string>
            ((resolve, reject) => {
                file({ keep: true },
                    (err, path, fd,
                        cleanupcallback) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            resolve(path);
                        }
                    });
            });
    }

    static execute(sql_path: string, database_path: string)
        : Promise<Array<string>> {
        let ret: Array<string> = new Array<string>();
        return new Promise<Array<string>>((resolve, reject) => {
            let command: string = "sqlite3";
            let args: Array<string> = new Array<string>();
            args.push("-init");
            args.push(sql_path);
            args.push(database_path);
            args.push(".quit");
            let process: ChildProcess
                = spawn(command, args);
            if (process.stdout != null) {
                process.stdout.on('data', (data) => {
                    let str: string = data.toString();
                    // The default pageSize of sqlite3 is 4096
                    let pageSize = 4096;
                    // If the last set of data sent through
                    // reached the pageSize then this set of 
                    // data should be added onto the last set.
                    if (ret.length > 0 &&
                        ret[ret.length - 1].length == pageSize) {
                        ret[ret.length - 1] += str;
                    }
                    else {
                        ret.push(str);
                    }
                });
            }
            if (process.stderr != null) {
                process.stderr.on('data', (data) => {
                    ret.push(data.toString());
                });
            }
            process.on('close', (code) => {
                resolve(ret);
            });
        });
    }

    static async show_file(path: string, program: string) {
        if (!this.isFile(path)) {
            throw "Error: file " + path + "doesn't exist.";
        }
        if (program == "none") {
            return;
        }
        if (program == "stdout") {
            let lines: Array<string>
                = await this.readFile(path);
            for (let line of lines) {
                console.log(line);
            }
        }
        else {
            let args: Array<string> = new Array<string>();
            args.push(path);
            let process: ChildProcess
                = spawn(program, args, { detached: true });
        }
    }

    static async run_program(
        program: string = "google-chrome",
        args?: Array<string>) {
        if (args == null) {
            args = new Array<string>();
        }
        let process: ChildProcess
            = spawn(program, args, { detached: true });
    }

    static deleteIfExists(path: string):
        Promise<number> {
        return new Promise<number>((resolve, reject) => {
            unlink(path, (err) => {
                resolve();
            });
        });
    }

    static currentDirectory(): string {
        return __dirname;
    }

} // End of Application class 

// export = FileUtils;