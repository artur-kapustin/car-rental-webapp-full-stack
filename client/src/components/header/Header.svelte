<script>
    import HeaderMenu from "./HeaderMenu.svelte";
    import UserMenu from "./UserMenu.svelte";
    import {getCurrentUser} from "../utils/js/jwt-utils.js";

    let { active } = $props();

    const currentUser = getCurrentUser();

    let isMenuHidden = $state(true);
    const menuAnchors = {'Home': '/'};

    if (currentUser && currentUser.role === 'admin') {
        menuAnchors['Users'] = '/users';
    }

    let userMenuAnchors = $state(null);

    if (currentUser) {
        userMenuAnchors = {'Personal details': `/users/${currentUser.id}`, 'Reservations': `/users/${currentUser.id}/reservations`, 'Log out': '/'};
    }

    const onClickCloseMenu = () => {
        isMenuHidden = true;
    }
</script>
<nav class="box-border relative w-full z-100 bg-[#2f2f2f]">
    <ul class="box-border flex grow relative w-full mx-auto list-none p-4 lg:w-256">
        <HeaderMenu bind:isMenuHidden active={active} menuAnchors={menuAnchors} onClickCloseMenu={onClickCloseMenu}/>
        <UserMenu userMenuAnchors={userMenuAnchors}/>
    </ul>
</nav>
<button class:hidden={isMenuHidden} class="absolute top-0 bottom-0 right-0 left-0 z-80 bg-[var(--dimmed-darker-color)]" onclick="{onClickCloseMenu}" aria-label="Overlay button"></button>
