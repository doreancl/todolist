
export const ITEMS = Array.from({ length: 6 }, (_, index) => ({
    id: index + 1,
    image: `Image ${index + 1}`,
    tags: `Tags ${index + 1}`,
    title: `Title ${index + 1}`,
}));