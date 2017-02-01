module.exports = function(config) {
    'use strict';
    config.set({
        autoWatch: true,
        singleRun: true,
        preprocessors: {
            'src/!(*spec).js': ['babel', 'sourcemap']
        },

        babelPreprocessor: {
            options: {
                sourceMap: 'inline'
            },
            sourceFileName: function(file) {
                return file.originalPath;
            }
        },
        frameworks: [
            'jspm', 'jasmine', 'sinon', 'jasmine-matchers'
        ],
        plugins: [
            'karma-babel-preprocessor',
            'karma-jspm',
            'karma-jasmine',
            'karma-phantomjs-launcher',
            'karma-sourcemap-loader',
            'karma-sinon',
            'karma-jasmine-diff-reporter',
            'karma-jasmine-matchers',
        ],
        jasmineMatchers: [
            'jasmine-matcher-subset',
        ],
        jspm: {
            config: 'jspm/config.js',
            loadFiles: ['src/*.spec.js'],
            serveFiles: ['src/!(*spec).js', 'src/*/!(*spec).js']
        },
        proxies: {
            '/src/': '/base/src/',
            '/jspm_packages/': '/base/jspm/jspm_packages/'
        },
        browsers: ['PhantomJS'],
        reporters: ['jasmine-diff', 'progress'],
        files: [
            'node_modules/babel-polyfill/dist/polyfill.js'
        ]
    });
};
