import { itemsIndexKey, itemsKey } from "$services/keys";
import { SchemaFieldTypes } from "redis";
import { client } from "./client";

export const createIndexes = async () => {
    const indexs = await client.ft._LIST();
    const exists = indexs.find(i => i === itemsIndexKey());
    if (exists) {
        return;
    }

    client.ft.create(
        itemsIndexKey(),
        {
            name: {
                type: SchemaFieldTypes.TEXT,
                SORTABLE: true
            },
            description: {
                type: SchemaFieldTypes.TEXT,
                SORTABLE: false
            },
            ownerId: {
                type: SchemaFieldTypes.TAG,
                SORTABLE: false
            },
            endingAt: {
                type: SchemaFieldTypes.NUMERIC,
                SORTABLE: true
            },
            bids: {
                type: SchemaFieldTypes.NUMERIC,
                SORTABLE: true
            },
            views: {
                type: SchemaFieldTypes.NUMERIC,
                SORTABLE: true
            },
            price: {
                type: SchemaFieldTypes.NUMERIC,
                SORTABLE: true
            },
            likes: {
                type: SchemaFieldTypes.NUMERIC,
                SORTABLE: true
            }
        } as any,
        {
            ON: 'HASH',
            PREFIX: itemsKey('')
        }
    )
};
