<script>
    import {getAccessToken} from "../utils/js/store-token.svelte.js";
    import {logout} from "../utils/js/fetch-calls/token.js";
    import {handleModalClose} from "../utils/js/handle-modal-close.js";
    import {getCurrentUser} from "../utils/js/jwt-utils.js";

    const { userMenuAnchors } = $props();

    const currentUser = getCurrentUser();
    let isUserMenuHidden = $state(true);

    const userLogOut = async () => {
        try {
            console.log(await logout());
            hideOrDisplayUserMenu();
        } catch (e) {
            console.error(e);
        }
    }

    const hideOrDisplayUserMenu = () => {
        isUserMenuHidden = !isUserMenuHidden;
    }
</script>
<li use:handleModalClose="{() => isUserMenuHidden = true}" class="header-li ml-auto relative">
    {#if getAccessToken()}
        <button class="cursor-pointer outline-none" onclick={hideOrDisplayUserMenu} aria-label="open/close user menu">
            <svg class="fill-[var(--darker-color)] stroke-[var(--darker-color)]" xmlns="http://www.w3.org/2000/svg"
                 width="2.5rem" height="2.5rem" viewBox="0 0 256 256" xml:space="preserve">
            <g transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                <path d="M 45 0 C 20.147 0 0 20.147 0 45 c 0 24.853 20.147 45 45 45 s 45 -20.147 45 -45 C 90 20.147 69.853 0 45 0 z M 45 22.007 c 8.899 0 16.14 7.241 16.14 16.14 c 0 8.9 -7.241 16.14 -16.14 16.14 c -8.9 0 -16.14 -7.24 -16.14 -16.14 C 28.86 29.248 36.1 22.007 45 22.007 z M 45 83.843 c -11.135 0 -21.123 -4.885 -27.957 -12.623 c 3.177 -5.75 8.144 -10.476 14.05 -13.341 c 2.009 -0.974 4.354 -0.958 6.435 0.041 c 2.343 1.126 4.857 1.696 7.473 1.696 c 2.615 0 5.13 -0.571 7.473 -1.696 c 2.083 -1 4.428 -1.015 6.435 -0.041 c 5.906 2.864 10.872 7.591 14.049 13.341 C 66.123 78.957 56.135 83.843 45 83.843 z" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/>
            </g>
        </svg>
        </button>
        <section class:hidden={isUserMenuHidden} class="absolute top-12 right-0 z-90" >
            <ul class="flex flex-col grow w-full bg-[var(--dark-color)] rounded-md shadow-md">
                <li class="user-menu-li border-b-1 border-[var(--more-dimmed-color)]">
                    {#if currentUser}
                        <a class="user-menu-a" href="{userMenuAnchors['Personal details']}" onclick={hideOrDisplayUserMenu}>{currentUser.name}</a>
                    {/if}
                </li>
                {#each Object.entries(userMenuAnchors) as [title, href] (href)}
                    {#if title === 'Log out'}
                        <li class="user-menu-li">
                            <a class="user-menu-a" href={href} onclick={userLogOut}>{title}</a>
                        </li>
                    {:else}
                        <li class="user-menu-li">
                            <a class="user-menu-a" href={href} onclick={hideOrDisplayUserMenu}>{title}</a>
                        </li>
                    {/if}
                {/each}
            </ul>
        </section>
    {:else}
        <a class="text-nowrap text-2xl" href="/sign-in">Sign in</a>
    {/if}
</li>
<style>
    @import "tailwindcss";

    .user-menu-li {
        @apply w-full hover:bg-[var(--darker-color)] first:rounded-t-md last:rounded-b-md;
    }

    .user-menu-a {
        @apply block w-full text-nowrap px-4 py-2;
    }
</style>