const User = require('../models/User');
const Conversion = require('../models/Conversion');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');
const { convertMedia } = require('../utils/pythonConverter');

// Custom error types
const UserInputError = (message, extensions) => {
  return new GraphQLError(message, {
    extensions: {
      code: 'BAD_USER_INPUT',
      ...extensions,
    },
  });
};

const AuthenticationError = (message) => {
  return new GraphQLError(message, {
    extensions: {
      code: 'UNAUTHENTICATED',
    },
  });
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const resolvers = {
  Query: {
    async getConversions(_, __, { req }) {
      if (!req.isAuth) {
        throw new AuthenticationError('Unauthenticated');
      }

      try {
        const conversions = await Conversion.find({ user: req.userId }).sort({ createdAt: -1 });
        return conversions;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getConversion(_, { id }, { req }) {
      if (!req.isAuth) {
        throw new AuthenticationError('Unauthenticated');
      }

      try {
        const conversion = await Conversion.findById(id);
        if (conversion && conversion.user.toString() === req.userId) {
          return conversion;
        } else {
          throw new Error('Conversion not found');
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getUser(_, __, { req }) {
      if (!req.isAuth) {
        throw new AuthenticationError('Unauthenticated');
      }

      try {
        const user = await User.findById(req.userId);
        if (user) {
          return {
            ...user._doc,
            id: user._id,
            conversionCount: await Conversion.countDocuments({ user: req.userId })
          };
        } else {
          throw new Error('User not found');
        }
      } catch (err) {
        throw new Error(err);
      }
    }
  },
  Mutation: {
    async register(_, { username, email, password }) {
      // Validate input
      if (!username || !email || !password) {
        throw new UserInputError('All fields are required');
      }
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new UserInputError('Email is already taken');
      }

      // Hash password and create new user
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      });

      const result = await newUser.save();
      
      const token = generateToken(result);

      return {
        userId: result.id,
        token,
        tokenExpiration: 1,
        username: result.username
      };
    },
    
    async login(_, { email, password }) {
      const user = await User.findOne({ email });
      
      if (!user) {
        throw new UserInputError('User not found');
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        throw new UserInputError('Invalid credentials');
      }
      
      const token = generateToken(user);
      
      return {
        userId: user.id,
        token,
        tokenExpiration: 1,
        username: user.username
      };
    },
    
    async createConversion(_, { conversionInput: { url, source, format } }, { req }) {
      if (!req.isAuth) {
        throw new AuthenticationError('Unauthenticated');
      }
      
      try {
        // Create a new conversion record
        const newConversion = new Conversion({
          url,
          source,
          format,
          status: 'processing',
          createdAt: new Date().toISOString(),
          user: req.userId
        });
        
        // Save to database
        const conversion = await newConversion.save();
        
        // Call Python converter
        const result = await convertMedia(url, source, format, conversion.id);
        
        // Update conversion with results
        conversion.status = result.success ? 'completed' : 'failed';
        conversion.title = result.title || null;
        conversion.filename = result.filename || null;
        
        await conversion.save();
        
        return conversion;
      } catch (err) {
        console.error('Conversion error:', err);
        throw new Error('Failed to convert media: ' + err.message);
      }
    },
    
    async deleteConversion(_, { id }, { req }) {
      if (!req.isAuth) {
        throw new AuthenticationError('Unauthenticated');
      }
      
      try {
        const conversion = await Conversion.findById(id);
        
        if (!conversion) {
          throw new Error('Conversion not found');
        }
        
        if (conversion.user.toString() !== req.userId) {
          throw new AuthenticationError('Action not allowed');
        }
        
        await Conversion.findByIdAndDelete(id);
        return true;
      } catch (err) {
        throw new Error(err);
      }
    }
  }
};

module.exports = resolvers;