var TaskBaseController = require('./TaskBaseController');

var TaskTodoController = module.exports = function ($scope, taskService) {
    var _this = this;
    TaskBaseController.call(this, taskService);
    this.tasks = [];
    var computeTasks = function () {
        var tt = _this.taskService.findAll().filter(function (task) {
            return task.done === false && task.children.toArray().filter(function (task) {
                return task.done === false;
            }).length === 0;
        });
        _this.tasks.length = 0;
        [].push.apply(_this.tasks, tt);
    };
    computeTasks();
    $scope.$on('tasks.change', function () {
        computeTasks();
    });
};
TaskTodoController.prototype = Object.create(TaskBaseController.prototype);

TaskTodoController.prototype.findTasks = function () {
    return this.tasks;
};
