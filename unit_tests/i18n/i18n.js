
;(function () {
    'use strict';

    var assert = require('assert');
    var config = require('../../app/js/configurator');
    var defaults = require('../../app/config/defaults');
    var Intl = require('../../app/js/i18n');

    config.setStorage({});
    config.loadConfig(defaults);

    describe('@i18n', function () {
        describe('@Defaults', function () {
            let i18n = Intl.getInstance('');

            it('should return a code tag', function () {
                assert.equal(i18n._('test'), '[i18n: test]');
            });

            it('should default to english', function () {
                assert.equal(i18n.getLocale(), 'en');
            });
        });

        describe('@LibraryLoaded', function () {
            let i18nInstance = Intl.getInstance('./unit_tests/i18n/data/');

            it('should return localization', function () {
                assert.equal(i18nInstance._('test'), 'This is a test!');
            });
        });

        describe('@LocalChanged', function () {
            let i18nInstance = Intl.getInstance('./unit_tests/i18n/data/', 'en');
            i18nInstance.setLocale("de");

            it('should change the localization', function () {
                assert.equal(i18nInstance.getLocale(), 'de');
            });

            it('should return localization', function () {
                assert.equal(i18nInstance._('test'), 'Guten tag!');
            });

            it('should use default locale when missing translations', function () {
                assert.equal(i18nInstance._('missingFromDe'), 'This is english!');
            });
       });
    });
})();