export default {
    testEnvironment: 'node',
    transform: {},
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    testMatch: ['**/tests/**/*.test.js'],
    testTimeout: 30000, // 30 segundos para conexiones a Redis y APIs externas
    collectCoverageFrom: [
        'controllers/**/*.js',
        'model/**/*.js',
        'routes/**/*.js'
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/config/'
    ]
};