const express = require('express');
const path = require('path');
const router = express.Router();

// ----- MODELS/DATA (FOR TESTING) -----

const Task = require('../models/task.js');
const User = require('../models/user.js');

  // Check: /models/task.js
  // FOR LOCAL TESTING:
  // + instance_of_Task_class.add() – push instance of Task class to data array
  // + Task.fetchAll() – static get data array method
  // + Task.getchById(id) — get array of one element

// ----- CONTOLLERS -----

const tasksController = require('../controllers/tasks.js');

  // + tasksController.getAllTasks()
  // + tasksController.postAddTask()
  // + taskContorller.getTask()

// ----- MIDDLEWARE -----

  // redirect to login page if is not logged in

const isAuth = require('../middleware/is_auth.js')

// ----- ROUTES -----

  // + /tasks GET — show task-list;
  // + /tasks POST — add new task;

router.get('/', isAuth, tasksController.getAllTasks);
router.post('/', isAuth, tasksController.postAddTask);

  // + /tasks/:id GET — task's info;
  // + /tasks/:id//update POST — update task;
  // + /tasks/:id/remove POST — remove task;

router.get('/:id', isAuth, tasksController.getTask);
router.post('/:id/update', isAuth, tasksController.updateTask);
router.post('/:id/remove', isAuth, tasksController.removeTask);

// ----- next() LOGS -----

router.use('/', (req, res, next) => {
  console.log(req.url, req.method);
  // res.end();
});

// ----- EXPORT -----

exports.routes = router;
