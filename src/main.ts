import yargs, { boolean } from 'yargs';
import { Controller } from './control';


interface Arguments {
    [x: string]: unknown;
    all: boolean;
    _: string[];
    $0: string;
    symbols: Array<string>;
}

const argv: Arguments = <Arguments>yargs
    .command("add [symbols..]", "Add one or more symbols.", {
        symbols: {
            description: 'One or more symbols to add e.g. MIDD:LSE:GBX',
            type: 'array',
        }
    })
    .command("update [symbols..]", "Update one or more symbols.", {
        symbols: {
            description: 'One or more symbols to update e.g. MIDD:LSE:GBX',
            type: 'array',
        }
    })
    .command("remove [symbols..]", "Remove one or more symbols.", {
        symbols: {
            description: 'One or more symbols to remove e.g. MIDD:LSE:GBX',
            type: 'array',
        }
    })
    .command("list", "List all symbols, prices and last update date.")
    .options({
        all: { type: 'boolean', default: false, description: "Update all prices" }
    })
    .usage('Usage: node $0 <command> [options] [symbols..]')
    .argv;


//console.log(argv);
async function processArgs(argv: Arguments) {
    let ctl = new Controller();
    if (argv._.includes("add")) {
        for (let symbol of argv.symbols) {
            await ctl.addSymbol(symbol);
        }
    }
    else if (argv._.includes("update")) {
        if (argv.all) {
            await ctl.updateAll();
        }
        else {
            for (let symbol of argv.symbols) {
                await ctl.update(symbol);
            }
        }
    }
    else if (argv._.includes("remove")) {
        for (let symbol of argv.symbols) {
            await ctl.remove(symbol);
        }
    }
    else if (argv._.includes("list")) {
        console.log("Listing symbols...");
        await ctl.list();
    }
    else {
        console.log("No command given.");
    }
}

processArgs(argv);