var CyOnActiveStateDirective = module.exports = function ($rootScope, $state) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            var onChangeState = function () {
                if ($state.includes(attrs.cyActiveOnState)) {
                    elem.addClass('active');
                } else {
                    elem.removeClass('active');
                }
            };
            onChangeState();
            $rootScope.$on('$stateChangeSuccess', onChangeState);
        }
    };
};
