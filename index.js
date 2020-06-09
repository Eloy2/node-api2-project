const express = require("express");
const postsRouter = require("./posts_router");

const server = express();
const port = 4000;

server.use(express.json());
server.use(postsRouter);




server.listen(port, () => {
    console.log(`server started on port ${port}`)
})