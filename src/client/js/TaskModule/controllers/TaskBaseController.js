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

TaskBaseController.prototype.delete = function (task) {
    this.taskService.remove(task);
};
