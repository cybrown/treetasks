var TaskSearchController = module.exports = function (taskService) {
    this.taskService = taskService;
    this.tasks = [];
    this.searchTerm = '';
};

TaskSearchController.prototype.search = function () {
    var _this = this;
    this.tasks = this.taskService.findAll().filter(function (task) {
        return task.description.indexOf(_this.searchTerm) !== -1;
    });
};

TaskSearchController.prototype.findTasks = function () {
    return this.tasks;
};
