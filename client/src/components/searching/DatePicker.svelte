<script>
    import Calendar from "./date-picker-calendar/Calendar.svelte";
    import {handleModalClose} from "../utils/js/handle-modal-close.js";
    import {getContext} from "svelte";

    let isHidden = $state(true);
    const datesRange = getContext('datesRange');

    // $derived(new Intl.DateTimeFormat("en-GB").format(datesRange.startDate))
    let from = $derived(datesRange.startDate ? datesRange.startDate.toDateString().replace(' ', ', ').replace(/\b\d{4}\b/g, '') : 'From');
    let to = $derived(datesRange.endDate ? datesRange.endDate.toDateString().replace(' ', ', ').replace(/\b\d{4}\b/g, '') : 'To');
    let date = $derived(from + '  —  ' + to);

    const onClick = () => {
        isHidden = !isHidden;
    }
</script>
<section use:handleModalClose="{() => isHidden = true}" class="flex relative w-full">
    <svg class="absolute z-50 ml-3 justify-center self-center fill-[var(--font-color)] w-8 h-6 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
        <path d="M320-400q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm160 0q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm160 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/>
    </svg>
    <button onclick={onClick} class="bg-[var(--darker-color)] outline-none pr-4 pl-12 py-2 w-full caret-transparent rounded-md cursor-pointer text-start">{date}</button>
    <Calendar isHidden={isHidden} />
</section>
