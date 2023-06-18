const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };
    
    assert.deepEqual(user, expectedUserID);
     // Write your assert statement here
  });

  it('should return undefined if given email is not found', function() {
    const user = getUserByEmail("no@example.com", testUsers);
    const expectedUserID = undefined;
    assert.deepEqual(user, expectedUserID);
  });
});