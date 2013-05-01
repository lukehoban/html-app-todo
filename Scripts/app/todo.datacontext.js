window.todoApp = window.todoApp || {};

window.todoApp.datacontext = (function () {

    var client = new WindowsAzure.MobileServiceClient("https://spa-todo.azure-mobile.net/", "sOpDvYyeKIPNTBwJHbAAyBeXVdaExT94");

    var datacontext = {
        client: client,
        getTodoLists: getTodoLists,
        createTodoItem: createTodoItem,
        createTodoList: createTodoList,
        saveNewTodoItem: saveNewTodoItem,
        saveNewTodoList: saveNewTodoList,
        saveChangedTodoItem: saveChangedTodoItem,
        saveChangedTodoList: saveChangedTodoList,
        deleteTodoItem: deleteTodoItem,
        deleteTodoList: deleteTodoList
    };

    return datacontext;

    function getTodoLists(todoListsObservable, errorObservable) {
        var table = client.getTable("TodoList");
        return table.read().then(function (data) {
            var mappedTodoLists = $.map(data, function (list) { return new createTodoList(list); });
            todoListsObservable(mappedTodoLists);
        }, function (err) {
            errorObservable("Error retrieving todo lists.");
        });
    }
    function createTodoItem(data) {
        return new datacontext.todoItem(data); // todoItem is injected by todo.model.js
    }
    function createTodoList(data) {
        return new datacontext.todoList(data); // todoList is injected by todo.model.js
    }
    function saveNewTodoItem(todoItem) {
        clearErrorMessage(todoItem);

        var table = client.getTable("Todo");
        return table.insert(todoItem.toJS()).then(function (result) {
            todoItem.id = result.id;
        }, function () {
            todoItem.errorMessage("Error adding a new todo item.");
        });
    }
    function saveNewTodoList(todoList) {
        clearErrorMessage(todoList);

        var table = client.getTable("TodoList");
        return table.insert(todoList.toJS()).then(function (result) {
            todoList.todoListId = result.todoListId;
            todoList.userId = result.userId;
        }, function () {
            todoList.errorMessage("Error adding a new todo list.");
        });
    }
    function deleteTodoItem(todoItem) {
        var table = client.getTable("Todo");
        return table.del(todoItem.toJS()).then(null, function () {
            todoItem.errorMessage("Error removing todo item.");
        });
    }
    function deleteTodoList(todoList) {
        var table = client.getTable("TodoList");
        return table.del(todoList.toJS()).then(null, function (e) {
            todoList.errorMessage("Error removing todo list.");
            throw e;
        });
    }
    function saveChangedTodoItem(todoItem) {
        clearErrorMessage(todoItem);

        var table = client.getTable("Todo");
        return table.update(todoItem.toJS()).then(null, function (e) {
            todoItem.errorMessage("Error updating todo item.");
        });
    }
    function saveChangedTodoList(todoList) {
        clearErrorMessage(todoList);

        var table = client.getTable("TodoList");
        return table.update(todoList.toJS()).then(null, function (e) {
            todoList.errorMessage("Error updating the todo list title. Please make sure it is non-empty.");
        });
    }

    // Private
    function clearErrorMessage(entity) { entity.errorMessage(null); }

})();