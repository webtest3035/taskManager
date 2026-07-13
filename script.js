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
const pagination = document.getElementById("pagination");

let allTasks = 0;
let currentPage = 1;
let itemsPerPage = 10;

let filters = {
    name: "",
};

let categories = {
    find: ""
};

let status = {
    find: ""
};


showTaskManager();

async function showTaskManager() {

    let url = `${tasksUrl}?_page=${currentPage}&_per_page=${itemsPerPage}`;

    let total = `${tasksUrl}?`;

    if (filters.name) {
        url += `&taskName=${filters.name}`;
    }

    if (categories.find) {
        url += `&_sort=${categories.find}`;
    }
    if (status.find) {
        url += `&${status.find}`;
    }

    try {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Responce Is Not Ok");
        }

        let result = await response.json();

        let tasks = result.data;

        allTasks = result.items;

        if (tasks.length === 0) {

            alert("Not Found !");
            return;
        }

        generateTable(tasks);

        getDate();

        createPagination();

        const totalResponse = await fetch(total);

        const totalData = await totalResponse.json();

        document.getElementById("totalTask").textContent = totalData.length;
        getTaskStatus(totalData);

    }

    catch (error) {
        console.error("Could Not Fetch Data:", error);
    }
}
function generateTable(data) {


    let alldata = (currentPage - 1) * itemsPerPage;

    let rows = data.map((input, index) => {

        let statusClass = "";

        if (input.taskStatus === "Pending") {
            statusClass = "pending";
        } else if (input.taskStatus === "In Progress") {
            statusClass = "In-Progress";
        } else if (input.taskStatus === "Completed") {
            statusClass = "Completed";
        }

        return `
            <tr>
                <td>${alldata + index + 1}</td>
                <td>${input.taskName}</td>
                <td>${input.taskDescription}</td>
                <td>${input.taskPriority}</td>
                <td>${input.taskDeadline}</td>
                <td class="${statusClass}">${input.taskStatus}</td>
                <td>
                    <button class="edit-task" data-id="${input.id}">Edit</button>
                    <button class="delete-task" data-id="${input.id}">Delete</button>
                </td>
            </tr>
        `}).join("");

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
        console.error("Could Not Add Data:", error);
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

taskSearchSubmit.addEventListener("click", () => {

    let input = document.getElementById("taskSearch").value;

    document.getElementById("taskSearch").value = "";

    if (input == "" || !isNaN(input)) {
        alert("Invalid Search Input !");
        return;
    }

    input = capitalInput(input);

    filters.name = input;

    currentPage = 1;

    showTaskManager();

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
    document.getElementById("taskSearch").value = "";
    editId = null;
}

taskFiltersButtons.addEventListener("click", (event) => {

    if (event.target.id === "deadLineFirstToLast") {
        deadLineFstToLst();
    }

    if (event.target.id === "deadLineLastToFirst") {
        deadLineLstToFst();
    }

    if (event.target.id === "lowPriority") {
        lowPriorityTas();
    }

    if (event.target.id === "mediumPriority") {
        mediumPriorityTsk();
    }

    if (event.target.id === "highPriority") {
        highPriorityTsk();
    }

    if (event.target.id === "urgentPriority") {
        urgentPriorityTsk();
    }

    if (event.target.id === "pendingTask") {
        pendingTsk();
    }

    if (event.target.id === "inProgressTask") {
        inProgressTsk();
    }

    if (event.target.id === "CompletedTask") {
        CompletedTsk();
    }

    if (event.target.id === "refresh") {
        refresh();
    }

})

function deadLineFstToLst() {

    categories.find = "taskDeadline";

    currentPage = 1;

    showTaskManager();
}

function deadLineLstToFst() {

    categories.find = "-taskDeadline";

    currentPage = 1;

    showTaskManager();

}

function lowPriorityTas() {

    status.find = "taskPriority=Low";

    currentPage = 1;

    showTaskManager();
}

function mediumPriorityTsk() {

    status.find = "taskPriority=Medium";

    currentPage = 1;

    showTaskManager();

}

function highPriorityTsk() {

    status.find = "taskPriority=High";

    currentPage = 1;

    showTaskManager();


}

function urgentPriorityTsk() {

    status.find = "taskPriority=Urgent";

    currentPage = 1;

    showTaskManager();
}

function pendingTsk() {

    status.find = "taskStatus=Pending";

    currentPage = 1;

    showTaskManager();

}

function inProgressTsk() {

    status.find = "taskStatus=In Progress";

    currentPage = 1;

    showTaskManager();

}

function CompletedTsk() {

    status.find = "taskStatus=Completed";

    currentPage = 1;

    showTaskManager();

}

function refresh() {

    document.getElementById("taskTable").innerHTML = "";

    currentPage = 1;

    filters.name = "";

    categories.find = "";

    status.find = "";

    clearForm();

    pageChange();

    showTaskManager();

}

function getDate() {

    const date = new Date();

    const formatedDate = date.toLocaleDateString('en-GB', {
        day: "numeric",
        month: "short",
        year: "numeric"
    }).toLocaleUpperCase();

    document.getElementById("heading-date").textContent = `Today: ${formatedDate}`;
}

function getTaskStatus(input) {

    let pending = 0;

    input.forEach(input => {
        if (input.taskStatus === "Pending") {
            pending++;
        }
    });

    document.getElementById("totalPendingTask").textContent = pending;

    let inPorgress = 0;

    input.forEach(input => {
        if (input.taskStatus === "In Progress") {
            inPorgress++;
        }
    })

    document.getElementById("TotalInProgressTask").textContent = inPorgress;

    let Completed = 0;

    input.forEach(input => {
        if (input.taskStatus === "Completed") {
            Completed++;
        }
    })

    document.getElementById("TotalCompletedTask").textContent = Completed;

}

pagination.addEventListener("click", (event) => {

    if (event.target.id === "previousPage") {
        previous();
    }
    if (event.target.id === "nextPage") {
        next();
    }
})

function createPagination() {

    let totalPages = Math.ceil(allTasks / itemsPerPage);

    if (currentPage === 1) {

        document.getElementById("previousPage").style.display = "none";
    }
    else {
        document.getElementById("previousPage").style.display = "block";
    }

    if (currentPage === totalPages) {
        document.getElementById("nextPage").style.display = "none";
    }
    else {
        document.getElementById("nextPage").style.display = "block";
    }

}

function pageChange() {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

function next() {

    let totalPages = Math.ceil(allTasks / itemsPerPage);

    if (currentPage < totalPages) {
        currentPage++;
        showTaskManager();
        createPagination();
        pageChange();
    }
}

function previous() {

    if (currentPage > 1) {
        currentPage--;
        showTaskManager();
        createPagination();
        pageChange();
    }
}


