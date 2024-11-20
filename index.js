const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { isNumber } = require("razorpay/dist/utils/razorpay-utils");
// const bodyParser = require("body-parser");
const app = express();
app.use(express.json());
app.use(cors());
// app.use(bodyParser.urlencoded({extended:true}))
mongoose.connect("mongodb://localhost:27017/demoRoxdb");

const productInfoSchema = new mongoose.Schema(
    {
        id : {type : Number},
        title:{type : String},
        price : {type : Number},
        description : {type : String},
        category : {type : String},
        image : {type:String},
        sold : {type : Boolean},
        dateOfSale : {type : Date}
    }
)
const Product = mongoose.model("Product",productInfoSchema)
app.get("/",(req,res)=>{
    res.send("server is working")
});

app.get("/inDb",async(req,res)=>{
    try {
        const products = await Product.find().sort({id:1});
        res.status(200).json(products)
    } catch (error) {
        res.send(error)
        console.log(error)
    }
})

app.get("/getByMonth/:mon",async(req,res)=>{
    console.log("first")
    let totalSale = 0;
    let soldItem = 0;
    let notSoldItem = 0;
    try {
        const products = await Product.find({"$expr":{"$eq":[{"$month":"$dateOfSale"},Number(req.params.mon)]}}).sort({id:1})
        console.log(products)
        products.forEach((element)=>{
            if (element.sold === true) {
                totalSale = Number(totalSale) + Number(element.price)
                soldItem = soldItem + 1;
            }
        })
        notSoldItem = products.length - soldItem
        // console.log(totalSale+" "+soldItem+" "+notSoldItem)
        const proData = {
            products : products,
            totSale : totalSale,
            soItem : soldItem,
            notSItem : notSoldItem
        }
        res.status(200).json(proData)
    } catch (error) {
        res.send(error)
        console.log(error)
    }
})

app.get("/getBarChart/:mon",async(req,res)=>{

    const arr=[{lbond : 0,ubond:100,count:0,name:"0-100"},{lbond : 101,ubond:200,count:0,name:"101-200"},{lbond : 201,
    ubond:300,
count:0,name:"201-300"},
{lbond : 301,
    ubond:400,
count:0,name:"301-400"},
{lbond : 401,
    ubond:500,
count:0,name:"401-500"},{lbond : 501,
    ubond:600,
count:0,name:"501-600"},{lbond : 601,
    ubond:700,
count:0,name:"601-700"},{lbond : 701,
    ubond:800,
count:0,name:"701-800"},
{lbond : 801,
    ubond:900,
count:0,name:"801-900"},
{lbond : 901,
    ubond:"above",
count:0,name:"901-above"}]
    try {
        const products = await Product.find({"$expr":{"$eq":[{"$month":"$dateOfSale"},Number(req.params.mon)]}}).sort({price:1});
        
        for (let index = 0; index < products.length; index++) {
            let pricePro = products[index].price
            for (let i = 0; i < arr.length; i++) {
                if((pricePro >= arr[i].lbond)&&(pricePro <= arr[i].ubond)){
                    arr[i].count = arr[i].count + 1;
                    break;
                }
                else if(pricePro>900){
                    console.log('first')
                    arr[9].count = arr[9].count + 1;
                    break
                }
            }
        }
        // console.log(products);
        // console.log(arr);
        res.status(200).json(arr)
    } catch (error) {
        console.log(error)
        res.status(300).send(error)
    }
})

app.get("/getPieChart/:mon",async(req,res)=>{
    const arr = []
    let i=0;
    try {
        const products = await Product.find({"$expr":{"$eq":[{"$month":"$dateOfSale"},Number(req.params.mon)]}}).sort({category:1});

        products.forEach((element)=>{
            if (arr.length === 0) {
                arr.push(
                    {
                        category : element.category,
                        count:1
                    }
                )
            }
            else if(arr[i].category === element.category){
                arr[i].count = arr[i].count + 1;
            }
            else{
                arr.push(
                    {
                        category:element.category,
                        count:1
                    }
                )
                i = i + 1;
            }
        })
        // console.log(products)
        // console.log(arr)
        res.status(200).json(arr)
    } catch (error) {
        console.log(error)
    }
})

app.get("/getSearchResult/:str",async(req,res)=>{
    let price=0
    if (isNumber(req.params.str)) {
        price = Number(req.params.str)
        console.log(price)
    }
    try {
        const products = await Product.find({
            $or:[{title:req.params.str},{price:price},{description:req.params.str}]
        });
        console.log(products)
        res.status(200).json(products)
    } catch (error) {
        res.send(error)
        console.log(error)
    }
})


app.listen(5000,(req,res)=>{
    console.log("server is running on port 5000")
})