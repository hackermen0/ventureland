<script lang="ts">

    import { enhance } from "$app/forms";

    let formData = $props()
</script>

{#if formData?.form?.success}
<div class="w-full flex flex-row">
    <div role="alert" class="alert alert-success w-64 mt-6 float-right">
        <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 shrink-0 stroke-current"
        fill="none"
        viewBox="0 0 24 24">
        <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>User "{formData?.form?.userData.name}" has been created with ID:{formData?.form?.userData._id}</span>
    </div>
</div>
{/if}


<div class="h-full w-full">
    <form action="?/update" method="POST" use:enhance>
        <div class="flex flex-col justify-center items-center mt-20 gap-4">
            <label class="input input-bordered flex items-center gap-2 w-80">
                Name
                <input type="text" class="grow" name="name" id="name"/>
            </label>
            <label class="input input-bordered flex items-center gap-2 w-80">
                Password
                <input type="password" class="grow" name="password" id="password"/>
            </label>
            <button class="btn" type="submit">Submit</button>
        </div>
    </form>
</div>