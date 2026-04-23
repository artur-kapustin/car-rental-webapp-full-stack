<script>
    import {today} from "../../utils/js/date-utils.js";
    import CalendarPage from "./CalendarPage.svelte";
    import {onMount} from "svelte";
    import {on} from "svelte/events";

    let { isHidden } = $props();
    let month = $state(today.getMonth());
    let screenWidth = $state(0);
    let isSinglePage = $derived(screenWidth < 768);

    onMount(() => {
        screenWidth = window.innerWidth;
        const resizeHandler = () => screenWidth = window.innerWidth;
        on(window, 'resize', resizeHandler);

        return () => window.removeEventListener('resize', resizeHandler);
    });
</script>
<section class:hidden={isHidden} class:w-full={isSinglePage} class="flex grow absolute top-12 md:top-16 px-4 py-2 gap-8 bg-[var(--dark-color)] shadow-md rounded-md">
    {#if isSinglePage}
        <CalendarPage bind:month isRight={false} isSingle={true} />
    {:else}
        <CalendarPage bind:month isRight={false}/>
        <CalendarPage bind:month isRight={true}/>
    {/if}
</section>