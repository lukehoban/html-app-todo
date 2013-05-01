window.todoApp.todoListViewModel = (function (ko, datacontext) {
    /// <field name="todoLists" value="[new datacontext.todoList()]"></field>
    var todoLists = ko.observableArray(),
        error = ko.observable(),
        user = ko.observable(),
        logIn = function (account) {
            datacontext.client.login(account || "facebook")
                .then(logInSucceeded, logInFailed);

            function logInSucceeded(result) {
                user(result);
                datacontext.getTodoLists(todoLists, error); // load todoLists
            }
            function logInFailed(err) {
                error(err);
            }
        },
        logOff = function () {
            datacontext.client.logout();
            user(datacontext.client.currentUser);
        },
        addTodoList = function () {
            var todoList = datacontext.createTodoList();
            todoList.isEditingListTitle(true);
            datacontext.saveNewTodoList(todoList)
                .then(addSucceeded, addFailed);

            function addSucceeded() {
                showTodoList(todoList);
            }
            function addFailed() {
                error("Save of new todoList failed");
            }
        },
        showTodoList = function (todoList) {
            todoLists.unshift(todoList); // Insert new todoList at the front
        },
        deleteTodoList = function (todoList) {
            todoLists.remove(todoList);
            datacontext.deleteTodoList(todoList)
                .then(null, deleteFailed);

            function deleteFailed() {
                showTodoList(todoList); // re-show the restored list
            }
        };

    return {
        todoLists: todoLists,
        error: error,
        addTodoList: addTodoList,
        deleteTodoList: deleteTodoList,
        user: user,
        logIn: logIn,
        logOff: logOff
    };

})(ko, todoApp.datacontext);

// Initiate the Knockout bindings
ko.applyBindings(window.todoApp.todoListViewModel);
