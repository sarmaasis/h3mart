const express = require("express");
const mongoose = require('mongoose')
const multer = require('multer')
const product  = require('./model/productSchema')
const csvtojson = require('csvtojson')
const xlsx = require('xlsx')
const axios = require('axios');
const { response } = require("express");

const app = express();
 

// app.use('/', () => {

// })

mongoose.connect('mongodb://localhost:27017/ProductList').then(() => {     // MongoDB connection
    console.log('database connected')
});

const xlsStorage = multer.diskStorage({
    // Destination to store xlxs 
    destination: 'uploads', 
      filename: (req, file, cb) => {
          cb(null, file.originalname)
            // file.fieldname is name of the field
            // path.extname get the uploaded file extension
    }
});

const xlsUpload = multer({
    storage: xlsStorage,
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(xlsx)$/)) { 
         // upload only xlxs
         return cb(new Error('Please upload a Excel'))
       }
     cb(undefined, true)
  }
}) 

var product_code_entry = []
var price_list = []

app.post('/api/product_price', xlsUpload.single('product_list'), (req, res) => {
    
    const file = xlsx.readFile('./uploads/product_list.xlsx')
   
    json_response = {}
    const sheets = file.SheetNames
    for(let i = 0; i < sheets.length; i++){
        const temp = xlsx.utils.sheet_to_json(
                file.Sheets[file.SheetNames[i]])
        temp.forEach((entry) => {
            product_code_entry.push(entry)
    })

    console.log(product_code_entry.length)

    product_code_entry.forEach((code) => {
        axios.get(`https://api.storerestapi.com/products/${code.product_code}`)
                .then(data => {
                    price_list.push(data.data.data)
                    convert()
                })
                .catch(err => console.log(err));
    })

    const convert = () => {
        const worksheet= xlsx.utils.json_to_sheet(price_list)
        const workbook = xlsx.utils.book_new()

        xlsx.utils.book_append_sheet(workbook,worksheet,`price_list`)

        xlsx.write(workbook,{bookType: 'xlsx', type: 'buffer'})

        xlsx.write(workbook,{bookType: 'xlsx', type: 'binary'})

        xlsx.writeFile(workbook,'product_list.xlsx')

    }

    const excel_file = `./product_list.xlsx`
    res.download(excel_file)
}
})



app.listen(3000, () => {
    console.log('Node server listening on port 3000');
});