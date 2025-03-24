const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    createdAt: String!
    conversionCount: Int!
  }

  type Conversion {
    id: ID!
    url: String!
    source: String!
    format: String!
    title: String
    filename: String
    status: String!
    createdAt: String!
    user: ID
  }

  type AuthData {
    userId: ID!
    token: String!
    tokenExpiration: Int!
    username: String!
  }

  input ConversionInput {
    url: String!
    source: String!
    format: String!
  }

  type Query {
    getConversions: [Conversion!]!
    getConversion(id: ID!): Conversion
    getUser: User
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): AuthData!
    login(email: String!, password: String!): AuthData!
    createConversion(conversionInput: ConversionInput!): Conversion!
    deleteConversion(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;