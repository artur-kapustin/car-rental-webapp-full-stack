const baseUrl = 'http://localhost:3000';

const createResource = (name, extraEndpoints = () => ({})) => {
    const base = `${baseUrl}/${name}`;
    const withId = (id) => `${base}/${id}`;
    const subPath = (path) => `${base}/${path}`;
    const subPathWithId = (id, path) => `${withId(id)}/${path}`;
    const marks = subPath('marks');

    return {
        base,
        withId,
        subPath: subPathWithId,
        marks,
        withQuery: (query) => `${base}?${query}`,
        reservations: (id) => subPathWithId(id, 'reservations'),
        reservationsWithSearch: (id, search) => subPathWithId(id, `reservations?search=${search}`),
        ...extraEndpoints(subPath, subPathWithId),
    };
};

/**
 * @type {{ base: string, withId: Function, subPath: Function, marks: string, withQuery: Function, reservations: Function, reservationsWithSearch: Function, stream: string }}
 */
export const cars = createResource('cars', (subPath) => {
    return {
        stream: subPath('stream')
    }
});


/**
 * @type {{base: string, withId: function, subPath: function, marks: string, withQuery: function, reservations: function, reservationsWithSearch: function, password: function, status: function}}
 */
export const users = createResource('users', (subPath, subPathWithId) => {
    return {
        password: (id) => subPathWithId(id, 'password'),
        status: (id) => subPathWithId(id, 'status'),
    }
});

export const tokens = {
    base: `${baseUrl}/tokens`,
    logout: `${baseUrl}/tokens/logout`,
    refresh: `${baseUrl}/tokens/refresh`,
};

export const reservationUrl = (userId, reservationId) => `http://localhost:3000/users/${userId}/reservations/${reservationId}`;