import { itemsByEndingAtKey } from "$services/keys";
import { client } from "$services/redis";
import { getItems } from "./items";

export const itemsByEndingTime = async (
	order: 'DESC' | 'ASC' = 'DESC',
	offset = 0,
	count = 10
) => {
	let now = new Date();
	let utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

	const ids = await client.zRange(
		itemsByEndingAtKey(),
		utc.getMilliseconds(),
		'+inf',
		{
			BY: "SCORE",
			LIMIT: {
				offset,
				count
			}
		});

	return getItems(ids);
};
