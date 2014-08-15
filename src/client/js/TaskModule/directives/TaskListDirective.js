var Task = require('../entities/Task');

var TaskListDirective = module.exports = function (taskService, clipService) {
    return {
        restrict: 'E',
        scope: {
            tasks: '=',
            onCreate: '&',
            onSave: '&',
            onDelete: '&',
            hideParent: '@'
        },
        templateUrl: 'views/directives/task-list.html',
        link: function (scope, elem, attrs) {
            scope.showReleaseBtn = function (task) {
                if (clipService.hasData('task')) {
                    return clipService.getData().id === task.id;
                }
                return false;
            };
            scope.showPasteBtn = function (task) {
                if (clipService.hasData('task')) {
                    return clipService.getData().id !== task.id;
                }
                return false;
            };
            scope.showCutBtn = function (task) {
                return !clipService.hasData('task');
            };

            scope.cut = function (task) {
                clipService.setData(task, 'task');
            };

            scope.setDone = function (task, done) {
                task.done = done;
                taskService.save(task);
            };
            scope.create = function (parentTask, description) {
                var task = new Task();
                task.postrequisites.add(parentTask);
                task.description = description;
                if (parentTask) {
                    parentTask.prerequisites.add(task);
                }
                scope.onCreate({task: task});
            };
            scope.remove = function (task) {
                scope.onDelete({task: task});
            };
            scope.paste = function (parentTask) {
                if (clipService.hasData('task')) {
                    var task = clipService.getData();
                    task.postrequisites.add(parentTask);
                    parentTask.prerequisites.add(task);
                    clipService.clear();
                    taskService.save(task);
                }
            };
            scope.favorite = function (task) {
                task.favorite = !task.favorite;
                taskService.save(task);
            };
            scope.release = function (task) {
                task.postrequisites.forEach(function (_task) {
                    _task.prerequisites.delete(task);
                });
                task.postrequisites.clear();
                taskService.save(task);
                clipService.clear();
            };
        }
    };
};
