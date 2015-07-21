/**
 * Created by Emmitt on 7/2/2015.
 */
var assert = require('assert');
var fs = require('fs');
var grunt = require('grunt');

var Reporter = require('../../app/js/reporter');
var version = require('../../package.json').version;

var configurator = require('../../app/js/configurator');
var defaultconfig = require('../../app/config/defaults');
var privateconfig = require('../../app/config/private');

configurator.setStorage({});
configurator.loadConfig(defaultconfig);
configurator.loadConfig(privateconfig);

var logPath = configurator.getString('logPath');

var reporter = new Reporter.instance({
    logPath: logPath,
    oauthToken: configurator.getString('oauthToken'),
    repoOwner: configurator.getString('repoOwner'),
    repo: configurator.getString('repo'),
    maxLogFileKb: configurator.getInt('maxLogFileKb'),
    appVersion: version
});

describe('@Reporter', function() {
    //careful when editing this file as the expected strings are hardcoded with line numbers
    describe('@logNotice', function() {
        var key = 'This is a test';
        var logFileResults = '';
        var textExpected = '';

        before(function(done){
            fs.exists(logPath, function(exists){
                fs.unlink(logPath, function(err) {
                    reporter.logNotice(key, function(){
                        var date = new Date();
                        date = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                        //reporter.js:<line>:<column> this will need to be changed if the code changes
                        textExpected = date + ' I/reporter.js:32:3: ' + key + '\r\n';

                        reporter.stringFromLogFile(null, function(logResults){
                            logFileResults = logResults;
                            done();
                        });
                    });
                });
            });
        });
        it('should create a log file notice', function(done) {
            assert.equal(logFileResults, textExpected);
            fs.exists(logPath, function(exists){
                fs.unlink(logPath, function(err) {
                    done();
                });
            });
        });
    });

    describe('@logWarning', function() {
        var key = 'This is a test';
        var logFileResults = '';
        var textExpected = '';

        before(function(done){
            fs.exists(logPath, function(exists){
                fs.unlink(logPath, function(err) {
                    reporter.logWarning(key, function () {
                        var date = new Date();
                        date = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                        //reporter.js:<line>:<column> this will need to be changed if the code changes
                        textExpected = date + ' W/reporter.js:64:3: ' + key + '\r\n';

                        reporter.stringFromLogFile(null, function(logResults){
                            logFileResults = logResults;
                            done();
                        });
                    });
                });
            });
        });
        it('should create a log file warning', function(done) {
            assert.equal(logFileResults, textExpected);
            fs.exists(logPath, function(exists){
                fs.unlink(logPath, function(err) {
                    done();
                });
            });
        });
    });

    describe('@logError', function() {
        var key = 'This is a test';
        var logFileResults = '';
        var textExpected = '';

        before(function(done){
            fs.exists(logPath, function(exists){
                fs.unlink(logPath, function(err) {
                    reporter.logError(key, function(){
                        var date = new Date();
                        date = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                        //reporter.js:<line>:<column> this will need to be changed if the code changes
                        textExpected = date + ' E/reporter.js:96:3: ' + key + '\r\n';

                        reporter.stringFromLogFile(null, function(logResults){
                            logFileResults = logResults;
                            done();
                        });
                    });
                });
            });
        });
        it('should create a log file error', function(done) {
            assert.equal(logFileResults, textExpected);
            fs.exists(logPath, function(exists){
                fs.unlink(logPath, function(err) {
                    done();
                });
            });
        });
    });

    /* The tests below are activated by a flag at the top of the code
     * They are disabled by default since they require a bit of configuration
     * with an OAUTH Token and a user/repo name given. They also require an
     * active internet connection
     * */
    describe('@reportBug', function(){
        if(reporter.canReportToGithub()) {
            var title = '[Automated] Bug Report';
            var labels = [version, 'Bug Report'];
            labels.sort(function(a, b){return a > b});
            var githubResponse = '';
            before(function (done) {
                reporter.reportBug(title, function (res) {
                    githubResponse = JSON.parse(res);
                    if (githubResponse.message) {
                        assert.fail(false, true, githubResponse.message, '=');
                    }
                    done();
                });
            });
            describe('@reportBugLabels', function(){
                it('should compare the labels of the issue', function () {
                    assert.equal(githubResponse.labels.length, labels.length);
                    githubResponse.labels.sort(function(a, b){return a.name > b.name});
                    for(var i = 0; i < githubResponse.labels.length; i++) {
                        assert.equal(githubResponse.labels[i].name, labels[i]);
                    }
                });
            });
            describe('@reportBugTitle', function(){
                it('should compare the title of the issue', function(){
                    assert.equal(githubResponse.title, title)
                });
            });
        }
    });

    describe('@reportCrash', function(){
        if(reporter.canReportToGithub()) {
            var title = '[Automated] Crash Report';
            var labels = [version, 'Crash Report'];
            labels.sort(function(a, b){return a > b});
            var githubResponse = '';
            before(function (done) {
                reporter.reportCrash(title, null, function (res) {
                    githubResponse = JSON.parse(res);
                    if (githubResponse.message) {
                        assert.fail(false, true, githubResponse.message, '=');
                    }
                    done();
                });
            });
            describe('@reportCrashLabels', function(){
                it('should compare the labels of the issue', function () {
                    assert.equal(githubResponse.labels.length, labels.length);
                    githubResponse.labels.sort(function(a, b){return a.name > b.name});
                    for(var i = 0; i < githubResponse.labels.length; i++) {
                        assert.equal(githubResponse.labels[i].name, labels[i]);
                    }
                });
            });
            describe('@reportCrashTitle', function(){
                it('should compare the title of the issue', function(){
                    assert.equal(githubResponse.title, title)
                });
            });
        }
    });
});
