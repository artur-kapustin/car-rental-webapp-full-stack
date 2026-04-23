<script>
    import { constraintsMap } from './js/input-validation-utils.js';
    import {onMount} from "svelte";

    const {formTitle, buttonName = formTitle, fields, fetchCall, href = ''} = $props();

    let newFields = $state(fields.map(field => ({
        ...field,
        value: field.value ? field.value : '',
        isValid: true,
        invalidMessage: ''
    })));
    let textarea = $state(null);
    let isFormValid = false;


    const onSubmit = async (event) => {
        event.preventDefault();
        checkValidityAndDisplayErrors();
        if (isFormValid) {
            try {
                await fetchCall(newFields);
                if (href) {
                    window.location.href = href;
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    const onTextAreaInput = () => {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
    }

    const checkValidityAndDisplayErrors = () => {
        let isSecondPassword = false;
        isFormValid = true;

        newFields.forEach(field => {
            if (field.type === 'password') {
                isPasswordInvalid(field, isSecondPassword);
                isSecondPassword = true;
                return;
            }

            ifFieldInvalid(field, constraintsMap.get(field.type));
        })
    }

    const isPasswordInvalid = (field, isSecondPassword) => {
        if (isSecondPassword) {
            if (newFields.find((f) => f.type === 'password').value !== field.value) {
                field.isValid = false;
                field.invalidMessage = 'The password must be the same as the one above';
                isFormValid = false;
                return;
            }

            field.isValid = true;
        } else {
            ifFieldInvalid(field, constraintsMap.get(field.type));
        }
    }

    const ifFieldInvalid = (field, constraints) => {
        for (const constraint of constraints) {
            if (!constraint.validate(field.value)) {
                field.isValid = false;
                field.invalidMessage = constraint.message;
                isFormValid = false;
                return;
            }
        }

        field.isValid = true;
    }

    onMount(async () => {
        if (!textarea) return;

        const waitForScrollHeight = () =>
            new Promise(resolve => {
                function check() {
                    if (textarea.scrollHeight > 0) {
                        resolve();
                    } else {
                        requestAnimationFrame(check);
                    }
                }
                check();
            });

        await waitForScrollHeight();
        onTextAreaInput();
    });
</script>
<form class="flex flex-col w-full" onsubmit={onSubmit} novalidate>
    <h1 class="text-2xl">{formTitle}</h1>
    {#each newFields as field (field.label)}
        {#if field.type === 'textarea'}
            <label class="flex flex-col mt-8">
                {field.label}
                <textarea bind:this={textarea} bind:value={field.value} class="mt-1 p-2 outline-none resize-none overflow-auto border-1 border-[var(--more-dimmed-color)] focus:border-[var(--dimmed-color)]" oninput={onTextAreaInput}></textarea>
            </label>
            <p class="text-red-500 mt-1" class:hidden={field.isValid}>{field.invalidMessage}</p>
        {:else}
            <label class="flex flex-col mt-8">
                {field.label}
                <input
                        bind:value={field.value}
                        type="{field.type === 'pricePerDay' ? 'number' : field.type}"
                        placeholder="{field.placeholder}"
                        class="border-b-1 border-[var(--more-dimmed-color)] mt-1 outline-none focus:border-[var(--dimmed-color)]"
                        required
                        min="1"
                        minlength={field.type === 'password' ? 8 : 1}
                        maxlength="255">
            </label>
            <p class="text-red-500 mt-1" class:hidden={field.isValid}>{field.invalidMessage}</p>
        {/if}
    {/each}
    <button class="default-button-style mt-12">{buttonName}</button>
</form>