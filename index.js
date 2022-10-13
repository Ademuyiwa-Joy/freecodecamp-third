require('dotenv').config();
const mongoose = require("mongoose")
const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser")
const validator = require("validator")
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true})
.then(() => {
  console.log(`DB connection on`)
})
.catch((err) => {
  console.log(err)
})

const urlSchema = new mongoose.Schema({
  original: {type: String, required: true},
  short: Number
})

const Url = mongoose.model("Url", urlSchema)

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  const {url} = req.body

  if(!validator.isURL(url)){
    return res.json({error: "Invalid URL"})
  }

  let inputShort = 1
  Url.findOne({})
  .sort({short: "desc"})
  .exec((error, result) => {
      if(!error && result != undefined){
        inputShort = result.short + 1
      }
      if(!error){
        Url.findOneAndUpdate({original: url}, {original: url, short: inputShort}, {new: true, upsert: true}, 
          (err, savedUrl) => {
            if(err){
              return console.log(err)
            }
            res.json({original_url: url, short_url: savedUrl.short})
          })
      }
  })
})

app.get('/api/shorturl/:input', (req, res) => {
  const {input} = req.params
  Url.findOne({short: input})
  .then((url) => {
    const {original} = url
    res.redirect(original)
  })
  .catch((err) => {
    console.log(err)
  })

})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
