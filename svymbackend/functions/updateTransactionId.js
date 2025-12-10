const { connectDB } = require("./utils/mongodb");
const Transaction = require("./models/Transaction");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    await connectDB();

    const { transactionId, newTransactionId } = JSON.parse(event.body);

    if (!transactionId || !newTransactionId) {
      return { statusCode: 400, body: JSON.stringify({ message: 'transactionId and newTransactionId are required' }) };
    }

    // Check if the new transaction ID already exists
    const existingTransaction = await Transaction.findOne({ transactionId: newTransactionId });
    if (existingTransaction) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Transaction ID already exists' }) };
    }

    // Update the transaction ID
    const result = await Transaction.findOneAndUpdate(
      { transactionId },
      { transactionId: newTransactionId },
      { new: true }
    );

    if (!result) {
      return { statusCode: 404, body: JSON.stringify({ message: 'Transaction not found' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Transaction ID updated successfully',
        transaction: {
          oldTransactionId: transactionId,
          newTransactionId: result.transactionId
        }
      })
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};
