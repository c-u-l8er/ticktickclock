<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { onMount } from "svelte";

    onMount(() => {
        // the follow does not work bc it breaks the back button
        // goto(`/tasks/${$page.params.taskId}/details`, { replace: true });
    });
</script>
