var SyncController = module.exports = function (syncService) {
    this.syncService = syncService;
};

SyncController.prototype.showRefresh = function () {
    return this.syncService.pushing || this.syncService.pulling;
};
