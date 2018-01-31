const GraphQLDate = require('graphql-date');

const Query = require('./query');
const Mutation = require('./mutation');

module.exports =  {
    Query,
    Mutation,

    Event: {
      users: event => event.getUsers(),
      room: event => event.getRoom(),
    },

    Date: GraphQLDate
  };
