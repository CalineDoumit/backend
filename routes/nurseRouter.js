const express = require('express');
const bodyParser = require('body-parser');
var authenticate = require('../authenticate');

const Nurses = require('../models/nurses');

const nurseRouter = express.Router();

nurseRouter.use(bodyParser.json());


nurseRouter.route('/')
    .get((req,res,next) => {
        Nurses.find({})
            .then((nurses) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(nurses);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        Nurses.create(req.body)
            .then((nurse) => {
                console.log('Nurse Created ', nurse);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(nurse);


            }, (err) => next(err))
            .catch((err) => next(err));
    }

    )
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /nurses');
    })
    .delete((req, res, next) => {
        Nurses.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

nurseRouter.route('/:nurseId')
    .get((req,res,next) => {
        Nurses.findById(req.params.nurseId)
            .then((nurse) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(nurse);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .post((req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /nurses/' + req.params.nurseId);
    })
    .put((req, res, next) => {
        Nurses.findByIdAndUpdate(req.params.nurseId, {
            $set: req.body
        }, {new: true})
            .then((nurse) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(nurse);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete((req, res, next) => {
        Nurses.findByIdAndRemove(req.params.nurseId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

nurseRouter.route('/:nurseId/robots')
    .get((req,res,next) => {
        Nurses.findById(req.params.nurseId)
            .then((nurse) => {
                if (nurse != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(nurse.robots);
                }
                else {
                    err = new Error('Nurse not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        Nurses.findById(req.params.nurseId)
            .then((nurse) => {
                if (nurse != null) {
                    nurse.robots.push(req.body);
                    nurse.save()
                        .then((nurse) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(nurse);
                        }, (err) => next(err));
                }
                else {
                    err = new Error('Nurse not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /nurses/'
            + req.params.nurseId + '/robots');
    })
    .delete((req, res, next) => {
        Nurses.findById(req.params.nurseId)
            .then((nurse) => {
                if (nurse != null) {
                    for (let i = (nurse.robots.length - 1); i >= 0; i--) {
                        nurse.robots.id(nurse.robots[i]._id).remove();
                    }
                    nurse.save()
                        .then((nurse) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(nurse);
                        }, (err) => next(err));
                } else {
                    err = new Error('nurse not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

nurseRouter.route('/:nurseId/robots/:robotId')
    .get((req,res,next) => {
        Nurses.findById(req.params.nurseId)
            .then((nurse) => {
                if (nurse != null && nurse.robots.id(req.params.robotId) != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(nurse.robots.id(req.params.robotId));
                }
                else if (nurse == null) {
                    err = new Error('Nurse ' + req.params.nurseId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    err = new Error('Robot ' + req.params.robotId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /nurses/'+ req.params.nurseId
            + '/robots/' + req.params.robotId);
    })
    .put((req, res, next) => {
        Nurses.findById(req.params.nurseId)
            .then((nurse) => {
                if (nurse != null && nurse.robots.id(req.params.robotId) != null) {
                    if (req.body.name) {
                        nurse.robots.id(req.params.robotId).name = req.body.name;
                    }
                    nurse.save()
                        .then((nurse) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(nurse);
                        }, (err) => next(err));
                }
                else if (nurse == null) {
                    err = new Error('Nurse ' + req.params.nurseId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    err = new Error('Robot ' + req.params.robotId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete((req, res, next) => {
        Nurses.findById(req.params.nurseId)
            .then((nurse) => {
                if (nurse != null && nurse.robots.id(req.params.robotId) != null) {
                    nurse.robots.id(req.params.robotId).remove();
                    nurse.save()
                        .then((nurse) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(nurse);
                        }, (err) => next(err));
                }
                else if (nurse == null) {
                    err = new Error('Nurse ' + req.params.nurseId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    err = new Error('Robot ' + req.params.robotId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });


module.exports = nurseRouter;