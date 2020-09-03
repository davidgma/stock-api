import express from 'express';
import bodyparser from 'body-parser';

// Create a new express app instance
const app: express.Application = express();

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
let port = process.env.PORT || 8080;
const router = express.Router();
router.get('/', function (req, res) {
    console.log(req.params);
    //res.json({ message: 'API is Online!' });   
    res.json(14.5);
});
app.use('/api', router);
router.use(function (req, res, next) {
    console.log("We've got something.");
    next() //calls next middleware in the application.
});

router.route('/symbol/:symbol').get((req, res) => {
    console.log(req.params);
    console.log("symbol = " + req.params.symbol);
    res.json(15.666);
});


app.listen(port, function () { console.log("App is listening on port " + port + "!"); });
