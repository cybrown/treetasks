var TaskBaseController = require('./TaskBaseController');

var TaskDoneController = module.exports = function TaskDoneController ($scope, taskService) {
    var _this = this;
    TaskBaseController.call(this, taskService);
    this.tasks = [];
    var computeTasks = function () {
        var tt = _this.taskService.findAll().filter(function (task) {
            return task.done;
        });
        _this.tasks.length = 0;
        [].push.apply(_this.tasks, tt);
    };
    computeTasks();
    $scope.$on('tasks.change', function () {
        computeTasks();
    });
};
TaskDoneController.prototype = Object.create(TaskBaseController.prototype);

TaskDoneController.prototype.findTasks = function () {
    return this.tasks;
};

TaskBaseController.prototype.delete = function (task) {
    var _this = this;
    this.taskService.remove(task);
};
