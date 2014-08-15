var ROUTES = module.exports = [{
    name: 'root',
    templateUrl: 'views/common/layout.html',
    abstract: true
}, {
    name: 'tasks',
    url: '',
    views: {
        main: {
            templateUrl: 'views/common/uiview.html'
        }
    },
    abstract: true,
    parent: 'root'
}, {
    name: 'tasks.todo',
    url: '/',
    templateUrl: 'views/tasks/todo.html',
    controller: 'TaskTodoController',
    controllerAs: 'ctrl'
}, {
    name: 'tasks.all',
    url: '/all',
    templateUrl: 'views/tasks/all.html',
    controller: 'TaskAllController',
    controllerAs: 'ctrl'
}, {
    name: 'tasks.details',
    url: '/details/:id',
    templateUrl: 'views/tasks/details.html',
    controller: 'TaskDetailsController',
    controllerAs: 'ctrl'
}, {
    name: 'tasks.search',
    url: '/search',
    templateUrl: 'views/tasks/search.html',
    controller: 'TaskSearchController',
    controllerAs: 'ctrl'
}];
