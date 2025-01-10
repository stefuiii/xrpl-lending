const MAX_CREDIT_SCORE = 1000;

// Generate a random credit score
const generateCreditScore = () => {
  return Math.floor(Math.random() * (MAX_CREDIT_SCORE + 1));
};

module.exports = { generateCreditScore, MAX_CREDIT_SCORE };
