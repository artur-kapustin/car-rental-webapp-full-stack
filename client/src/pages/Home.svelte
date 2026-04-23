<script>
    import CarItem from "../components/items/CarItem.svelte";
    import Search from "../components/searching/Search.svelte";
    import Modal from "../components/utils/Modal.svelte"
    import {getCars, postCar} from "../components/utils/js/fetch-calls/car.js";
    import {getCurrentUser} from "../components/utils/js/jwt-utils.js";
    import Form from "../components/utils/Form.svelte";
    import {setContext} from "svelte";
    import {differenceInDays} from "date-fns";
    import {cars} from "../components/utils/js/fetch-calls/urls.js";
    import {on} from "svelte/events";

    const currentUser = getCurrentUser();
    let triggerReRenderValue = $state(0);


    let fields = [
        {
            label: 'Mark',
            placeholder: 'E.g. Audi',
            type: 'text',
        },
        {
            label: 'Model',
            placeholder: 'E.g. Q7',
            type: 'text',
        },
        {
            label: 'Image url',
            placeholder: 'Enter image url',
            type: 'url',
        },
        {
            label: 'Price per day',
            placeholder: 'E.g. 40',
            type: 'pricePerDay',
        },
        {
            label: 'Maximum reserved at a time',
            placeholder: 'E.g. 3',
            type: 'number',
        },
        {
            label: 'Description',
            placeholder: 'Write meaningful description',
            type: 'textarea',
        }
    ];
    let isAddCarModalOpened = $state(false);

    let datesRange = $state({
        startDate: null,
        endDate: null
    });
    let marks = $state([]);
    let minPrice = $state(1);
    let maxPrice = $state(100);

    const triggerReRender = () => {
        triggerReRenderValue++;
    };

    const onAddCarClick = () => {
        isAddCarModalOpened = !isAddCarModalOpened;
    }

    const onSearchButtonClick = () => {
        triggerReRender();
    }

    const loadCars = async () => {
        if (datesRange.startDate && datesRange.endDate && minPrice < maxPrice && minPrice >= 0) {
            return await getCars(marks, datesRange, minPrice, maxPrice);
        }
    }

    const postNewCar = async (formFields) => {
        try {
            await postCar(formFields[0].value, formFields[1].value, formFields[2].value, formFields[3].value, formFields[4].value, formFields[5].value);
            isAddCarModalOpened = false;
        } catch (e) {
            console.error(e);
        }
    }

    setContext('datesRange', datesRange)
    setContext('triggerReRender', triggerReRender);

    const eventSource = new EventSource(cars.stream);
    on(eventSource, 'car-updated', () => {
        triggerReRender();
    })
</script>
<main class="default-main-style-256">
    <Search bind:marks bind:minPrice bind:maxPrice onSearchButtonClick={onSearchButtonClick} />
    {#if currentUser && currentUser.role === 'admin'}
        <Modal bind:isOpened={isAddCarModalOpened} hasBackdrop={true} >
            <Form formTitle="Add car" fields={fields} fetchCall={postNewCar}/>
        </Modal>
        <button class="default-button-style mb-4 w-fit self-end outline-none" onclick={onAddCarClick}>Add car</button>
    {/if}
    {#key triggerReRenderValue}
        {#await loadCars()}
            <p>Loading cars...</p>
        {:then cars}
                {#each cars as car (car.id)}
                    <CarItem
                            car={car}
                            price={car.pricePerDay * differenceInDays(datesRange.endDate, datesRange.startDate)}
                            fields={fields}
                            startDate={datesRange.startDate}
                            endDate={datesRange.endDate}
                    />
                {/each}
        {:catch error}
            <p class="text-red-500">{error}</p>
        {/await}
    {/key}
</main>