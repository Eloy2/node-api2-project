const express = require("express");
const db = require("./data/db");

const server = express();
const port = 4000

server.use(express.json());


server.get("/api/posts", (req, res) => {   //Returns an array of all the post objects contained in the database.
    db.find()
        .then((posts) => {
            res.status(200).json(posts)
        })
        .catch((err) => {
            console.log(err)
            res.status(500).json({ error: "The posts information could not be retrieved." })
        })
})

server.get("/api/posts/:id", (req, res) => {  //Returns the post object with the specified id.
    db.findById(req.params.id)
        .then((post) => {
            if (post.length === 0) {
                res.status(404).json({ message: "The post with the specified ID does not exist." })
            } else {
               res.status(200).json(post) 
            }
        })
        .catch((err) => {
            console.log(err)
            res.status(500).json({ error: "The post information could not be retrieved." })
        })
})

server.get("/api/posts/:id/comments", (req, res) => {  //Returns an array of all the comment objects associated with the post with the specified id.
    db.findById(req.params.id)
        .then((post) => {
            if (post.length === 0) {
                res.status(404).json({ message: "The post with the specified ID does not exist." })
            } else {
               db.findPostComments(req.params.id)
                    .then((comments) => {
                        if (comments.length === 0) {
                            res.status(200).json({ message: "This post currently has no comments." })
                        } else {
                            res.status(200).json(comments)
                        }
                    })
                    .catch((err) => {
                        console.log("err inside findpostcomments",err)
                        res.status(500).json({ error: "The comments information could not be retrieved." })
                    })
            }
        })
        .catch((err) => {
            console.log(err)
            res.status(500).json({ error: "The comments information could not be retrieved." })
        })
})

server.post("/api/posts", (req, res) => {  //Creates a post using the information sent inside the request body.
    if (!req.body.title || !req.body.contents) {
        res.status(400).json({ errorMessage: "Please provide title and contents for the post." })
    } else {
        db.insert({ title: req.body.title, contents: req.body.contents})
            .then((post) => {
                db.findById(post.id)
                    .then((newpost) => {
                        res.status(201).json(newpost)
                    })
                    .catch((err) => {
                        console.log("error inside POST findById /api/posts",err)
                        res.status(500).json({ error: "There was an error while saving the post to the database." })
                    })
            })
            .catch((err) => {
                console.log("error inside POST /api/posts",err)
                res.status(500).json({ error: "There was an error while saving the post to the database." })
            })
    }
})

server.post("/api/posts/:id/comments", (req, res) => {  //Creates a comment for the post with the specified id using information sent inside of the request body.
    db.findById(req.params.id)
        .then((post) => {
            if (post.length === 0) {
                res.status(404).json({ message: "The post with the specified ID does not exist." })
            } else {
                if (!req.body.text){
                    res.status(400).json({ errorMessage: "Please provide text for the comment." })
                } else {
                    db.insertComment({ text: req.body.text, post_id: post[0].id })
                        .then((commentID) => {
                            db.findCommentById(commentID.id)
                                .then((newComment) => {
                                    res.status(201).json(newComment)
                                })
                                .catch((err) => {
                                    console.log("err in POST /api/posts/:id/comments findCommentById",err)
                                    res.status(500).json({ error: "There was an error while saving the comment to the database." })
                                })
                        })
                        .catch((err) => {
                            console.log("err in POST /api/posts/:id/comments insertComment",err)
                            res.status(500).json({ error: "There was an error while saving the comment to the database." })
                        })
                }
            }
        })
        .catch((err) => {
            console.log("err from POST /api/posts/:id/comments",err)
            res.status(500).json({ error: "There was an error while saving the comment to the database." })
        })
})

server.delete("/api/posts/:id", (req, res) => { //Removes the post with the specified id and returns the deleted post object. You may need to make additional calls to the database in order to satisfy this requirement.
    db.findById(req.params.id)
        .then((post) => {
            if (post.length === 0) {
                res.status(404).json({ message: "The post with the specified ID does not exist." })
            } else {
                db.remove(req.params.id)
                    .then((amountDeleted) => {
                        res.status(200).json({ deleted_post: post[0], amount: `You deleted ${amountDeleted} post.`})
                    })
            }
        })
        .catch((err) => {
            console.log("err from DELETE /api/posts/:id",err)
            res.status(500).json({ error: "The post could not be removed." })
        })
})


server.put("/api/posts/:id", (req, res) => { //Updates the post with the specified id using data from the request body. Returns the modified document, NOT the original.
    db.findById(req.params.id)
        .then((post) => {
            if (post.length === 0) {
                res.status(404).json({ message: "The post with the specified ID does not exist." })
            } else {
                if (!req.body.title || !req.body.contents) {
                    res.status(400).json({ errorMessage: "Please provide title and contents for the post." })
                } else {
                    db.update(post[0].id, { title: req.body.title, contents: req.body.contents })
                        .then((amountUpdated) => {
                            db.findById(req.params.id)
                                .then((updatedPost) => {
                                    res.status(200).json(updatedPost)
                                })
                        })
                }
            }
        })
        .catch((err) => {
            console.log("err from PUT /api/posts/:id",err)
            res.status(500).json({ error: "The post information could not be modified." })
        })
})


server.listen(port, () => {
    console.log(`server started on port ${port}`)
})