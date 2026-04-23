<script>
    import EditInput from "../components/utils/EditInput.svelte";
    import {getCurrentUser} from "../components/utils/js/jwt-utils.js";
    import {putUser, changeUserPassword, deleteUser} from "../components/utils/js/fetch-calls/user.js";
    import {constraintsMap} from "../components/utils/js/input-validation-utils.js";

    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.pathname = '/sign-in';
    }

    const changePasswordFields = $state([
        {
            label: 'Current password',
            value: '',
            error: ''
        },
        {
            label: 'New password',
            value: '',
            error: ''
        },
        {
            label: 'Repeat new password',
            value: '',
            error: ''
        }
    ]);

    const editableFields = $state([
        {
            label: 'Name',
            value: currentUser?.name,
            type: 'text',
            error: ''
        },
        {
            label: 'Email',
            value: currentUser?.email,
            type: 'email',
            error: ''
        }
    ]);

    const isEditFormValid = () => {
        for (const field of editableFields) {
            if (field.error) {
                return false;
            }
        }

        return true;
    }

    const onEditFormSubmit = async (event) => {
        event.preventDefault();

        if (isEditFormValid()) {
            try {
                await putUser(currentUser?.id, editableFields[0].value, editableFields[1].value);
            } catch (e) {
                console.error(e);
            }
        }
    }

    const validatePasswordChangeForm = () => {
        const constraints = constraintsMap.get('password');

        for (const field of changePasswordFields) {
            for (const constraint of constraints) {
                if (!constraint.validate(field.value)) {
                    field.error = constraint.message;
                } else {
                    field.error = '';
                }
            }
        }

        const repeatPassword = changePasswordFields[2];
        if (changePasswordFields[1].value !== repeatPassword.value && !repeatPassword.error) {
            repeatPassword.error = 'Passwords do not match.';
        }
    }

    const isPasswordChangeFormValid = () => {
        for (const field of changePasswordFields) {
            if (field.error) {
                return false;
            }
        }

        return true;
    }

    const onPasswordChangeFormSubmit = async (event) => {
        event.preventDefault();
        validatePasswordChangeForm();

        if (isPasswordChangeFormValid()) {
            try {
                await changeUserPassword(currentUser?.id, changePasswordFields[0].value, changePasswordFields[1].value);
            } catch (e) {
                console.error(e);
            }
        }
    }

    const onDeleteButtonClick = async () => {
        try {
            await deleteUser(currentUser?.id);
            window.location.pathname = '/';
        } catch (e) {
            console.error(e);
        }
    }
</script>
<main class="default-main-style-128-with-bg">
    <h1 class="text-3xl self-start">Personal Details</h1>
    <form class="w-full" onsubmit={onEditFormSubmit}>
        {#if currentUser}
            {#each editableFields as field (field.label)}
                <EditInput label={field.label} type={field.type} bind:value={field.value} bind:error={field.error} />
            {/each}
        {/if}
    </form>
    <form class="w-full" onsubmit={onPasswordChangeFormSubmit}>
        <h2 class="text-xl mt-8 mb-2">Change password</h2>
        {#each changePasswordFields as input (input.label)}
            <label class="flex flex-col mt-4">
                {input.label}
                <input type="password" bind:value={input.value} class="outline-none border-1 border-[var(--more-dimmed-color)] focus:border-[var(--dimmed-color)] rounded-md px-2">
            </label>
            <p class="text-red-500">{input.error}</p>
        {/each}
        <button class="default-button-style w-full mt-8">Submit</button>
    </form>
    <button class="default-delete-button-style mt-8" onclick={onDeleteButtonClick}>
        Delete Account
    </button>
</main>