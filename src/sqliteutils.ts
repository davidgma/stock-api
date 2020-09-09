import { FileUtils } from "./fileutils";

export class SqliteUtils {
    private _file_path: string;
    public results: Array<string>;
    private _variables: Map<string, string>;
    private _open_with: string;

    constructor(file_path: string, 
    open_with: string = "stdout") {
        this._file_path = file_path;
        this._open_with = open_with;
        this.results = new Array<string>();
        this._variables = new Map<string, string>();
    }

    public async process_file(): Promise<number> {
        console.log("current dir: " + FileUtils.currentDirectory());
        // check that the filename exists
        if (! await FileUtils.isFile(this._file_path)) {
            console.log("not file");
            this.results.push("Error: the file " + this._file_path
            + " doesn't exist.");
            return -2;
        }
        let contents = await FileUtils.readFile(this._file_path);
       console.log("length of file: " + contents.length.toString());

        // check that the file has at least 2 rows
        if (contents.length < 2) {
            this.results.push("Error: the file " + this._file_path
                + " is shorter than 2 rows. There should at least be "
                + "a database path and an instruction.");
            return -5;
        }

        // Check that the database name is in the first line
        let regex: RegExp = new
            RegExp("^-- Database =\\s*(.*?)\\s*$");
        let match: RegExpExecArray | null = regex.exec(contents[0]);
        if (match == null) {
            this.results.push("Error: The database path and name "
                + "should be in the first line of the file e.g. "
                + "-- Database = /home/me/my-database.db");
            return -3;
        }
        let database_path = match[1];
       // console.log("database path: '" + database_path + "'");

        // Check that the database file exists
        if (! await FileUtils.isFile(database_path)) {
            this.results.push("Error: The database '" + database_path
                + "' doesn't exist.");
            return -4;
        }

        // Variable substitution
        let new_contents: Array<string> = new Array<string>();
        for (let [key, line] of contents.entries()) {
           //console.log(line);
            let variables: Array<string> =
            FileUtils.regex_extract("^-- <variable name=\"(.*?)\" "
                    + "value=\"(.*?)\" />\\s*$", line);
            if (variables.length > 0) {
                this._variables.set(variables[0], variables[1]);
            }
            for (let [variable, replacement] of this._variables.entries()) {
                if (line.includes(variable)) {
                    line = line.replace(variable, replacement);
                }
            }
            new_contents.push(line);
        }

        // Write to a temporary file to allow for variable substitution
        let temp_sql_file = await FileUtils.tmpfile();
        await FileUtils.writeFile(temp_sql_file, new_contents);

        // Send the new file to sqlite3.
        let sql_results: Array<string> = await 
        FileUtils.execute(temp_sql_file, database_path);
        let temp_results_path = await FileUtils.tmpfile();
        await FileUtils.writeFile(temp_results_path, sql_results);
        
        for (let line of sql_results) {
            this.results.push(line);
        }

        await FileUtils.show_file(temp_results_path, 
        this._open_with);
        return 0;




    } // end of process_file



} // End of class SqliteUtils

// export = SqliteUtils;


