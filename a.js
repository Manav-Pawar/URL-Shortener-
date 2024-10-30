const express =require('express')
const redis = require('redis')
const bodyParser = require('body-parser')
const shortid = require('shortid')

const app = express()

const client = redis.createClient()

client.on("err",(e)=>{
    console.log('Redis Client Error:', e)
})

async function connectToRedis() {
   try{ await client.connect()
    console.log('Connected to Redis')
}catch(e){
    console.log('Error connecting to Redis:', e)
}
}
connectToRedis() 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/shorten', async (req,res)=>{
     const {orignalurl} = req.body
     const shortCode = shortid.generate()

     await client.set(shortCode,orignalurl)
     res.json({
        orignalurl,
        shortCode
     })
})
app.get('/:shortcode', async (req,res)=>{
     const {shortCode} = req.params()

     await client.get(shortCode)
     res.redirect(originalUrl);
})

process.on('SIGINT',async()=>{
    await client.quit()
    process.exit()
})
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
