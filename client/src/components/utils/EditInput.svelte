<script>
    import {tick} from "svelte";
    import { constraintsMap } from "./js/input-validation-utils";

    let { label, type, value = $bindable(), error = $bindable() } = $props();

    const id = crypto.randomUUID();
    let isHidden = $state(true);
    let input = $state(null);

    const isInputValid = () => {
        for (const constraint of constraintsMap.get(type)) {
            if (!constraint.validate(value)) {
                error = constraint.message;
                return false;
            } else {
                error = '';
            }
        }

        return true;
    }

    const onButtonClick = async () => {
        if (isInputValid()) {
            console.log(error)
            isHidden = !isHidden;
            await tick();
            input.focus()
        }
    }
</script>
<h2 class="mt-4 text-xl">{label}</h2>
<section class="flex mt-2">
    <label for={id} class:hidden={!isHidden} class="flex items-center">{value}</label>
    <input type={type} id={id} bind:this={input} bind:value class:hidden={isHidden} class="outline-none border-1 border-[var(--dimmed-color)] rounded-md px-2">
    <button class="bg-[var(--darker-color)] px-2 py-1 rounded-md cursor-pointer hover:bg-[var(--darkest-color)] text-center ml-4" onclick={onButtonClick}>{isHidden ? 'Edit' : 'Save'}</button>
</section>
<p class="text-red-500">{error}</p>
