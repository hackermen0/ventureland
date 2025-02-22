<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div>

    <nav class="navbar mt-8 flex flex-row justify-between font-mono w-full md:w-11/12 md:mx-auto bg-white drop-shadow-2xl rounded-2xl">
			<div>
				<a href="/" class="btn btn-ghost text-md md:text-xl">Ventureland</a>
			</div>
			<div class="flex flex-row gap-4 mr-4">
				<a href="/leaderboard" class="underline hover:text-gray-600">Leaderboard</a>
				<a href="/register" class="underline hover:text-gray-600">Register</a>
			</div>
    </nav>
</div>

{@render children()}
