var Task = require('../entities/Task');

var TaskListDirective = module.exports = function (clipService) {
    return {
        restrict: 'E',
        scope: {
            tasks: '=',
            onCreate: '&',
            onSave: '&',
            onDelete: '&',
            onTaskDone: '&',
            onRemovePrerequisite: '&',
            onRemovePostrequisite: '&',
            hideParent: '@'
        },
        templateUrl: 'views/directives/task-list.html',
        link: function (scope, elem, attrs) {
            scope.showDeleteBtn = function (task) {
                return !!attrs.onDelete;
            };
            scope.showCreateBtn = function (task) {
                return !!attrs.onCreate;
            };
            scope.showRemovePrerequisiteBtn = function (task) {
                return !!attrs.onRemovePrerequisite;
            };
            scope.showRemovePostrequisiteBtn = function (task) {
                return !!attrs.onRemovePostrequisite;
            };
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
                scope.onTaskDone({task: task});
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
                    scope.onSave({task: task});
                }
            };
            scope.favorite = function (task) {
                task.favorite = !task.favorite;
                scope.onSave({task: task});
            };
            scope.release = function (task) {
                task.postrequisites.forEach(function (_task) {
                    _task.prerequisites.delete(task);
                });
                task.postrequisites.clear();
                scope.onSave({task: task});
                clipService.clear();
            };
            scope.removePrerequisite = function (task) {
                scope.onRemovePrerequisite({task: task});
            };
            scope.removePostrequisite = function (task) {
                scope.onRemovePostrequisite({task: task});
            };
        }
    };
};
