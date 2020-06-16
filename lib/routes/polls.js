const { Router } = require('express');
const Poll = require('../models/Poll');

module.exports = Router()
  .post('/', (req, res, next) => {
    Poll
      .notifyUsersInOrg(req.body)
      .then(poll => res.send(poll))
      .catch(next);
  })

  .get('/', (req, res, next) => {
    Poll
      .find(req.query)
      .populate('organization', {
        title: true
      })
      .select({
        _id: true,
        title: true
      })
      .then(poll => res.send(poll))
      .catch(next);
  })

  .get('/:id', (req, res, next) => {
    Poll
      .findById(req.params.id)
      .populate('organization', { title: true })
      .then(poll => res.send(poll))
      .catch(next);
  })

  .patch('/:id', (req, res, next) => {
    Poll
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(poll => res.send(poll))
      .catch(next);
  })

  .delete('/:id', (req, res, next) => {
    Poll
      .findByIdAndDelete(req.params.id)
      .then(poll => res.send(poll))
      .catch(next);
  });
