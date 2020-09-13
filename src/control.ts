// Program for adding and removing prices from
// the database.
//import { options } from 'yargs';
import yargs from 'yargs';
import { DatabaseService } from './db-service';
import { FtParser } from './ft-parse';

interface Arguments {
    [x: string]: unknown;
    _: string[];
    $0: string;
    symbols: Array<string>;
}

class Controller {
    #dbs = new DatabaseService("prices.db");
    #parser = new FtParser();

    constructor() { }

    public async AddSymbol(symbol: string) {
        console.log("Add symbol: " + symbol);

        let price = await this.#parser.getPrice(symbol);

        let result: string;
        let sql = 'create table if not exists t_prices (symbol text primary key, price number);'
        result = await this.#dbs.sendSql(sql);
        if (result != null) {
            console.log(result);
        }
        sql = 'delete from t_prices where symbol = "' + symbol + '";'
        result = await this.#dbs.sendSql(sql);
        if (result != null) {
            console.log(result);
        }
        sql = 'insert into t_prices values ("' + symbol + '", ' + price + ');';
        result = await this.#dbs.sendSql(sql);
        if (result != null) {
            console.log(result);
        }
    }
}

const argv: Arguments = <Arguments>yargs
    .command("add [symbols..]", "Add one or more symbols.", {
        symbols: {
            description: 'One or more symbols to add e.g. MIDD:LSE:GBX',
            type: 'array',
        }
    })
    .command("remove [symbols..]", "Remove one or more symbols.", {
        symbols: {
            description: 'One or more symbols to remove e.g. MIDD:LSE:GBX',
            type: 'array',
        }
    })
    .alias("add", "a")
    .alias("remove", "r")
    .usage('Usage: node $0 <command> [options] [symbols..]')
    .argv;


//console.log(argv);
async function processArgs(argv: Arguments) {
    let ctl = new Controller();
    if (argv._.includes("add")) {
        for (let symbol of argv.symbols) {
            await ctl.AddSymbol(symbol);
        }
    }
    else if (argv._.includes("remove")) {
        console.log("Remove symbol(s): " + argv.symbols);
    }
    else {
        console.log("No command given.");
    }
}

processArgs(argv);



