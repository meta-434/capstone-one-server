module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgres://sccbzsoqyhojoc:98e37035813fa36ef36827b37fbd0a9e20942e3fdda4dd89826adb4d12134dfa@ec2-18-235-20-228.compute-1.amazonaws.com:5432/da1ir0ekmrebrp",
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL ||
    "postgresql://postgres@localhost/capstone_one_test",
  SECRET_KEY: process.env.SECRET_KEY || "default-key",
};
