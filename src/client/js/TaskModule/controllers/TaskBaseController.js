var TaskBaseController = module.exports = function (taskService) {
    this.taskService = taskService;
    this.tasks = [];
};

TaskBaseController.prototype.save = function (task) {
    this.taskService.save(task);
};

TaskBaseController.prototype.create = function (task) {
    this.taskService.create(task);
};

TaskBaseController.prototype.taskDone = function (task) {
    task.done = !task.done;
    this.taskService.save(task);
};

TaskBaseController.prototype.delete = function (task) {
    var _this = this;
    task.prerequisites.forEach(function (_task) {
        _task.postrequisites.delete(task);
        _this.taskService.save(_task);
    });
    task.postrequisites.forEach(function (_task) {
        _task.prerequisites.delete(task);
        _this.taskService.save(_task);
    });
    this.taskService.remove(task);
};
