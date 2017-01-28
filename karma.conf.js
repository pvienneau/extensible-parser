module.exports = function(config) {
    'use strict';
    config.set({
        autoWatch: true,
        singleRun: true,
        preprocessors: {
            'src/!(*spec).js': ['babel', 'coverage']
        },
        frameworks: [
            'jspm', 'jasmine'
        ],
        plugins: [
            'karma-babel-preprocessor', 'karma-jspm', 'karma-jasmine', 'karma-coverage', 'karma-phantomjs-launcher'
        ],
        jspm: {
            config: 'jspm/config.js',
            loadFiles: ['src/*.spec.js'],
            serveFiles: ['src/!(*spec).js']
        },
        proxies: {
            '/src/': '/base/src/',
            '/jspm_packages/': '/base/jspm/jspm_packages/'
        },
        browsers: ['PhantomJS'],
        reporters: [
            'coverage', 'progress'
        ],
        files: ['node_modules/babel-polyfill/dist/polyfill.js'],
        coverageReporter: {
            instrumenters: {
                isparta: require('isparta')
            },
            instrumenter: {
                'src/*.js': 'isparta'
            },
            reporters: [
                {
                    type: 'text-summary'
                }, {
                    type: 'html',
                    dir: 'coverage/'
                }
            ]
        }
    });
};
