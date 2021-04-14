var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var indexRouter = require('./routes/index');
var nurseRouter = require('./routes/nurseRouter');
var patientRouter = require('./routes/patientRouter');
var robotRouter = require('./routes/robotRouter');
var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');
var usersRouter = require('./routes/users');
const cors = require('cors');
var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://test.mosquitto.org')
var Robots = require('./models/robots');
var Patient = require('./models/patients');


const mongoose = require('mongoose');

//const Dishes = require('./models/dishes');

//const url = 'mongodb://localhost:27017/RobotServer';
const url = config.mongoUrl;
const connect = mongoose.connect(url, {useFindAndModify: false});


connect.then(() => { //db : parametre
    console.log("Connected correctly to server");
}, (err) => {
    console.log(err);
});

var app = express();
//app.use(cors());

// const hostname = 'localhost';
// const port = 3443;
// //connect to DB
// mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true }, () => {
//   console.log('connected to DB');
//   app.listen(port, hostname, () => {
//     console.log(`Server running at http://${hostname}:${port}/`);
//   });
// });
// Secure traffic only
app.all('*', (req, res, next) => {
    if (req.secure) {
        return next();
    } else {
        res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
    }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/nurses', nurseRouter);
app.use('/patients', patientRouter);
app.use('/robots', robotRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


const topic1 = 'Temperature';
const topic2 = 'Obstacle';
const topic3 = 'Position';
const topic4 = 'Order';
const publicMsg = (topic, message) => {
    client.publish(topic, message);

}

client.on('connect', function () {
    client.subscribe("Order", function (err) {
        if (!err) {
            console.log("Mqtt connection established")
            var msg = "1 10";
            //client.publish('Position', msg)
        }
    })
})




client.on('message', function (topic, message) {
    let msg=message.toString();
    console.log(msg);
    let res=msg.split(" ");
    console.log(res);
    console.log("id of robot : "+ res[0]);
    console.log("temp : "+ res[1]);

    if (topic === "Temperature") {
        console.log("adding temperature")
        Robots.findOne({number: res[0]})
            .then((robot) => {
                console.log("found robot"+ robot.number)
                console.log("patient id"+ robot.patient)
                Patient.findById(robot.patient )
                    .then((patient) => {
                        patient.temperatures.push(res[1]);
                        patient.save();
                        console.log("res 1 :  "+res[1])
                        console.log("temperature :  "+patient.temperatures)
                        console.log("DONE")
                    }, (err) => console.log(err))
                    .catch((err) => console.log(err));
            }, (err) => console.log(err))
            .catch((err) => console.log(err));
    }

    if (topic === "Position") {
        if (res[1] == "10") {
            Robots.findOneAndUpdate({number: res[0]}, {position: "next to door"})
                .then(() => {
                    console.log("updated")
                }, (err) => console.log(err))
                .catch((err) => console.log(err));
        }
        if (res[1] == "20") {
            Robots.findOneAndUpdate({number: res[0]}, {position: "near the patient"})
                .then(() => {
                    console.log("updated")
                }, (err) => console.log(err))
                .catch((err) => console.log(err));
        }
    }

        if (topic === "Order") {
            console.log("WOSIL L MSSG ");
            //console.log(res[1]);

        }



    //client.end()
})





module.exports = app;


