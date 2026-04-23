<script>
    import {getUserById} from "../utils/js/fetch-calls/user.js";
    import {getCarById} from "../utils/js/fetch-calls/car.js";
    import {deleteReservation} from "../utils/js/fetch-calls/reservation.js";

    const {reservation, isForCar} = $props();

    const cancelReservation = async () => {
        await deleteReservation(reservation.userId, reservation.id);
    }
</script>
<section class="flex flex-col w-full border-1 border-[var(--more-dimmed-color)] p-2 rounded-md mb-4">
    <div class="flex">
        {#if isForCar}
            {#await getUserById(reservation.userId)}
                Loading...
            {:then user}
                <h2 class="text-xl">{user.name} ({user.email})</h2>
            {/await}
        {:else}
            {#await getCarById(reservation.carId)}
                Loading...
            {:then car}
                <h2 class="text-xl">{car.mark} {car.model}</h2>
            {/await}
            <button class="bg-red-800 w-fit h-fit rounded-md py-1 px-2 ml-auto cursor-pointer hover:bg-red-700" onclick={cancelReservation}>Cancel</button>
        {/if}
    </div>
    <ul class="mt-4">
        <li>
            <p class="text-amber-400">From</p>
            {new Date(reservation.startDate).toDateString()}
        </li>
        <li class="mt-2 ">
            <p class="text-amber-400">To</p>
            {new Date(reservation.endDate).toDateString()}
        </li>
    </ul>
</section>
