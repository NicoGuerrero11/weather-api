export default {
    testEnvironment: 'node',
    transform: {},
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    testMatch: ['**/__tests__/**/*.test.js'],
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