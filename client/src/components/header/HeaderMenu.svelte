<script>
    let { active, isMenuHidden = $bindable(), menuAnchors, onClickCloseMenu } = $props();

    const onBurgerButtonClick = () => {
        isMenuHidden = !isMenuHidden;
    }
</script>
<li class="header-li">
    <button class="cursor-pointer lg:hidden" onclick="{onBurgerButtonClick}" aria-label="Burger button">
        <svg class="stroke-[var(--darker-color)]" xmlns="http://www.w3.org/2000/svg" width="2.5rem" height="2.5rem" viewBox="0 0 24 24" fill="none">
            <path d="M4 18L20 18" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M4 12L20 12" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M4 6L20 6" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
    </button>
</li>
<li class="header-li absolute top-full left-0 w-full z-70 max-lg:bg-[var(--light-color)] lg:static">
    <ul class:max-lg:hidden={isMenuHidden} class="flex flex-col w-full h-full border-[var(--more-dimmed-color)] max-lg:border-t-1 lg:flex-row">
        {#each Object.entries(menuAnchors) as [title, href] (href)}
            <li class="header-li"><a class="w-full pr-8 text-2xl max-lg:p-2 max-lg:border-b-1 max-lg:border-[var(--more-dimmed-color)]" class:text-white={active === href} href={href} onclick={onClickCloseMenu}>{title}</a></li>
        {/each}
    </ul>
</li>