var ApplicationCacheController = module.exports = function ApplicationCacheController (applicationCacheService) {
    this.applicationCacheService = applicationCacheService;
};

ApplicationCacheController.prototype.updateReady = function () {
    return this.applicationCacheService.update;
};
