/* global angular */

angular.module('cy.util', [])
    .directive('cyActiveOnState', require('./directives/CyOnActiveStateDirective'))
    .service('clipService', require('./services/ClipService'));
