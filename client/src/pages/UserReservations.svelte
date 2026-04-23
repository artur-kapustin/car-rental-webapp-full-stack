<script>
    import {getCurrentUser} from "../components/utils/js/jwt-utils.js";
    import ReservationsList from "../components/items/ReservationsList.svelte";

    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.pathname = '/sign-in';
    }
</script>
<main class="default-main-style-128">
    <h1 class="text-3xl self-start mb-4">Reservations</h1>
    <ReservationsList isForCar={false} id={currentUser.id} />
</main>