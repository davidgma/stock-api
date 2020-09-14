// Program for adding and removing prices from
// the database.
//import { options } from 'yargs';

import { DatabaseService } from './db-service';
import { FtParser } from './ft-parse';



export class Controller {
    #dbs = new DatabaseService("prices.db");
    #parser = new FtParser();

    constructor() { }

    public async addSymbol(symbol: string) {
        console.log("Add symbol: " + symbol);

        let price = await this.#parser.getPrice(symbol);
        //let price = 42;

        await this.createTableIfNotExist();

        let sql = 'delete from t_prices where symbol = "' + symbol + '";'
        let result = await this.#dbs.sendSql(sql);
        if (result != null) {
            console.log(result);
        }
        sql = 'insert into t_prices values ("' + symbol + '", ' + price
            + ', datetime("now","localtime")' + ');';
        result = await this.#dbs.sendSql(sql);
        if (result != null) {
            console.log(result);
        }
    }

    public async list() {

        await this.createTableIfNotExist();
        let sql = 'select * from t_prices;'
        let result = await this.#dbs.sendSql(sql);
        if (result != null) {
            console.log(result);
        }
    }

    private async createTableIfNotExist() {
        let result: string;
        let sql = 'create table if not exists t_prices (symbol text primary key, price number,'
            + 'last_update datetime);'
        result = await this.#dbs.sendSql(sql);
        if (result != null) {
            console.log(result);
        }
    }

    public async update(symbol: string) {
        await this.createTableIfNotExist();
        // might want to get the current price here.
        await this.addSymbol(symbol);
    }

    public async updateAll() {
        await this.createTableIfNotExist();
        let sql = 'select symbol from t_prices;'
        let result = await this.#dbs.sendSql(sql);
        if (result != null) {
            let symbols = result.split('\n');
            for (let symbol of symbols) {
                if (symbol.length != 0) {
                    console.log("Updating symbol:  " + symbol);
                    await this.update(symbol);
                }
            }
        }
    }

    public async remove(symbol: string) {
        console.log("Removing symbol: " + symbol);
        await this.createTableIfNotExist();
        let sql = 'delete from t_prices where symbol = "' + symbol
            + '";'
        let result = await this.#dbs.sendSql(sql);
        if (result != null) {
            console.log(result);
        }
    }

    public async getPrice(symbol: string): Promise<number> {
        await this.createTableIfNotExist();
        let sql = 'select price from t_prices where symbol = "' + symbol + '";'
        let result = await this.#dbs.sendSql(sql);
        if (result != null) {
            let prices = result.split('\n');
            if (prices.length < 1) {
                return 0;
            }
            else {
                return Number.parseFloat(prices[0]);
            }
        }
        else {
            return 0;
        }
    }

} // end of class controller





