<script>
    import {putUserStatus} from "../utils/js/fetch-calls/user.js";

    const { user } = $props();

    if (!user) {
        window.location.href = '/sign-in';
    }

    const putUserStatusWrapper = async (isAccountDisabled) => {
        try {
            await putUserStatus(user.id, isAccountDisabled);
        } catch (e) {
            console.error(e);
        }
    }
</script>
{#if user.role !== 'admin'}
    <section class="flex w-full border-1 border-[var(--more-dimmed-color)] p-2 rounded-md mb-4">
            <section>
                <p>
                    {user.name}
                    <br>
                    {user.email}
                </p>
            </section>
            {#if user.isAccountDisabled}
                <button onclick={async () => await putUserStatusWrapper(false)} class="bg-green-800 hover:bg-green-600 w-20">Enable</button>
            {:else}
                <button onclick={async () => await putUserStatusWrapper(true)} class="bg-red-800 hover:bg-red-600 w-20">Disable</button>
            {/if}
    </section>
{/if}
<style>
    @import "tailwindcss";

    button {
        @apply px-2 h-fit ml-auto rounded-md cursor-pointer;
    }
</style>