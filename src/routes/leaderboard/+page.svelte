<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { enhance } from "$app/forms";
    import type { User } from "../../types/User.js";

    export let data;
    let users: Array<User> = data.data as User[];
    let eventSource: EventSource;

    onMount(() => {
        eventSource = new EventSource("/leaderboard");

        eventSource.addEventListener("update", (event) => {
            const newUser = JSON.parse(event.data);
            users = users.filter((u: User) => u._id !== newUser._id);
            users.push(newUser);
            users.sort((a, b) => b.points - a.points);

        })

        eventSource.addEventListener("delete", (event) => {
            const deletedUser = JSON.parse(event.data);
            users = users.filter((u: User) => u._id !== deletedUser._id)
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
        <form action="?/delete" method="POST" use:enhance>       
            <div class="flex flex-col gap-6">
                {#if users.length !== 0}          
                    {#each users as user, index (user._id)}
                        <div class="w-full h-12 border border-white rounded-xl flex flex-row justify-between">
                            <div class="mt-2 ml-3">{index + 1}. {user.name}</div>
                            <div class="flex flex-row align-middle gap-4">
                                <input type="hidden" name="id" id="id" value="{user._id}">
                                <!-- svelte-ignore a11y_consider_explicit_label -->
                                <button class="mb-1">
                                    <svg class="size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="red">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                </button>
                                <div class="bg-slate-300 rounded-xl text-black w-16 text-center h-full">
                                    <p class="p-2">{user.points}</p>
                                </div>
                            </div>
                        </div>
                    {/each}
                {:else}
                    <div class="text-3xl flex justify-center items-center mt-32">
                        <p>No entries in leaderboard</p>
                    </div>
                {/if}
            </div>
        </form>
    </div>
</div>
