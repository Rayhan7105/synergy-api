const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const {graphqlHTTP} = require("express-graphql");
const isAuth = require("./middleware/is-auth");
const mongoose = require("mongoose");
const runSocketIO = require("./socketIO");
const NoIntrospection = require("graphql-disable-introspection");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
runSocketIO(io);

const graphQLSchema = require("./graphql/schema/index");
const graphQLResolvers = require("./graphql/resolvers/index");

const PORT = process.env.PORT || 4000;
const MOGODB = "mongodb+srv://admin:admin123@cluster0.sm43j5d.mongodb.net/testdb?retryWrites=true&w=majority";

app.use(bodyParser.json({limit: "5mb"}));
app.use(bodyParser.urlencoded({limit: "5mb", extended: true}));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    // don't want to allow option request to continue on our server since it can't be handled.
    return res.sendStatus(200);
  }
  next();
});
app.use(isAuth);
app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphQLSchema,
    rootValue: graphQLResolvers,
    graphiql: true,
    validationRules: [NoIntrospection],
  })
);
mongoose
  .connect(MOGODB, {useNewUrlParser: true})
  .then(() => {
    console.log(`server is running on port ${PORT}`);
    server.listen(PORT);
  })
  .catch((err) => {
    console.log(err);
  });
