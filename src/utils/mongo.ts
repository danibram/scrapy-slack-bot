const fp = require('fastify-plugin');
import * as mongodb from 'mongodb';

const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

function decorateFastifyInstance(fastify, client, options, next) {
    const forceClose = options.forceClose;
    const databaseName = options.database;
    const name = options.name;
    const newClient = options.newClient;

    if (newClient) {
        // done() is not needed because .close() returns a Promise
        fastify.addHook('onClose', () => client.close(forceClose));
    }

    const mongo = {
        client: client,
        ObjectId: ObjectId,
        db: null
    };

    if (name) {
        if (!fastify.mongo) {
            fastify.decorate('mongo', mongo);
        }
        if (fastify.mongo[name]) {
            next(new Error('Connection name already registered: ' + name));
            return;
        }

        fastify.mongo[name] = mongo;
    } else {
        if (fastify.mongo) {
            next(new Error('fastify-mongodb has already registered'));
            return;
        }
    }

    if (databaseName) {
        mongo.db = client.db(databaseName);
    }

    if (!fastify.mongo) {
        fastify.decorate('mongo', mongo);
    }

    next();
}

function fastifyMongodb(fastify, options, next) {
    options = Object.assign({ useNewUrlParser: true }, options);

    const forceClose = options.forceClose;
    delete options.forceClose;

    const name = options.name;
    delete options.name;

    const database = options.database;
    delete options.database;

    if (options.client) {
        decorateFastifyInstance(
            fastify,
            options.client,
            {
                newClient: false,
                forceClose: forceClose,
                database: database,
                name: name
            },
            next
        );
        return;
    }

    const url = options.url;
    delete options.url;
    if (!url) {
        next(new Error('`url` parameter is mandatory if no client is provided'));
        return;
    }

    const urlTokens = /\w\/([^?]*)/g.exec(url);
    const parsedDbName = urlTokens && urlTokens[1];
    const databaseName = database || parsedDbName;

    MongoClient.connect(url, options, function onConnect(err, client) {
        if (err) {
            next(err);
            return;
        }

        decorateFastifyInstance(
            fastify,
            client,
            {
                newClient: true,
                forceClose: forceClose,
                database: databaseName,
                name: name
            },
            next
        );
    });
}

export const mongo = fp(fastifyMongodb, {
    fastify: '>=1.0.0',
    name: 'fastify-mongodb'
});

export declare namespace fastifyMongodb {
    interface FastifyMongoObject {
        /**
         * Mongo client instance
         */
        client: mongodb.MongoClient;
        /**
         * DB instance
         */
        db?: mongodb.Db;
        /**
         * Mongo ObjectId class
         */
        ObjectId: typeof mongodb.ObjectId;
    }

    interface FastifyMongoNestedObject {
        [name: string]: FastifyMongoObject;
    }

    interface FastifyMongodbOptions {
        /**
         * Force to close the mongodb connection when app stopped
         * @default false
         */
        forceClose?: boolean;
        /**
         * Database name to connect
         */
        database?: string;
        name?: string;
        /**
         * Pre-configured instance of MongoClient
         */
        client?: mongodb.MongoClient;
        /**
         * Connection url
         */
        url?: string;
    }
}

export default mongo;
