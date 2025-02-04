import { MongoClient, ServerApiVersion } from "mongodb";
import '../loadenv.js'

const uri = process.env.MONGODB_URI || "";
//console.log(uri);

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

// We keep the MongoDB client open for the lifetime of the application.
export default async function connectDB(database = "test") {
    try {
        await client.connect();
        console.log('MongoDB client connected');
        return client.db(database);  // Return the database object
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;  // Rethrow the error after logging
    }
}
