<script>
    import {getReservationsOfUser} from "../utils/js/fetch-calls/reservation.js";
    import {getReservationsOfCar} from "../utils/js/fetch-calls/reservation.js";
    import ReservationItem from "./ReservationItem.svelte";
    import SearchBar from "../searching/SearchBar.svelte";

    const {isForCar, id} = $props();
    let value = $state('');
</script>

<SearchBar bind:value placeholder={isForCar ? "Search by username or email..." : "Search by mark or/and model..."} />
<ul class="w-full">
    {#await isForCar ? getReservationsOfCar(id, value) : getReservationsOfUser(id, value)}
        Loading...
    {:then reservations}
        {#if reservations.length === 0}
            <p>No reservations found</p>
        {:else}
            {#each reservations as reservation (reservation.id)}
                <li class="w-full">
                    <ReservationItem reservation={reservation} isForCar={isForCar}/>
                </li>
            {/each}
        {/if}
    {/await}
</ul>
