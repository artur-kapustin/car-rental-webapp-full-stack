<script>
    let {children, isOpened = $bindable(), hasBackdrop} = $props();

    let dialog = $state(null);

    $effect(() => {
        if (!dialog) return;

        if (isOpened) {
            dialog.showModal();
        } else if (dialog.open) {
            dialog.close();
        }
    });

    const handleBackdropClick = (event) => {
        const rect = dialog.getBoundingClientRect();
        const isInside =
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;

        if (!isInside) {
            dialog.close();
        }
    }

    const onDialogClose = () => {
        isOpened = false;
    }
</script>

<dialog closedby="any"
        bind:this={dialog}
        onclick="{handleBackdropClick}"
        onclose={onDialogClose}
        class:backdrop:opacity-0={!hasBackdrop}
        class="text-inherit w-150 p-4 m-auto rounded-lg bg-[var(--bg-color)] backdrop:bg-[var(--dimmed-darker-color)]">
    {@render children()}
</dialog>

<style>
</style>
