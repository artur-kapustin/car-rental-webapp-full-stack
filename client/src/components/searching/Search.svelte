<script>
    import Filter from "./Filter.svelte";
    import DatePicker from "./DatePicker.svelte";
    import {SvelteMap} from "svelte/reactivity";
    import {getCarMarks} from "../utils/js/fetch-calls/car.js";
    import {onMount} from "svelte";

    let {marks = $bindable(), minPrice = $bindable(), maxPrice = $bindable(), onSearchButtonClick} = $props();

    let carMarks = [];

    // state is necessary here,
    // because I update the variable itself in onMount,
    // so SvelteMap does not see that
    // I can also just remove it,
    // but to be a bit extra safe I will leave it
    // just in case something goes wrong in onMount
    let filters = $state(new SvelteMap([
        ['Audi', false],
        ['Mazda', false],
        ['Mercedes', false],
        ['Ferrari', false],
        ['Ford', false],
        ['Toyota', false],
        ['Porsche', false],
        ['Volkswagen', false],
        ['Honda', false],
        ['Jaguar', false],
        ['Bugatti', false],
        ['BMW', false],
        ['Alpine', false]]
    ));

    $effect(() => {
        filters.forEach((isIncluded, mark) => {
            const ifMarkAlreadyIn = marks.includes(mark);

            if (isIncluded) {
                if (!ifMarkAlreadyIn) {
                    marks.push(mark);
                }
            } else if (ifMarkAlreadyIn) {
                marks = marks.filter((m) => m !== mark);
            }
        })
    })

    onMount(async () => {
        carMarks = await getCarMarks();
        filters = new SvelteMap(carMarks.map(mark => [mark, false]));
    });
</script>
<search class="bg-[var(--light-color)] p-4 mb-4 rounded-md w-full shadow-md">
    <Filter filters={filters} />
    <section class="flex gap-4 flex-col md:flex-row">
        <DatePicker />
        <input bind:value={minPrice} type="number" min="1" max="900" placeholder="Min price" class="bg-[var(--darker-color)] outline-none px-4 py-2 rounded-md">
        <input bind:value={maxPrice} type="number" min="1" max="900" placeholder="Max price" class="bg-[var(--darker-color)] outline-none px-4 py-2 rounded-md">
        <button onclick={onSearchButtonClick} class="default-button-style flex justify-center items-center ml-auto w-full text-xl md:w-auto md:text-base">
            <svg class="fill-[var(--font-color)] pointer-events-none mr-2" xmlns="http://www.w3.org/2000/svg" height="1rem" width="1rem" viewBox="0 0 512 512">
                <g>
                    <path d="m495,466.1l-110.1-110.1c31.1-37.7 48-84.6 48-134 0-56.4-21.9-109.3-61.8-149.2-39.8-39.9-92.8-61.8-149.1-61.8-56.3,0-109.3,21.9-149.2,61.8-39.9,39.8-61.8,92.8-61.8,149.2 0,56.3 21.9,109.3 61.8,149.2 39.8,39.8 92.8,61.8 149.2,61.8 49.5,0 96.4-16.9 134-48l110.1,110c8,8 20.9,8 28.9,0 8-8 8-20.9 0-28.9zm-393.3-123.9c-32.2-32.1-49.9-74.8-49.9-120.2 0-45.4 17.7-88.2 49.8-120.3 32.1-32.1 74.8-49.8 120.3-49.8 45.4,0 88.2,17.7 120.3,49.8 32.1,32.1 49.8,74.8 49.8,120.3 0,45.4-17.7,88.2-49.8,120.3-32.1,32.1-74.9,49.8-120.3,49.8-45.4,0-88.1-17.7-120.2-49.9z"/>
                </g>
            </svg>
            Search
        </button>
    </section>
</search>

