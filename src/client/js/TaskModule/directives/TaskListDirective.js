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
                task.parent = parentTask;
                task.description = description;
                if (parentTask) {
                    parentTask.children.add(task);
                }
                scope.onCreate({task: task});
            };
            scope.remove = function (task) {
                scope.onDelete({task: task});
            };
            scope.paste = function (parentTask) {
                if (clipService.hasData('task')) {
                    var task = clipService.getData();
                    if (task.parent) {
                        task.parent.children.delete(task);
                    }
                    task.parent = parentTask;
                    parentTask.children.add(task);
                    clipService.clear();
                    taskService.save(task);
                }
            };
            scope.release = function (task) {
                if (task.parent) {
                    task.parent.children.delete(task);
                }
                task.parent = null;
                taskService.save(task);
                clipService.clear();
            };
        }
    };
};
