var Task = require('../entities/Task');

var TaskCreateDirective = module.exports = function () {
    return {
        restrict: 'E',
        scope: {
            onCreate: '&'
        },
        templateUrl: 'views/directives/task-create.html',
        link: function (scope, elem, attrs) {
            scope.create = function () {
                var task = new Task();
                task.description = scope.description;
                scope.description = '';
                scope.onCreate({task: task});
            };
        }
    };
};
