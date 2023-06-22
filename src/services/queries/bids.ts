import { bidsKey, itemsByPriceKey, itemsKey } from '$services/keys';
import { client } from '$services/redis';
import type { CreateBidAttrs, Bid } from '$services/types';
import { DateTime } from 'luxon';
import { getItem } from './items';

export const createBid = async (attrs: CreateBidAttrs) => {
	client.executeIsolated(async (isolatedClient) => {
		await isolatedClient.watch(itemsKey(attrs.itemId));
		const item = await getItem(attrs.itemId);

		if (!item) {
			throw new Error('Item does not exist');
		}
		if (item.price >= attrs.amount) {
			throw new Error('Bid too low');
		}
		if (item.endingAt.diff(DateTime.now()).toMillis() < 0) {
			throw new Error('Item closed to bidding');
		}

		const serialized = serialize(attrs.amount, attrs.createdAt.toMillis());
		return isolatedClient
			.multi()
			.rPush(bidsKey(attrs.itemId), serialized)
			.hSet(itemsKey(attrs.itemId), {
				bids: item.bids + 1,
				price: attrs.amount,
				highestBidUserId: attrs.userId
			})
			.zAdd(itemsByPriceKey(), {
				value: attrs.itemId,
				score: attrs.amount
			})
			.exec();
	});
};

export const getBidHistory = async (itemId: string, offset = 0, count = 10): Promise<Bid[]> => {
	const startIndex = -1 * offset - count;
	const endIndex = -1 - offset;
	const range = await client.lRange(bidsKey(itemId), startIndex, endIndex);

	return range.map(bid => deserilize(bid));
};

const serialize = (bid: number, timestamp: number) => {
	return `${bid}:${timestamp}`;
}

const deserilize = (bidString: string): Bid => {
	let [bid, timestamp] = bidString.split(':');
	return {
		createdAt: DateTime.fromMillis(parseInt(timestamp)),
		amount: parseFloat(bid)
	};
}