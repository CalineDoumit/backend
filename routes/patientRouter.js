const express = require('express');
const bodyParser = require('body-parser');
const cors = require('./cors');


const Patients = require('../models/patients');
const Robots = require('../models/robots');
var User = require('../models/user');


const patientRouter = express.Router();

patientRouter.use(bodyParser.json());
patientRouter.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); } )


patientRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors,(req,res,next) => {
        Patients.find(req.query)
            .then((patients) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(patients);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        Patients.create(req.body)
            .then((patient) => {
                console.log('Patient Created ', patient);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(patient);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put((req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /patients');
    })
    .delete((req, res, next) => {
        Patients.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

patientRouter.route('/:patientId')
    .get((req, res, next) => {
        Patients.findById(req.params.patientId)
            .populate('patients.nurse')
            .then((patient) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(patient);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .post((req, res) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /patients/' + req.params.patientId);
    })
    .put((req, res, next) => {
        Patients.findByIdAndUpdate(req.params.patientId, {
            $set: req.body
        }, {new: true})
            .then((patient) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(patient);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete((req, res, next) => {
        Patients.findByIdAndRemove(req.params.patientId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });
patientRouter.route('/:patientId/deassignRobot')
    .post( cors.corsWithOptions,(req, res, next) => {
        Robots.findOneAndUpdate({patient: req.params.patientId}, {
            patient: undefined,
            isOccupied: false
        })
            .then(() => {
                console.log("robot found")
                //put isActive to false
                User.findOneAndUpdate({patient:req.params.patientId}, {
                    isActive: false
                })
                    .then(()=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({err:"modified"});
                    }, (err) => next(err))
                    .catch((err) => next(err));
            }, (err) => next(err))
            .catch((err) => next(err));

    });





patientRouter.route('/:patientId/temperatures')
    .get((req, res, next) => {
        Patients.findById(req.params.patientId)
            .populate('patients.nurse')
            .then((patient) => {
                if (patient != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(patient.temperatures);
                } else {
                    err = new Error('Patient ' + req.params.patientId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        Patients.findById(req.params.patientId)
            .then((patient) => {
                if (patient != null) {
                    //req.body.author = req.user._id;
                    patient.temperatures.push(req.body);
                    patient.save()
                        .then((patient) => {
                            Patients.findById(patient._id)
                                .populate('patients.nurse')
                                .then((patient) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(patient);
                                })
                        }, (err) => next(err));
                } else {
                    err = new Error('Patient ' + req.params.patientId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put((req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /patients/'
            + req.params.patientId + '/temperatures');
    })
    .delete((req, res, next) => {
        Patients.findById(req.params.patientId)
            .then((patient) => {
                if (patient != null) {
                    for (let i = (patient.temperatures.length - 1); i >= 0; i--) {
                        patient.temperatures.id(patient.temperatures[i]._id).remove();
                    }
                    patient.save()
                        .then((patient) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(patient);
                        }, (err) => next(err));
                } else {
                    err = new Error('Patient ' + req.params.patientId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

patientRouter.route('/:patientId/temperatures/:temperatureId')
    .get((req, res, next) => {
        Patients.findById(req.params.patientId)
            .populate('patient.nurse')
            .then((patient) => {
                if (patient != null && patient.temperatures.id(req.params.temperatureId) != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(patient.temperatures.id(req.params.temperatureId));
                } else if (patient == null) {
                    err = new Error('Patient ' + req.params.patientId + ' not found');
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error('Temperature ' + req.params.temperatureId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post((req, res) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /patients/' + req.params.patientId
            + '/temperatures/' + req.params.temperatureId);
    })
    .put((req, res, next) => {
        Patients.findById(req.params.patientId)
            .then((patient) => {
                if (patient != null && patient.temperatures.id(req.params.temperatureId) != null) {
                    if (req.body.value) {
                        patient.temperatures.id(req.params.temperatureId).value = req.body.value;
                    }

                    patient.save()
                        .then((patient) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(patient);
                        }, (err) => next(err));
                } else if (patient == null) {
                    err = new Error('Patient ' + req.params.patientId + ' not found');
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error('Temperature ' + req.params.temperatureId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete((req, res, next) => {
        Patients.findById(req.params.patientId)
            .then((patient) => {
                if (patient != null && patient.temperatures.id(req.params.temperatureId) != null) {
                    patient.temperatures.id(req.params.temperatureId).remove();
                    patient.save()
                        .then((patient) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(patient);
                        }, (err) => next(err));
                } else if (patient == null) {
                    err = new Error('Patient ' + req.params.patientId + ' not found');
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error('Temperature ' + req.params.temperatureId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });





module.exports = patientRouter;