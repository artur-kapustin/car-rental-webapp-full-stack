import {SvelteMap} from "svelte/reactivity";

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

export const daysOfWeekNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export const today = new Date();

export const emptyDate = new Date(0);

export const isDateEmpty = (date) => date.getTime() === emptyDate.getTime();

export const monthNumToName = (monthNum) => monthNames[monthNum];

export const getDaysArray = (year, month) => [...Array(daysInMonth(year, month)).keys()].map(i => i + 1);

export const getDaysMap = (year, month) => {
    const map = new SvelteMap();

    getDaysArray(year, month).forEach((day) => {
        map.set(day, new Date(year, month, day, 23))
    })

    return map;
}