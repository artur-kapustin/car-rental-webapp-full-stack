<script>
    import {setErrorMessageCallback} from "./error-utils.js";

    let errorMessageState = $state('');

    const setErrorMessage = (errorMessage) => {
        errorMessageState = errorMessage;

        setTimeout(() => {
            errorMessageState = '';
        }, 5000);
    }

    setErrorMessageCallback(setErrorMessage)
</script>
{#if errorMessageState}
    <section class="absolute right-0 left-0 top-5 px-4 py-2 w-96/100 mx-auto sm:w-100 bg-[var(--darker-color)] rounded-md z-200">
        <p class="text-red-500">{errorMessageState}</p>
    </section>
{/if}