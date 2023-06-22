import type { CreateUserAttrs, User } from '$services/types';
import { genId } from '$services/utils';
import { client } from '$services/redis';
import { usernamesKey, usernamesUniqeKey, usersKey } from '$services/keys';

export const getUserByUsername = async (username: string) => {
    const decimalId = await client.zScore(usernamesKey(), username);

    if (!decimalId) {
        throw new Error("Username not found");
    }

    const id = decimalId.toString(16);
    return getUserById(id);
};

export const getUserById = async (id: string) => {
    let user = await client.hGetAll(usersKey(id));

    if (Object.keys(user).length === 0)
        return null;

    return deserialize(id, user);
};


export const createUser = async (attrs: CreateUserAttrs) => {
    let id = genId();

    const exist = await client.sIsMember(usernamesUniqeKey(), attrs.username);

    if (exist) {
        throw new Error("Username already exists");
    }

    await Promise.all([
        client.hSet(usersKey(id), serialize(attrs)),
        client.sAdd(usernamesUniqeKey(), attrs.username),
        client.zAdd(usernamesKey(), {
            value: attrs.username,
            score: parseInt(id, 16)
        })
    ]);

    return id;
};


const deserialize = (id: string, user: { [key: string]: string }) => {
    return {
        id,
        username: user.username,
        password: user.password
    };
}

const serialize = (user: CreateUserAttrs) => {
    return {
        username: user.username,
        password: user.password
    };
}