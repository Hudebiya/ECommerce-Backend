import productModel from "../models/products.model.js";
import userModel from "../models/users.model.js";
import uploadFile from "../../services/storage.service.js";

async function createProduct(req, res) {
    if(!req.file){
        return res.status(400).json({
            message: "Image is requires"
        })
    }
    const { name, desc } = req.body

    const uploadImage = await uploadFile(
        req.file.buffer,
        req.file.originalname
    )

    const product = await productModel.create({
        image: uploadImage.url,
        name, desc, 
        admin: req.user.id

    })
    res.status(201).json({
        message:"Product added",
        product
    })
}

async function getProducts(req,res){
    try {
        
        const products = await productModel.find().populate("admin","username email")
        res.status(200).json({
            message:"Products fetched sucessfully",
            products
        })

    } catch (error) {
        res.status(500).json({
            message:"Failed to fetch Products",
            error:error.message
        })
    }
}

export {createProduct ,getProducts}