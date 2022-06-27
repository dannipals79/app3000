const express = require('express') 
const multer = require ('multer')
const upload = multer( {dest:'uploads/'} )

const fs = require('fs')
const path = require('path')

const app = express()

const database = require('./database')

const s3 = require('./s3')

app.use(express.static('build'))


app.get('/images/:filename', (req, res) => {
    
    const filename = req.params.filename
    const readStream = s3.getFileStream(filename)
    // const readStream = fs.createReadStream(path.join(__dirname, 'uploads', filename))
    readStream.pipe(res)

} )

app.get('/posts', (req, res) => {
    database.getPosts((error, posts) => {
        if(error) {
            res.send({error:error.message})
            return 
        }
        res.send({posts})
    })
})

app.post('/posts', upload.single('image'), async (req, res) =>{
    const { filename, path } = req.file
    const description = req.body.description   
    // console.log(req.file)

    await s3.uploadFile(req.file)
    
    // save these details to database 
    const image_url = `/images/${filename}`
    database.createPost(description, image_url, (error, insertId) => {
        if(error) {
            res.send({error:error.message})
            return 
        }
        res.send({
            id: insertId,
            description,
            image_url
        })
    })       
    // res.send("!jaz")
})

const port = process.env.PORT || 8080
app.listen(port, () => {
   console.log(` Listening on port ${port} `)	

})
