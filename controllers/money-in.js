const User = require('../models/users/Users')
const catchAsync = require('../utils/catchAsync')
const Product = require('../models/users/Product')
const Material = require('../models/money-in/Materials')
const Labour = require('../models/money-in/Labour')
const Refund = require('../models/money-in/Refund')
const Credit = require('../models/money-in/Credit')
const OtherTransaction = require('../models/money-in/OtherTransaction')
const verifyToken = require('../authenticate')
const jwt = require('jsonwebtoken')


module.exports.addProduct =  catchAsync(async (req, res, next) => {

    try {
     //    const { id } = req.user;
    //  const { username } = req.session.currentUser;
 
    jwt.verify(req.token, 'secretkey', async(err, data) => {
        if(err){
            res.json({"code": 403, "message": "Auth Failed"})
        } else {
            const { product } = req.body;
        const user = await User.findOne({username: data.user.username}).populate('product')
         console.log(user.product)
       if(user.product.length){
         for(let userProduct of user.product ){
             if(userProduct.product === product){
                 //PRODUCT ALREADY EXISTS, THIS WILL CREATE A DUPLICATE OF THE PRODUCT;
                return res.status(403).json({"code": 403, "status": "Duplicate", "message": `A product with name ${product} already exist`})
             } 
        }
        const newProduct = new Product({...req.body});
        user.product.push(newProduct);
        await user.save();
       } 
 
       const firstProduct = new Product({...req.body});
       await firstProduct.save()
       user.product.push(firstProduct)
       await user.save();
 
        
        res.status(200).json({"code": 200, "status": "Ok", "message": "New Product Scuccessfully added", "response": firstProduct})
        }
    })
        
     } catch (e){
         next(e)
     }
 })

 
module.exports.addMaterial = catchAsync(async (req, res, next) => {
    try {
        // const { id } = req.user;
        // const { username } = req.session.currentUser;
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 403, "message": "Auth Failed"})
            } else {
                const { material } = req.body;
                    const user = await User.findOne({username: data.user.username}).populate({
                        path: 'money_in',
                        populate: {
                            path: 'material_assign'
                        }
                    })
                    console.log(user.material_assign)
                if(user.money_in.material_assign.length){
                    for(let userMaterial of user.money_in.material_assign ){
                        if(userMaterial.material === material){
                            //PRODUCT ALREADY EXISTS, THIS WILL CREATE A DUPLICATE OF THE PRODUCT;
                            return res.status(403).json({"code": 403, "status": "Duplicate", "message": `A Material with name ${material} already exist`})
                        } 
                    }
                    const newMaterial = new Material({...req.body});
                    user.money_in.material_assign.push(newMaterial);
                    await user.save();
                } 
            
                const firstMaterial = new Material({...req.body});
                await firstMaterial.save()
                user.money_in.material_assign.push(firstMaterial)
                await user.save();
            
                    
                res.status(200).json({"code": 200, "status": "Ok", "message": "New Material Scuccessfully added", "response": firstMaterial})
            }
        })

        
     } catch (e){
         next(e)
     }
   
 })


 module.exports.addLabour = catchAsync(async (req, res, next) => {
    try {
        // const { id } = req.user;
        // const { username } = req.session.currentUser;
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 403, "message": "Auth Failed"})
            } else {
                const { title } = req.body;
                const user = await User.findOne({username: data.user.username}).populate({
                    path: 'money_in',
                    populate: {
                        path: 'labour_assign'
                    }
                })
                console.log(user.money_in.labour_assign)
                console.log(title)
            if(user.money_in.labour_assign.length){
                for(let userLabour of user.money_in.labour_assign ){
                    if(userLabour.title === title){
                        //PRODUCT ALREADY EXISTS, THIS WILL CREATE A DUPLICATE OF THE PRODUCT;
                        return res.status(403).json({"code": 403, "status": "Duplicate", "message": `A Labour with name ${title} already exist`})
                    } 
                }
                const newLabour = new Labour({...req.body});
                user.money_in.labour_assign.push(newLabour);
                await user.save();
            } 
        
            const firstLabour = new Labour({...req.body});
            await firstLabour.save()
            user.money_in.labour_assign.push(firstLabour)
            await user.save();
        
                
                res.status(200).json({"code": 200, "status": "Ok", "message": "New Labour Scuccessfully added", "response": firstLabour})
            }
        })

        
     } catch (e){
         next(e)
     }
   
 })

 module.exports.refundReceived = catchAsync(async(req, res, next) => {
    try {
        // const { id } = req.user;
        // const { username } = req.session.currentUser;
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 403, "message": "Auth Failed"})
            } else {
                const { productID, supplierID } = req.body;
                const user = await User.findOne({username: data.user.username}).populate({
                    path: 'money_in',
                    populate: {
                        path: 'refund'
                    }
                }).populate('suppliers');
                const { suppliers } = user;
                let currentSupplier;
        
                for(let supplier of suppliers){
                    if(supplier.id === supplierID){
                        currentSupplier = supplier
                    }
                }
                const newRefund = new Refund({...req.body})
                currentSupplier ? newRefund.supplier.push(currentSupplier) : null
                await newRefund.save();
                user.money_in.refund.push(newRefund)
                await user.save();
                return res.status(200).json({"code": 200, "status": "Ok", "message": "New refund recorded", "response": newRefund})
            }
        })

       

    } catch (e){
        return next(e)
    }
})

module.exports.creditSale = catchAsync(async(req, res, next) => {
    try {
        // const { id } = req.user;

        // const { username } = req.session.currentUser;
        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 403, "message": "Auth Failed"})
            } else {
                const { productID, customerID } = req.body;


        const user = await User.findOne({username: data.user.username})
                            .populate('customer')
                            .populate('product');
        const { product } = user;

        let currentCustomer;
        for(let customer of user.customer){
            if(customer.id ===  customerID){
                currentCustomer = customer
            }
        }


        const newCreditSale = new Credit({...req.body});

        currentCustomer ? newCreditSale.customer.push(currentCustomer) : null
        await newCreditSale.save();
        for(let currentProduct of product){
            if(currentProduct.id === productID){
                currentProduct.credit_sale.push(newCreditSale)
                await currentProduct.save()
            }
        }
        await user.save();
        
        return res.status(200).json({"code": 200, "status": "Ok", "message": "New credit sale recorded", "response": newCreditSale})
            }
        })

        
    } catch(e){
        return next(e)
    }
})

module.exports.otherTransaction = catchAsync( async(req, res, next) => {
    try {
        // const { username } = req.session.currentUser;

        jwt.verify(req.token, 'secretkey', async(err, data) => {
            if(err){
                res.json({"code": 403, "message": "Auth Failed"})
            } else {
                const { customerID = null } = req.body;

        const user = await User.findOne({username: data.user.username})
                            .populate({
                                path: 'money_in',
                                populate: {
                                    path: 'other_transaction'
                                }
                            })
                            .populate('customer');


        const newOtherTransaction = new OtherTransaction({...req.body});

        let currentCustomer;
        for(let customer of user.customer){
            if(customer.id ===  customerID){
                currentCustomer = customer
            }
        }

        currentCustomer ? newOtherTransaction.customer.push(currentCustomer) : null
        await newOtherTransaction.save();
        user.money_in.other_transaction.push(newOtherTransaction)
        await user.save();

        return res.status(200).json({"code": 200, "status": "Ok", "message": "Other transaction catalogued", "response": newOtherTransaction})
            }
        })
        


    } catch (e){
        return next(e)
    }
})