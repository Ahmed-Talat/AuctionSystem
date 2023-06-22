import { client } from "$services/redis";
import { pageCacheKey } from "$services/keys"

const cachedPages = ['/about', '/privacy', '/auth/signin', '/auth/signup'];

export const getCachedPage = (route: string) => {
    if (cachedPages.includes(route)) {
        return client.get(pageCacheKey(route));
    }

    return null;
};

export const setCachedPage = (route: string, page: string) => {
    if (cachedPages.includes(route)) {
        return client.set(pageCacheKey(route), page, {
            EX: 2
        });
    }
};
