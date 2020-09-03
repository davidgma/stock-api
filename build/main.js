"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
// Create a new express app instance
const app = express_1.default();
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
let port = process.env.PORT || 4221;
const router = express_1.default.Router();
router.get('/', function (req, res) {
    console.log(req.params);
    //res.json({ message: 'API is Online!' });   
    res.json(14.5);
});
app.use('/api', router);
router.use(function (req, res, next) {
    console.log("We've got something.");
    next(); //calls next middleware in the application.
});
router.route('/symbol/:symbol').get((req, res) => {
    console.log(req.params);
    console.log("symbol = " + req.params.symbol);
    res.json(15.666);
});
app.listen(port, function () { console.log("App is listening on port " + port + "!"); });
