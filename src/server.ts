// Runs server to provide prices and periodically
// update them.
import express from 'express';
import bodyparser from 'body-parser';
//import { FtParser } from './ft-parse';
import { Controller } from './control';

let ctl = new Controller();

// Create a new express app instance
const app: express.Application = express();

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
let port = process.env.PORT || 4221;
const router = express.Router();
router.get('/', function (req, res) {
    console.log(req.params);
    //res.json({ message: 'API is Online!' });   
    res.json(14.5);
});
app.use('/api', router);
router.use(function (req, res, next) {
    //console.log("We've got something.");
    next() //calls next middleware in the application.
});

// call with http://localhost:4221/api/symbol/MIDD:LSE:GBX
router.route('/symbol/:symbol').get((req, res) => {
    console.log("params: " + req.params);
    console.log("symbol = " + req.params.symbol);
    ctl.getPrice(req.params.symbol).then((price) => {
        console.log("price in route: " + price);
        res.json(price);
    });
    //let parser = new FtParser();
    //res.json(parser.getPrice(req.params.symbol));
    //res.json(15.666);
});

app.listen(port, function () { console.log("App is listening on port " + port + "!"); });



