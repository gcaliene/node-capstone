const uuid = require('uuid');
const mongoose = require('mongoose');

const petPostSchema = mongoose.Schema({
  text: { type: String, required: true },
  userName: { type: String, required: true },
  created: { type: Date, default: Date.now }
});

petPostSchema.virtual('name').get(function() {
  return `${this.userName}`.trim();
});

// this is an *instance method* which will be available on all instances
// of the model. This method will be used to return an object that only
// exposes *some* of the fields we want from the underlying data

petPostSchema.methods.apiRepr = function() {
  return {
    _id: this._id,
    text: this.text,
    name: this.userName, //name is the api representation (what shows in get) and userName is how it is stored as.
    created: this.created
  };
};

//make sure everything is defined before exporting
var PetPost = mongoose.model('PetPost', petPostSchema);
module.exports = { PetPost };
//line 23-24 should not be merged, learned the hard way
