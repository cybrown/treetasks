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
