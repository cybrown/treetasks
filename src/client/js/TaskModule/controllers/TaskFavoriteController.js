var TaskBaseController = require('./TaskBaseController');

var TaskFavoriteController = module.exports = function TaskFavoriteController ($scope, taskService) {
    var _this = this;
    TaskBaseController.call(this, taskService);
    this.tasks = [];
    var computeTasks = function () {
        var tt = _this.taskService.findAll().filter(function (task) {
            return task.favorite;
        });
        _this.tasks.length = 0;
        [].push.apply(_this.tasks, tt);
    };
    computeTasks();
    $scope.$on('tasks.change', function () {
        computeTasks();
    });
};
TaskFavoriteController.prototype = Object.create(TaskBaseController.prototype);

TaskFavoriteController.prototype.findTasks = function () {
    return this.tasks;
};

TaskFavoriteController.prototype.create = function (task) {
    task.favorite = true;
    TaskBaseController.prototype.create.call(this, task);
};
