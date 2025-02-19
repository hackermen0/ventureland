<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import type { User } from "../../types/User.js";

    export let data;
    let users: Array<User> = data.data as User[];
    let eventSource: EventSource;

    onMount(() => {
        eventSource = new EventSource("/leaderboard");

        eventSource.onmessage = (event) => {
            const newUser = JSON.parse(event.data);

            users = users.filter((u: User) => u._id !== newUser._id);

            users.push(newUser);
            users.sort((a, b) => b.points - a.points);
        };

        eventSource.onerror = () => {
            console.error("EventSource error, closing connection.");
            eventSource.close();
        };

        onDestroy(() => {
            eventSource.close();
        });
    });
</script>
<div class="flex justify-center items-center w-full h-full">
    <div class="flex flex-col gap-2 w-full">
        {#each users as user, index}
            <div class="w-full h-12 border border-white rounded-xl flex flex-row justify-between">
                <div class="mt-2 ml-3">{index + 1}. {user.name}</div>
                <div class="bg-slate-300 rounded-xl text-black w-16 text-center">{user.points}</div>
            </div>
        {/each}
    </div>
</div>
