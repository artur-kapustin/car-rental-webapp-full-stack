<script>
    import {logout} from "../components/utils/js/fetch-calls/token.js";

    const logOutUser = async () => {
        await logout();
        window.location.href = '/';
    }
</script>
<main class="flex h-full justify-center items-center bg-[var(--bg-color)]">
    <section class="flex flex-col bg-[var(--dark-color)] py-2 px-4 rounded-md">
        <p class="text-red-500 text-3xl">Your account has been disabled.</p>
        <a onclick={logOutUser} class="default-button-style mt-8" href="/">Log out</a>
    </section>
</main>