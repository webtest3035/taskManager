const tasksUrl = "https://taskmanager-v1gb.onrender.com/tasks";
const taskNameInput = document.getElementById("taskName");
const taskDescriptionInput = document.getElementById("taskDiscription");
const taskPriorityInput = document.getElementById("taskPriority");
const taskDeadlineInput = document.getElementById("taskDeadline");
const taskStatusInput = document.getElementById("taskStatus");
const taskInputSubmit = document.getElementById("taskInputSubmit");
const taskUpdateSubmit = document.getElementById("taskUpdateSubmit");
const table = document.getElementById("table");
const taskSearchSubmit = document.getElementById("taskSearchSubmit");
const taskFiltersButtons = document.getElementById("taskFiltersButtons");


showTaskManager();

async function showTaskManager() {

    try {

        const response = await fetch(tasksUrl);

        if (!response.ok) {
            throw new Error("Responce Is Not Ok");
        }

        let result = await response.json();

        generateTable(result);

    }

    catch (error) {
        console.error("Could Not Fetch Data:", error);
    }
}

function generateTable(data) {

    let rows = data.map((input, index) =>
        `
            <tr>
                <td>${index + 1}</td>
                <td>${input.taskName}</td>
                <td>${input.taskDescription}</td>
                <td>${input.taskPriority}</td>
                <td>${input.taskDeadline}</td>
                <td>${input.taskStatus}</td>
                <td>
                    <button class="edit-task" data-id="${input.id}">Edit</button>
                    <button class="delete-task" data-id="${input.id}">Delete</button>
                </td>
            </tr>
        `).join("");

    document.getElementById("taskTable").innerHTML = rows;

}

taskInputSubmit.addEventListener("click", async () => {

    let taskName = taskNameInput.value;
    let taskDescription = taskDescriptionInput.value;
    let taskPriority = taskPriorityInput.value;
    let taskDeadline = taskDeadlineInput.value;
    let taskStatus = taskStatusInput.value;

    if (!isFormVaild(taskName, taskDescription, taskDeadline)) {
        return;
    }

    taskName = capitalInput(taskName);
    taskDescription = capitalInput(taskDescription);

    let taskDetails = {
        taskName,
        taskDescription,
        taskPriority,
        taskDeadline,
        taskStatus,
    }

    try {

        let response = await fetch(tasksUrl, {

            method: "Post",
            headers: {
                "content-Type": "application/json"
            },

            body: JSON.stringify(taskDetails)
        });

        if (!response.ok) {
            throw new Error("Responce Is Not Ok !");
        }

        let data = await response.json()

        await showTaskManager();

        alert(`Task Added !`)

        clearForm();
    }

    catch (error) {
        console.error("Could Not Fetch Data:", error);
    }

})

table.addEventListener("click", (event) => {

    if (event.target.classList.contains("edit-task")) {
        editTask(event.target.dataset.id);
    }

    if (event.target.classList.contains("delete-task")) {
        deleteTask(event.target.dataset.id);
    }
})

async function deleteTask(id) {

    let confirmDelete = confirm("Are you sure you want to delete ?");

    if (!confirmDelete) {
        return;
    }

    try {

        await fetch(`${tasksUrl}/${id}`, {

            method: "DELETE",

        });
        await showTaskManager();

    }
    catch (error) {
        console.log(error);
    }
}

let editId = null;

async function editTask(id) {

    pageChange();

    try {

        let response = await fetch(`${tasksUrl}/${id}`);

        if (!response.ok) {
            throw new Error("Response Is Not Ok !");
        }

        let data = await response.json();

        editId = id;

        document.getElementById("taskName").value = data.taskName;
        document.getElementById("taskDiscription").value = data.taskDescription;
        document.getElementById("taskPriority").value = data.taskPriority;
        document.getElementById("taskDeadline").value = data.taskDeadline;
        document.getElementById("taskStatus").value = data.taskStatus;
        taskInputSubmit.style.display = "none";
        taskUpdateSubmit.style.display = "inline-block";
    }

    catch (error) {
        console.error(error);
    }
}

taskUpdateSubmit.addEventListener("click", async () => {


    let taskName = taskNameInput.value;
    let taskDescription = taskDescriptionInput.value;
    let taskPriority = taskPriorityInput.value;
    let taskDeadline = taskDeadlineInput.value;
    let taskStatus = taskStatusInput.value;

    if (!isFormVaild(taskName, taskDescription, taskDeadline)) {
        return;
    }

    taskName = capitalInput(taskName);
    taskDescription = capitalInput(taskDescription);

    let updatedTaskDetails = {
        taskName,
        taskDescription,
        taskPriority,
        taskDeadline,
        taskStatus,
    }

    try {
        await fetch(`${tasksUrl}/${editId}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(updatedTaskDetails)
        });

        await showTaskManager();

        alert(`Task Updated !`);

        clearForm();

        taskInputSubmit.style.display = "inline-block";
        taskUpdateSubmit.style.display = "none";
    }
    catch (error) {
        console.error("Could Not Update Data:", error);
    }

})

function isFormVaild(taskName, taskDescription, taskDeadline) {

    taskName = taskName.trim();
    taskDescription = taskDescription.trim();

    if (taskName == "" || taskName == undefined || taskName == null || !isNaN(taskName)) {
        alert("Invalid Task Nmae !");
        return false;
    }

    if (taskDescription == "" || taskDescription == undefined || taskDescription == null) {
        alert("Invalid Task Description !");
        return false;
    }

    if (!taskDeadline) {
        alert("Invalid Task Deadline !");
        return false;
    }

    return true;

}

function capitalInput(input) {

    input = input.trim().split(" ");

    let capitalizedWords = [];

    for (let words of input) {
        capitalizedWords.push(words.charAt(0).toUpperCase() + words.slice(1).toLowerCase());
    }

    return capitalizedWords = capitalizedWords.join(" ");

}

function pageChange() {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

function clearForm() {
    document.getElementById("taskName").value = "";
    document.getElementById("taskDiscription").value = "";
    document.getElementById("taskPriority").selectedIndex = 0;
    document.getElementById("taskDeadline").value = "";
    document.getElementById("taskStatus").selectedIndex = 0;
    editId = null;
}
