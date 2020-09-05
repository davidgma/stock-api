// Program for adding and removing prices from
// the database.
//import { options } from 'yargs';
import yargs from 'yargs';

interface Arguments {
    [x: string]: unknown;
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


console.log(argv);

if (argv._.includes("add")) {
    console.log("Add symbol(s): " + argv.symbols);
}

if (argv._.includes("remove")) {
    console.log("Remove symbol(s): " + argv.symbols);
}

