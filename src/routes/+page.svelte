<script>
    let {data} = $props();
</script>

<div>
    {#if data?.userData?.userData}        
        <div class="flex items-center justify-center">
            <p>Hello {data?.userData?.userData.name}</p>
        </div>
    {/if}
</div>


