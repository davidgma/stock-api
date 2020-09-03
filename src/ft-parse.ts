import { get } from 'https';
import {stringify} from 'querystring';
import { parse as htmlParse } from 'node-html-parser';

export class FtParser {

    constructor() { }

    public parse() {
        
        const options = {};
        let content = "";
        
        const req = get("https://markets.ft.com/data/etfs/tearsheet/summary?s=MIDD:LSE:GBX", options, (res) => {
            //console.log(`STATUS: ${res.statusCode}`);
            //console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
              //console.log(`BODY: ${chunk}`);
              content += chunk;
            });
            res.on('end', () => {
                const root = htmlParse(content);
                let quoteBar = root.querySelector('.mod-tearsheet-overview__quote__bar');
                let priceElement = quoteBar.querySelector(".mod-ui-data-list__value").innerHTML;
                console.log("Search: " + priceElement);
              console.log('No more data in response.');
            });
          });
          
          req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
          });
          
          
          req.end();
    }
}