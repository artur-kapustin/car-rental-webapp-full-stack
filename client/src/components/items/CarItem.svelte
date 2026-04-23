<script>
    import {getCurrentUser} from "../utils/js/jwt-utils.js";
    import Form from "../utils/Form.svelte";
    import Modal from "../utils/Modal.svelte";
    import {putCar, deleteCar} from "../utils/js/fetch-calls/car.js";
    import {getContext} from "svelte";
    import {postReservation} from "../utils/js/fetch-calls/reservation.js";
    import ReservationsList from "./ReservationsList.svelte";

    let {car, price, fields, startDate, endDate} = $props();

    const currentUser = getCurrentUser();
    const triggerReRender = getContext('triggerReRender');

    let isSelectCarModalOpened = $state(false);
    let isEditCarModalOpened = $state(false);
    let isReservationsCarModalOpened = $state(false);
    let isAdmin = $state(currentUser && currentUser.role === 'admin');

    const onSelectButtonClick = () => {
        isSelectCarModalOpened = !isSelectCarModalOpened;
    }

    const onEditButtonClick = () => {
        isEditCarModalOpened = !isEditCarModalOpened;
    }

    const onReservationsButtonClick = () => {
        isReservationsCarModalOpened = !isReservationsCarModalOpened;
    }

    const putCarWrapper = async (formFields) => {
        try {
            await putCar(car.id, formFields[0].value, formFields[1].value, formFields[2].value, formFields[3].value, formFields[4].value, formFields[5].value);
            isEditCarModalOpened = false;
            triggerReRender();
        } catch (e) {
            console.error(e);
        }
    }

    const deleteCarWrapper = async () => {
        try {
            await deleteCar(car.id);
            isEditCarModalOpened = false;
            triggerReRender();
        } catch (e) {
            console.log(e);
        }
    }

    const reserveCar = async () => {
        if (!currentUser) {
            window.location.pathname = '/sign-in';
            return;
        }

        try {
            await postReservation(currentUser.id, car.id, startDate, endDate, price);
            isEditCarModalOpened = false;
            triggerReRender();
        } catch (e) {
            console.error(e);
        }
    }
</script>
<section class="flex flex-col sm:flex-row w-full mb-4 p-4 border-1 border-[var(--more-dimmed-color)] rounded-md">
    <img class="rounded-md max-w-full sm:max-w-60" src="{car.imageUrl}" alt="car item">
    <section class="flex flex-col max-sm:mt-1 sm:pl-4 sm:mr-8 min-w-0">
        <h1 class="text-2xl max-sm:mt-2 max-sm:mb-2" >{car.mark + ' ' + car.model}</h1>
        <p class="text-sm mt-8 max-sm:mb-4 line-clamp-4 sm:line-clamp-5">{car.description}</p>
    </section>
    <section class="flex flex-col sm:ml-auto">
        <div class:h-full={!isAdmin} class:sm:flex-col={!isAdmin} class:justify-between={!isAdmin} class:justify-center={isAdmin} class="flex items-center">
            <button class="default-button-style justify-center w-full h-fit" onclick={onSelectButtonClick}>Select</button>
            <p class="flex flex-row text-nowrap ml-2">
                <strong>
                    Total €{price}
                </strong>
            </p>
        </div>
        {#if isAdmin}
            <div class="flex mt-2 sm:flex-col">
                <button class="default-button-style w-full" onclick={onEditButtonClick}>Edit</button>
                <button class="default-button-style w-full max-sm:ml-2 sm:mt-2" onclick={onReservationsButtonClick}>Reservations</button>
            </div>
        {/if}
    </section>
    <Modal bind:isOpened={isSelectCarModalOpened} hasBackdrop={true}>
        <img class="rounded-md" src="{car.imageUrl}" alt="{car.mark + ' ' + car.model}">
        <h1 class="text-2xl my-4">{car.mark + ' ' + car.model}</h1>
        <p>{car.description}</p>
        <div class="w-full border-t-1 border-[var(--dimmed-color)] my-4" ></div>
        <section class="flex justify-between items-center">
            <p class="text-2xl">Total  €{price}</p>
            <button class="default-button-style" onclick={reserveCar}>Reserve</button>
        </section>
    </Modal>

    {#if isAdmin}
        <Modal bind:isOpened={isEditCarModalOpened} hasBackdrop={true}>
            <Form
                    formTitle="Edit car"
                    fetchCall={putCarWrapper}
                    fields={fields.map(field => {
                                    switch(field.label) {
                                        case 'Mark':
                                            return {...field, value: car.mark}
                                        case 'Model':
                                            return {...field, value: car.model}
                                        case 'Image url':
                                            return {...field, value: car.imageUrl}
                                        case 'Price per day':
                                            return {...field, value: car.pricePerDay}
                                        case 'Maximum reserved at a time':
                                            return {...field, value: car.maxReservedAtATime}
                                        case 'Description':
                                            return {...field, value: car.description}
                                    }
                        })} />
            <button class="default-delete-button-style mt-2" onclick={deleteCarWrapper}>Delete</button>
        </Modal>
        <Modal bind:isOpened={isReservationsCarModalOpened} hasBackdrop={true}>
            <h1 class="text-2xl">{car.mark} {car.model} Reservations</h1>
            <h3 class="mb-8 text-[var(--dimmed-color)]">Max reserved at a time: {car.maxReservedAtATime}</h3>
            <ReservationsList isForCar={true} id={car.id} />
        </Modal>
    {/if}
</section>