var Task = require('../entities/Task');

var TaskCreateDirective = module.exports = function (taskService) {
    return {
        restrict: 'E',
        scope: {
            onCreate: '&',
            postrequisiteTaskId: '@'
        },
        templateUrl: 'views/directives/task-create.html',
        link: function (scope, elem, attrs) {
            scope.postrequisiteTask = taskService.findById(Number(scope.postrequisiteTaskId));
            scope.create = function () {
                var task = new Task();
                if (scope.postrequisiteTask) {
                    task.postrequisites.add(scope.postrequisiteTask);
                    scope.postrequisiteTask.prerequisites.add(task);
                }
                task.description = scope.description;
                scope.description = '';
                scope.onCreate({task: task});
            };
        }
    };
};
