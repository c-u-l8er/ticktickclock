<script lang="ts">
    import { Button, Label, Input, Textarea, Select } from "flowbite-svelte";
    import { db, type Task } from "$lib/db";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
    export let projectId: number;

    let newTask: Omit<Task, "id"> = {
        projectId: projectId,
        name: "",
        description: "",
        status: "open",
    };

    async function createTask() {
        try {
            await db.tasks.add(newTask);
            newTask = {
                projectId: projectId,
                name: "",
                description: "",
                status: "open",
            };
            // Dispatch the taskCreated event
            dispatch("taskCreated");
        } catch (error) {
            console.error("Error creating task:", error);
            alert("Failed to create task. Check the console for details.");
        }
    }
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
    <h3 class="text-lg font-semibold mb-2">Create New Task</h3>
    <div class="grid gap-4 mb-4">
        <div>
            <Label for="taskName" class="block mb-2">Task Name</Label>
            <Input
                type="text"
                id="taskName"
                bind:value={newTask.name}
                placeholder="Enter task name"
                required
            />
        </div>
        <div>
            <Label for="taskDescription" class="block mb-2">Description</Label>
            <Textarea
                id="taskDescription"
                bind:value={newTask.description}
                placeholder="Enter task description"
                rows="3"
            />
        </div>
        <div>
            <Label for="taskStatus" class="block mb-2">Status</Label>
            <Select id="taskStatus" bind:value={newTask.status} class="w-full">
                <option value="open">Open</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
            </Select>
        </div>
    </div>
    <Button on:click={createTask}>Create Task</Button>
</div>
