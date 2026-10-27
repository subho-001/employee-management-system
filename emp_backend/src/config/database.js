const mongoose = require("mongoose");

const connectDatabase = async () => {
    const connection = await mongoose.connect(
        process.env.MONGODB_URI,
        {
            serverSelectionTimeoutMS:5000
        }
    );

    console.log(
    `MongoDB connected: ${connection.connection.host}`
  );
}

module.exports = connectDatabase;



//schema, document, collection and model
// schema is like the structure of documents, it defines the scructure and validation of the documents.
// document is the single record in the collection.
// collection is group of ducuments, it is like a table in relational database.
// model is the methods which we use to interact with the collection.