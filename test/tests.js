'use strict';
const {runServer, app, closeServer} = require('../server.js');
const {BlogPost} = require('../models.js');
const faker = require('faker');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mocha = require('mocha');
const mongoose = require('mongoose');

chai.use(require('chai-moment'));
chai.use(chaiHttp);
const should = chai.should();
const expect = chai.expect();


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

function tearDownDb(){
  console.info('Deleting database');
  return mongoose.connection.dropDatabase();
}

afterEach(function(){
  return tearDownDb();
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
    })
    .then(function(count){
      res.body.should.have.length(count);
    });
  });

  it('Get end point by id', function(){
    let foundUser;

    return BlogPost
      .findOne()
      .exec()
      .then(function(res){
        foundUser = {
          id: res.id,
          title: res.title,
          content: res.content,
          author: `${res.author.firstName} ${res.author.lastName}`,
          created: res.created
        };
        return chai.request(app)
        .get(`/posts/${foundUser.id}`)
        .then(function(currentPost){
          currentPost.body.id.should.equal(foundUser.id);
          currentPost.body.title.should.equal(foundUser.title);
          currentPost.body.author.should.equal(foundUser.author);
          currentPost.body.content.should.equal(foundUser.content);
          currentPost.body.created.should.be.sameMoment(foundUser.created);
        });
      });
  });
});