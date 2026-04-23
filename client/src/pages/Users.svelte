<script>
    import {getUsers} from "../components/utils/js/fetch-calls/user.js";
    import UserItem from "../components/items/UserItem.svelte";
    import {getCurrentUser} from "../components/utils/js/jwt-utils.js";
    import SearchBar from "../components/searching/SearchBar.svelte";

    if (!getCurrentUser()) {
        window.location.pathname = '/sign-in';
    }

    let value = $state('');
</script>
<main class="default-main-style-128">
    <SearchBar bind:value placeholder="Search by username or email..." />
    {#await getUsers(value)}
        Loading...
    {:then users}
        {#each users as user (user.id)}
            <UserItem user={user}/>
        {/each}
    {:catch error}
        Your session has expired. Please reload the page or go to sign in and log in again.
    {/await}
</main>