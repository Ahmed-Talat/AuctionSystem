import { itemsByViewsKey, itemsKey, itemsViewKey } from "$services/keys";
import { client } from "$services/redis";

export const incrementView = async (itemId: string, userId: string) => {

    const inserted = await client.pfAdd(itemsViewKey(itemId), userId);

    if (inserted) {
        await Promise.all([
            client.zIncrBy(itemsByViewsKey(), 1, itemId),
            client.hIncrBy(itemsKey(itemId), 'views', 1)
        ]);
    }
};
