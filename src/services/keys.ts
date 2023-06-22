export const pageCacheKey = (id: string) => `pageCache#${id}`
export const usersKey = (id: string) => `user#${id}`
export const sessionsKey = (id: string) => `session#${id}`
export const usernamesUniqeKey = () => `usernames:uniqe`
export const userLikesKey = (id: string) => `users:likes#${id}`
export const usernamesKey = () => `usernames`
export const bidsKey = (id: string) => `bids#${id}`

// Items
export const itemsKey = (id: string) => `items#${id}`
export const itemsByViewsKey = () => `items:views`
export const itemsByPriceKey = () => `items:price`
export const itemsByEndingAtKey = () => `items:endingAt`
export const itemsViewKey = (id: string) => `items:view#${id}`
export const itemsIndexKey = () => `idx:items`;
