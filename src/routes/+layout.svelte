<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { enhance } from "$app/forms";
	
	let { children, data } = $props();
    console.log("LAYOUT DATA: ", data)
</script>

<div>
    <nav class="navbar mt-8 flex flex-row justify-between font-mono w-full md:w-11/12 md:mx-auto bg-white drop-shadow-2xl rounded-2xl">
        <div>
            <a href="/" class="btn btn-ghost text-md md:text-xl">Ventureland</a>
        </div>
        
        {#if data.userData?.userData}
            <div class="flex flex-row items-center gap-4 mr-4">
                <a href="/leaderboard" class="underline hover:text-gray-600">Leaderboard</a>
				<a href="/register" class="underline hover:text-gray-600">Register</a>
                
                <!-- Quick logout form -->
                <form action="/logout?/logout" method="POST" use:enhance class="inline">
                    <button type="submit" class="btn btn-outline btn-sm">
                        Logout
                    </button>
                </form>
            </div>
        {:else}
            <!-- User is not logged in -->
            <div class="flex flex-row gap-2">
                <a href="/login">
                    <button class="btn btn-primary">Login</button>
                </a>
            </div>
        {/if}
    </nav>
</div>

{@render children()}