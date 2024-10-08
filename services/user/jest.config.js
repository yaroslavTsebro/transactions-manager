module.exports = async () => {
  return {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'ts'],
    roots: ['<rootDir>/src/__tests__'],
  };
};