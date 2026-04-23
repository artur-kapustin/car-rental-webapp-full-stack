<script>
    import {
        getDaysMap,
        today,
        monthNumToName,
        daysOfWeekNames
    } from "../../utils/js/date-utils.js";
    import {SvelteDate} from "svelte/reactivity";
    import {getContext} from "svelte";

    let { month = $bindable(), isRight, isSingle = false } = $props();
    const datesRange = getContext('datesRange');

    const date = $derived(new Date(today.getFullYear(), isRight ? month + 1 : month, 1))
    const year = $derived(date.getFullYear());
    const dayOfWeek = $derived(date.getDay());
    const currentMonth = $derived(date.getMonth());
    const days = $derived(getDaysMap(year, currentMonth));

    const onNextPrevButtonClick = () => {
        if (isRight) {
            onNext();
        } else {
            onPrev();
        }
    }

    const onNext = () => {
        month++;
    }

    const onPrev = () => {
        month--;
    }

    const onDateButtonClick = (day) => {
        const tempDate = new SvelteDate(date);
        const bothDatesAreSet = datesRange.startDate && datesRange.endDate;
        tempDate.setDate(day);
        tempDate.setHours(23);

        if (!datesRange.startDate || bothDatesAreSet) {
            if (bothDatesAreSet) {
                datesRange.endDate = null;
            }

            datesRange.startDate = tempDate;
        } else {
            if (datesRange.startDate.getTime() === tempDate.getTime()) {
                return;
            }

            if (tempDate.getTime() < datesRange.startDate.getTime()) {
                datesRange.startDate = tempDate;
                return;
            }

            datesRange.endDate = tempDate;
        }
    }
</script>

{#snippet prevSvg()}
    <svg class="w-8 h-8 fill-[var(--font-color)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
        <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
    </svg>
{/snippet}
{#snippet nextSvg()}
    <svg class="w-8 h-8 fill-[var(--font-color)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
        <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
    </svg>
{/snippet}

<section class="flex flex-col grow">
    <section class="grid grid-cols-[1fr_auto_1fr] pb-4 items-center">
        <h1 class:order-2={!isRight} class:col-start-2={isRight} class="text-lg font-medium">{monthNumToName(currentMonth) + " " + year}</h1>
        {#if isSingle}
            <button
                    class="cursor-pointer p-2 rounded-md hover:bg-[var(--dimmed-light-color)] disabled:invisible order-1 w-fit"
                    aria-label="previous"
                    disabled={currentMonth === today.getMonth() && year === today.getFullYear()}
                    onclick={onPrev}
            >
                {@render prevSvg()}
            </button>
            <button
                    class="cursor-pointer p-2 rounded-md hover:bg-[var(--dimmed-light-color)] disabled:invisible order-3 justify-self-end"
                    aria-label="next"
                    onclick={onNext}
            >
                {@render nextSvg()}
            </button>
        {:else}
            <button
                    class="cursor-pointer p-2 rounded-md hover:bg-[var(--dimmed-light-color)] disabled:invisible"
                    aria-label="{isRight ? 'next' : 'previous'}"
                    disabled={currentMonth === today.getMonth() && year === today.getFullYear()}
                    onclick={onNextPrevButtonClick}
                    class:order-1={!isRight}
                    class:w-fit={!isRight}
                    class:justify-self-end={isRight}
                    class:col-start-3={isRight}
            >
                {#if isRight}
                    {@render nextSvg()}
                {:else}
                    {@render prevSvg()}
                {/if}
            </button>
        {/if}
    </section>
    <ul class="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-y-1 place-items-center w-full">
        {#each daysOfWeekNames as dayOfWeekName (dayOfWeekName)}
            <li>
                {dayOfWeekName}
            </li>
        {/each}
        {#each days as [day, date] (day)}
            <li class="w-full nth-8:col-start-{dayOfWeek === 0 ? 7 : dayOfWeek}">
                <button
                        class:px-3={!isSingle}
                        class:px-1={isSingle}
                        class="cursor-pointer py-2 w-full disabled:text-[var(--dimmed-light-color)]"
                        disabled="{date.getTime() < today.getTime()}"
                        onclick={() => onDateButtonClick(day)}
                        class:bg-[var(--darkest-color)]={(datesRange.startDate && date.getTime() === datesRange.startDate.getTime()) || (datesRange.endDate && date.getTime() === datesRange.endDate.getTime())}
                        class:bg-[var(--dimmed-light-color)]={datesRange.startDate && datesRange.endDate && date.getTime() > datesRange.startDate.getTime() && date.getTime() < datesRange.endDate.getTime()}
                        class:text-orange-400={today.getDate() === day && today.getMonth() === date.getMonth() && today.getFullYear() === date.getFullYear()}
                >
                    {day}
                </button>
            </li>
        {/each}
    </ul>
</section>