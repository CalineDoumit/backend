const express = require('express');
const bodyParser = require('body-parser');
var authenticate = require('../authenticate');
const Robots = require('../models/robots');
const User = require('../models/user');
const Patients = require('../models/patients');
const cors = require('./cors');



const robotRouter = express.Router();

robotRouter.use(bodyParser.json());

robotRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors,(req,res,next) => {
        Robots.find(req.query)
            .then((robots) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(robots);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions,(req, res, next) => {
        Robots.create(req.body)
            .then((robot) => {
                console.log('Robot Created ', robot);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(robot);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put((req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /robots');
    })
    .delete((req, res, next) => {
        Robots.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

robotRouter.route('/RobotIsNotOccupied')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors,(req,res,next) => {
        Robots.find({isOccupied:false})
            .then((robots) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(robots);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

robotRouter.route('/:robotid/getCorrespondingPatient')
    .get(cors.cors, (req,res,next) => {
        Robots.findById(req.params.robotid)
            .then((robot)=>{
                console.log("robot found : "+ robot._id)
                Patients.findById(robot.patient)
                    .then((patient)=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(patient);
                    },(err) => next(err))
                    .catch((err) => next(err));

            },(err) => next(err))
            .catch((err) => next(err));
    })


robotRouter.route('/getCorrespondingUser')
    .get(cors.cors, (req,res,next) => {
        Robots.findById(req.query)
            .then((robot)=>{
                User.find({patient: robot.patient})
                    .then((user)=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(user);
                    },(err) => next(err))
                    .catch((err) => next(err));

            },(err) => next(err))
            .catch((err) => next(err));
    })







module.exports =robotRouter;