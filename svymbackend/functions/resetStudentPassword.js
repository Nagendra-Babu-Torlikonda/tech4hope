const { connectDB } = require('./utils/mongodb');
const User = require('./models/User');
const bcrypt = require('bcrypt');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    if (!event.body) return { statusCode: 400, body: JSON.stringify({ message: 'Request body required' }) };

    const { userId } = JSON.parse(event.body);
    if (!userId) return { statusCode: 400, body: JSON.stringify({ message: 'userId is required' }) };

    await connectDB();
    const user = await User.findOne({ userId });
    if (!user) return { statusCode: 404, body: JSON.stringify({ message: 'User not found' }) };

    // Extract the last 5 digits from userId (e.g., SVYM12345 -> 12345)
    const passwordSuffix = userId.slice(-5);
    if (!/^\d{5}$/.test(passwordSuffix)) return { statusCode: 400, body: JSON.stringify({ message: 'Invalid userId format' }) };

    // Hash the new password
    const hashedPassword = await bcrypt.hash(passwordSuffix, 10);

    // Reset password and set first login flag
    user.password = hashedPassword;
    user.isFirstLogin = true;
    await user.save();

    return { statusCode: 200, body: JSON.stringify({ message: 'Password reset successfully. Student can now login with the default password.' }) };
  } catch (err) {
    console.error('resetStudentPassword error:', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error', error: err.message }) };
  }
};
