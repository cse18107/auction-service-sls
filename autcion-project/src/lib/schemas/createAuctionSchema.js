const schema = {
  type: "object",
  properties: {
    body: {
        type: 'object',
        properties: {
            title: {
                type: 'string',
            },
        },
        required: ['title'],
    },
  },
  required: ['body'],
};

module.exports = schema;