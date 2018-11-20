var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var board = new Schema({
   title:  {type: String},
   author: {type: String},
   content: {type: String},
   created_at: {type: String},
   modified_at:  {type: String},
   hits: {type: String, default: 0}
});

module.exports = mongoose.model('board', board);
