// functions to produce objects representing entities => todos, writers, books, stores, employees
export const makeTodo = i => ({
    id: `${i}`,
    text: `Todo ${i}`,
    complete: Boolean(i % 2),
});
export const makeWriter = i => ({
    id: `${i}`,
    name: `writer ${i}`,
    amountOfBooks: Math.random() * 100,
    recognised: Boolean(i % 2),
    number: i,
    interests: 'star wars',
});
export const makeBook = i => ({
    id: `${i}`,
    title: `book ${i}`,
    published: Boolean(i % 2),
    genre: 'Fantasy',
    rating: (i / Math.random()) * 100,
});
export const makeStore = i => ({
    id: `${i}`,
    name: `store ${i}`,
    country: countries[Math.floor(Math.random()) * 4],
});
export const makeEmployee = i => ({
    id: `${i}`,
    name: `employee ${i}`,
    origin: countries[Math.floor(Math.random()) * 4],
});