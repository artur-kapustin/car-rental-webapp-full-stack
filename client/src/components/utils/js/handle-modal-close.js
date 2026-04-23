import {on} from "svelte/events";

// for when dialog doesnt work (position: relative)
// https://github.com/propolies/svelte-outside/blob/main/src/index.ts
// copy pasted 4 lines

export const handleModalClose = (element, callback) => {
    const handleClick = (event) => {
        if (element && !element.contains(event.target) && !event.defaultPrevented) {
            callback();
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            callback();
        }
    }

    on(document, 'click', handleClick);
    on(document, 'keydown', handleKeyDown);
}