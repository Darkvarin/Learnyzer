module.exports = {
  apps: [{
    name: 'learnyzer',
    script: 'dist/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: '5000',
      DATABASE_URL: 'postgresql://postgres:LearnyzerDB2024@database-1.cro6kewkgl4r.ap-south-1.rds.amazonaws.com:5432/learnyzer',
      OPENAI_API_KEY: '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',
      TWOFACTOR_API_KEY: '75c5f204-57d8-11f0-a562-0200cd936042',
      RAZORPAY_KEY_ID: 'rzp_test_KofqomcGyXcjRP',
      RAZORPAY_KEY_SECRET: 'dqYO8RMzv4QaEiTOiP97fLka'
    }
  }]
};
