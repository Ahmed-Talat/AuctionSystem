import { itemsByViewsKey, itemsKey, itemsByEndingAtKey, itemsByPriceKey } from '$services/keys';
import { client } from '$services/redis';
import type { CreateItemAttrs } from '$services/types';
import { genId } from '$services/utils';
import { deserialize } from './deserialize';
import { serialize } from './serialize';

export const getItem = async (id: string) => {
    let item = await client.hGetAll(itemsKey(id));

    if (Object.keys(item).length === 0)
        return null;

    return deserialize(id, item);
};

export const getItems = async (ids: string[]) => {
    const commands = ids.map(id => {
        return client.hGetAll(itemsKey(id));
    })

    const results = await Promise.all(commands);

    return results.map((result, i) => {
        return deserialize(ids[i], result);
    });
};

export const createItem = async (attrs: CreateItemAttrs, userId: string) => {
    let id = genId();

    let serialized = serialize(attrs);

    let now = new Date();
    let utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

    await Promise.all([
        client.hSet(itemsKey(id), serialized),
        client.zAdd(itemsByViewsKey(), {
            value: id,
            score: 0
        }),
        client.zAdd(itemsByEndingAtKey(), {
            value: id,
            score: utc.getMilliseconds()
        }),
        client.zAdd(itemsByPriceKey(), {
            value: id,
            score: 0
        }),
    ]);

    return id;
};
