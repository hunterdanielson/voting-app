const { Router } = require('express');
const Organization = require('../models/Organization');

module.exports = Router()
  .post('/', (req, res, next) => {
    Organization
      .create(req.body)
      .then(organization => res.send(organization))
      .catch(next);
  })

  .get('/', (req, res, next) => {
    Organization
      .find(req.query)
      .select({
        title: true
      })
      .then(organization => res.send(organization))
      .catch(next);
  })

  .get('/:id', (req, res, next) => {
    Organization
      .findById(req.params.id)
      .then(organization => res.send(organization))
      .catch(next);
  })

  .patch('/:id', (req, res, next) => {
    Organization
      .findByIdAndUpdate(req.params.id)
      .then(organization => res.send(organization))
      .catch(next);
  })

  .delete('/:id', (req, res, next) => {
    Organization
      .findByIdAndDelete(req.params.id)
      .then(organization => res.send(organization))
      .catch(next);
  });
