<script>
    const { filters } = $props();

    const onClick = (key) => {
        filters.set(key, !filters.get(key))
    }
</script>
<ul class="flex mb-4 gap-4 flex-wrap">
    {#each filters as [filter, isSelected] (filter)}
        <li>
            <button onclick="{() => onClick(filter)}" class="default-button-style text-[var(--dimmed-color)] {isSelected ? 'outline-1 outline-[var(--more-dimmed-color)] text-inherit' : ''}">{filter}</button>
        </li>
    {/each}
</ul>