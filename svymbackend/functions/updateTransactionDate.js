const { connectDB } = require("./utils/mongodb");
const Transaction = require("./models/Transaction");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    await connectDB();

    const { transactionId, newDate } = JSON.parse(event.body);

    if (!transactionId || !newDate) {
      return { statusCode: 400, body: JSON.stringify({ message: 'transactionId and newDate are required' }) };
    }

    // Validate date format
    const date = new Date(newDate);
    if (isNaN(date.getTime())) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Invalid date format' }) };
    }

    // Update the transaction date
    const result = await Transaction.findOneAndUpdate(
      { transactionId },
      { paymentDate: date },
      { new: true }
    );

    if (!result) {
      return { statusCode: 404, body: JSON.stringify({ message: 'Transaction not found' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Transaction date updated successfully',
        transaction: {
          transactionId: result.transactionId,
          paymentDate: result.paymentDate
        }
      })
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};
