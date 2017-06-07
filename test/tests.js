'use strict';
const {runServer, app, closeServer} = require('../server.js');
const {BlogPost} = require('../models.js');
const faker = require('faker');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mocha = require('mocha');
const mongoose = require('mongoose');

chai.use(chaiHttp);
const should = chai.should();


const generateUserData = ()=>{
  return  {
    title: faker.company.catchPhrase(),
    content: faker.lorem.sentences(),
    author: {
      firstName: faker.name.firstName(),
      lastName:  faker.name.lastName()
    }
  };
};

function seedData(){
  const newData = [];
  for(let i=0; i <= 10; i++){
    newData.push(generateUserData());
  }
  return BlogPost.insertMany(newData);
};

beforeEach(function(){
  return seedData();
});


describe('Users', function(){
  before(function(){
    return runServer();
  });
  after(function(){
    return closeServer();
  });

  it('Get end point', function(){
    let res;
    return chai.request(app)
    .get('/posts')
    .then(function(_res){
      res = _res;
      res.should.have.status(200);
      res.body.should.have.length.of.at.least(1);
      return BlogPost.count();
    });
  });

});


const tearDownDb = ()=>{
  console.info('Deleting database');
  return mongoose.connection.dropDatabase();
};

afterEach(function(){
  return tearDownDb;
});