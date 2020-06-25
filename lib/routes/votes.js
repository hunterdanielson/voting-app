const { Router } = require('express');
const Vote = require('../models/Vote');
const ensureAuth = require('../middleware/ensureAuth');

module.exports = Router()
  .post('/', ensureAuth, (req, res, next) => {
    Vote
      .createIfValidMember(req.body, req.user)
      .then(vote => res.send(vote))
      .catch(next);
  })

  .get('/', ensureAuth, (req, res, next) => {
    Vote
      .find(req.query)
      .populate('user', 'poll')
      .then(vote => res.send(vote))
      .catch(next);
  })
  .get('/vote-count', (req, res, next) => {
    Vote
      .voteCount()
      .then(votesCount => res.send(votesCount))
      .catch(next);
  })
  .get('/option-count/:id', (req, res, next) => {
    Vote
      .voteOptionCount(req.params.id)
      .then(optionsCount => res.send(optionsCount))
      .catch(next);
  })

  .get('/:id', ensureAuth, (req, res, next) => {
    Vote
      .findById(req.params.id)
      .populate('user', 'poll')
      .then(vote => res.send(vote))
      .catch(next);
  })

  .patch('/:id', ensureAuth, (req, res, next) => {
    Vote
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(vote => res.send(vote))
      .catch(next);
  })

  .delete('/:id', ensureAuth, (req, res, next) => {
    Vote
      .findByIdAndDelete(req.params.id)
      .then(vote => res.send(vote))
      .catch(next);
  });
