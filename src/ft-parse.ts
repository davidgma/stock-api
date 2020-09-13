import { get } from 'https';
import { stringify } from 'querystring';
import { parse as htmlParse, HTMLElement as parsedElement } from 'node-html-parser';

export class FtParser {

  constructor() { }

  public async getPrice(symbol: string) {
    return new Promise<number>((resolve, reject) => {

      const options = {};
      let content = "";

      const req = get("https://markets.ft.com/data/etfs/tearsheet/summary?s=" + symbol, options, (res) => {
        //console.log(`STATUS: ${res.statusCode}`);
        //console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          //console.log(`BODY: ${chunk}`);
          content += chunk;
        });
        res.on('end', () => {
          const root: parsedElement = htmlParse(content);
          let quoteBar: parsedElement = root.querySelector('.mod-tearsheet-overview__quote__bar');
          let priceElement = quoteBar.querySelector(".mod-ui-data-list__value").innerHTML.replace(",", "");
          resolve(Number.parseFloat(priceElement));
        });
      });

      req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
        reject("Error retrieving data from FT");
      });


      req.end();
    });

  }
}