var Task = require('../entities/Task');

var TaskCreateDirective = module.exports = function (taskService) {
    return {
        restrict: 'E',
        scope: {
            onCreate: '&',
            parentId: '@'
        },
        templateUrl: 'views/directives/task-create.html',
        link: function (scope, elem, attrs) {
            scope.parent = taskService.findById(Number(scope.parentId));
            scope.create = function () {
                var task = new Task();
                task.parent = scope.parent;
                task.description = scope.description;
                scope.description = '';
                if (scope.parent) {
                    scope.parent.children.add(task);
                }
                scope.onCreate({task: task});
            };
        }
    };
};
