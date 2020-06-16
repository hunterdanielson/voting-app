const { Router } = require('express');
const Membership = require('../models/Membership');
const ensureAuth = require('../middleware/ensureAuth');

module.exports = Router()
  .post('/', ensureAuth, (req, res, next) => {
    Membership
      .create(req.body)
      .then(membership => res.send(membership))
      .catch(next);
  })

  .get('/', ensureAuth, (req, res, next) => {
    Membership
      .find(req.query)
      .populate('user', {
        name: true,
        imageUrl: true
      })
      .populate('organization', {
        title: true,
        imageUrl: true
      })
      .then(membership => res.send(membership))
      .catch(next);
  })

  .delete('/:id', ensureAuth, async(req, res, next) => {
    Membership
      .deleteMemberVotes(req.params.id)
      .then(membership => res.send(membership))
      .catch(next);
  });
