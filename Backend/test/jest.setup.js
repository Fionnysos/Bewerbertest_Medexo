console.log("Jest setup running");

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongo;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    // avoid buffered operations waiting forever
    mongoose.set("bufferCommands", false);

    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
    });
});

afterEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (const c of collections) {
        await c.deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongo) await mongo.stop();
});
