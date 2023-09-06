const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const hbs = require('express-handlebars');
const cors = require('cors');
const session = require('express-session');

const app = express()
const PORT = process.env.PORT || 3002;

const userController = require('./controllers/userController')

// MIDDLEWARE


app.use(express.urlencoded({ extended: true }));
app.use(express.static('static'));
app.use(express.json());

app.use(session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: true
}));

// /*app.use(cors(
//     {
//         origin: 'http://localhost:3000',
//     }
// ));*/

// VIEW ENGINE SETUP (HANDLEBARS)
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));         // ustalamy katalog views
app.engine('hbs', hbs({
    defaultLayout: 'main.hbs' ,
    helpers: {
        shortTitle: function (title) {
            return title.substring(0,10) +"...";
        },
        titledHeader: function (header) {
            return header.replace(/(^|\s)\S/g, function(t) { return t.toUpperCase() });
        },
    },
    extname: '.hbs',
    partialsDir: "views/partials",
}));


app.get("/",  (req, res) => {
    res.render('index.hbs',{ title: ":)" });
})

app.get('/result', (req, res) => {
    const data = req.session.data;
    delete req.session.data;
    console.log(data);
    res.render('results.hbs', { stats: data.stats , collection: data.data })

});

app.post('/term', userController.searchForTermAndDate);

app.get('/error', (req, res) => {
    const data = req.session.data;
    delete req.session.data;
    res.render('error.hbs', {msg:data});
})


// LISTEN
app.listen(PORT, ()=> {
    console.log('Server listening on port ' + PORT);
});
