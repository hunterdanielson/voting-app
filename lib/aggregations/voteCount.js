module.exports = [
  {
    '$group': {
      '_id': '$poll', 
      'count': {
        '$sum': 1
      }
    }
  }
];
