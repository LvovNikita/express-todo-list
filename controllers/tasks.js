const Task = require('../models/task.js');

// ----- /tasks GET -----
exports.getAllTasks = (req, res, next) => {
  // if user is loggedIn
  if (req.session.isLoggedIn) {
    // Task.find() // all tasks for testing
    // get only tasks created by current user:
    Task.find({'userId': req.user._id}) // req.user = User.findById(req.session.user._id)
      .lean() // converting mongoose object to JSON (fixes issue with denied access)
      .then(tasks => {
        res.render('tasks', {
          tasks: tasks,
        });
      })
      .catch(err => {
        console.log(err);
      });
  // if no session info: redirect to login page
  } else {
    res.redirect('login');
  }
};

// ----- /tasks POST -----
exports.postAddTask = (req, res, next) => {
  const newTask = new Task(req.body);
  // add an author
  newTask.userId = req.user._id; // req.user = User.findById(req.session.user._id)
  newTask.save()
    .then(result => {
      console.log(`/${result._id} created`);
      res.redirect('/tasks');
    })
    .catch(err => {
      console.log(err);
    });
};

// ----- /tasks/:id GET -----
exports.getTask = (req, res, next) => {
  const id = req.params.id;
  Task.findById(id)
    .lean()
    .then(task => {
      res.render('task', {
        task: task,
        taskExists: true,
        isAuthorized: task.userId.toString() === req.user._id.toString() // req.user = User.findById(req.session.user._id)
      })
    })
    .catch(err => {
      res.render('task', {
        task: {
          _id: id
        },
        taskExists: false,
      })
    });
  next();
};

exports.removeTask = (req, res, next) => {
  Task.findById(req.params.id)
    .then(task => {
      // stringify/covert to json objects before comparing!
      // req.user = User.findById(req.session.user._id)
      const isAuthorized = task.userId.toString() === req.user._id.toString()
      if(isAuthorized) {
        Task.deleteOne({'_id': req.params.id})
          .then(result => {
            res.redirect('/tasks');
            next();
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        console.log('DENIED!') // TODO
        res.redirect('/tasks');
        next();
      };
    })
    .catch(err => {
      console.log(err);
    });
};

exports.updateTask = (req, res, next) => {
  Task.findById(req.params.id)
    .then(task => {
      // stringify/covert to json objects before comparing!
      // req.user = User.findById(req.session.user._id)
      const isAuthorized = task.userId.toString() === req.user._id.toString();
      if(isAuthorized) {
        Task.updateOne({'_id': req.params.id}, req.body)
          .then(result => {
            res.redirect('/tasks');
            next();
          })
          .catch(err => {
            console.log(err);
          })
      } else {
        res.redirect('/tasks')
      }
    })
    .catch(err => {
      console.log(err);
    });
};
