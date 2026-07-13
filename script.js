 const tasksUrl = "http://localhost:3000/tasks";

 showTaskManager();

        async function showTaskManager() {

            try {

                const response = await fetch(tasksUrl);

                if (!response.ok) {
                    throw new Error("Responce Is Not Ok");
                }

                let result = await response.json();

                console.log(result);
            

            }

            catch (error) {
                console.error(error);
            }
        }
