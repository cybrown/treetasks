/* global window */

var ApplicationCacheService = module.exports = function ApplicationCacheService ($timeout) {
    this.$timeout = $timeout;
    this.update = false;
    this.init();
};

ApplicationCacheService.prototype.init = function () {
    var _this = this;
    window.applicationCache.addEventListener('updateready', function (e) {
        _this.$timeout(function () {
            if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
                _this.update = true;
            }
        });
    });
};
