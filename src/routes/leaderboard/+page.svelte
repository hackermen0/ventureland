<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import type { LeaderboardEntry } from "../../types/LeaderboardEntry.js";

    export let data;
    let users: Array<LeaderboardEntry> = data.data as LeaderboardEntry[];
    let eventSource: EventSource;

    onMount(() => {
        eventSource = new EventSource("/leaderboard");

        eventSource.addEventListener("update", (event) => {
            console.log("USER CREATION")
            const newUser = JSON.parse(event.data);

            console.log(newUser)

            users = users.filter((u: LeaderboardEntry) => u._id !== newUser._id);

            users.push(newUser);
            users.sort((a, b) => b.points - a.points);

        })

        eventSource.addEventListener("delete", (event) => {
            console.log("USER DELETION")
            const deletedUser = JSON.parse(event.data);
            console.log(deletedUser);

            users = users.filter((u: LeaderboardEntry) => u._id !== deletedUser._id)
        })

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
    <div class="px-4 py-8 flex flex-col gap-4 w-full">
        <p class="text-3xl mb-4">Leaderboard</p>
        {#each users as user, index (user._id)}
            <div class="w-full h-12 border border-white rounded-xl flex flex-row justify-between">
                <div class="mt-2 ml-3">{index + 1}. {user.name}</div>
                <div class="bg-slate-300 rounded-xl text-black w-16 text-center h-full">
                    <p class="my-auto">{user.points}</p>
                </div>
            </div>
        {/each}
    </div>
</div>
