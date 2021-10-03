'use strict';

module.exports = {
  openapi: '3.0.2',
  info: {
    title: 'Express API Template',
    version: '0.0.0-dev',
    description: 'This is a sample server Example server.',
    license: {
      name: 'MIT',
      url: 'https://mit-license.org/',
    },
  },
  externalDocs: {
    description: 'Read more about this API',
    url: 'https://github.com/TobiTenno/express-api-template-Oauth2',
  },
  servers: [{
    url: 'http://localhost:3000',
  }],
  components: {
    securitySchemes: {
      BearerAuth: {
        description: 'Bearer Token authentication. Prefix is "Bearer"',
        type: 'http',
        scheme: 'bearer',
      },
      Basic: {
        description: 'Basic HTTP Authentication. Base-64 string in format of \'email:password\'',
        type: 'http',
        scheme: 'basic',
      },
    },
  },
};
