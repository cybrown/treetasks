var TaskService = module.exports = function ($http, BASE_URL, $q, syncService, $rootScope) {
    this.syncService = syncService;
    this.$rootScope = $rootScope;
};

TaskService.prototype.findAll = function () {
    return this.syncService.tasks;
};

TaskService.prototype.findById = function (id) {
    for (var i = 0; i < this.syncService.tasks.length; i++) {
        if (this.syncService.tasks.hasOwnProperty(i)) {
            if (this.syncService.tasks[i].id === id) {
                return this.syncService.tasks[i];
            }
        }
    }
    return null;
};

TaskService.prototype.create = function (task) {
    this.syncService.create(task);
    this.$rootScope.$broadcast('tasks.change');
};

TaskService.prototype.save = function (task) {
    this.syncService.update(task);
    this.$rootScope.$broadcast('tasks.change');
};

TaskService.prototype.remove = function (task) {
    this.syncService.remove(task);
    this.$rootScope.$broadcast('tasks.change');
};
