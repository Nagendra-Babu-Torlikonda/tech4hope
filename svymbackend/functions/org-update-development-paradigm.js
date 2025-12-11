const { connectDB } = require('./utils/mongodb');
const Organization = require('./models/Organization');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  try {
    const { developmentParadigm } = JSON.parse(event.body);
    if (!developmentParadigm || typeof developmentParadigm !== 'string' || developmentParadigm.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Development Paradigm is required and must be a non-empty string' }),
      };
    }

    await connectDB();
    const org = await Organization.getSingleton();
    if (!org) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Organization data not found' }),
      };
    }

    org.aboutus.developmentParadigm = developmentParadigm.trim();
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Development Paradigm updated successfully' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
