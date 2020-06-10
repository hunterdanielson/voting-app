const { Router } = require('express');
const Poll = require('../models/Poll');

module.exports = Router()
  .post('/', (req, res, next) => {
    Poll
      .create(req.body)
      .then(user => res.send(user))
      .catch(next);
  })

  .get('/', (req, res, next) => {
    Poll
      .find(req.query)
      .select({
        _id: true,
        title: true
      })
      .then(user => res.send(user))
      .catch(next);
  })

  .get('/:id', (req, res, next) => {
    Poll
      .findById(req.params.id)
      .then(user => res.send(user))
      .catch(next);
  })

  .patch('/:id', (req, res, next) => {
    Poll
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(user => res.send(user))
      .catch(next);
  })

  .delete('/:id', (req, res, next) => {
    Poll
      .findByIdAndDelete(req.params.id)
      .then(user => res.send(user))
      .catch(next);
  });
