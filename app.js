var express = require('express');
var bodyParser = require('body-parser');
var { ObjectId } = require('mongodb');
var _ = require('lodash');

var { mongoose } = require('./server/mongoose');
var { Todo } = require('./server/models/todo');
var { User } = require('./server/models/user');

var app = express();

app.use(bodyParser.json());

// post todo
app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    })
})

// get all todos
app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.status(200).send({ todos });
    }, (e) => {
        res.status(400).send(e);
    })
})

// get a todo by id
app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    Todo.findById(id).then((todo) => {
        res.send(todo);
    }, (e) => {
        res.status(400).send(e);
    })
})


// delete a todo by id
app.delete('/todo/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findByIdAndRemove(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send(todo);
    }).catch((e) => {
        res.status(400).send();
    });
})


// update a todo by id
app.patch('/todo/:id', (req, res) => {
    var id = req.params.id;

    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, { $set: body }, { new: true }).then((todo) => {

        if (!todo) {
            return res.status(404).send();
        }
        res.send(todo);

    }).catch((e) => {
        res.status(400).send();
    })
})

app.listen(3000, () => {
    console.log('Started on port 3000');
});