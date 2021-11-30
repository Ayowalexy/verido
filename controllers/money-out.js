const User = require('../models/users/Users');
const DirectMaterialPurchase = require('../models/money-out/Direct-Materials')
const DirectLabourPurchase = require('../models/money-out/Direct-Labour')
const Overhead = require('../models/money-out/Overhead')
const AssetPurchase = require('../models/money-out/Asset-purchase')
const RefundGiven = require('../models/money-out/Refund_Given')
const OtherTransaction = require('../models/money-out/Other_Transaction')
const catchAsync = require('../utils/catchAsync')

module.exports.directMaterialPurchase = catchAsync( async(req, res, next ) => {
   try {
        const  { supplierID = null } = req.body;

        const { username } = req.session.currentUser;
        const user = await User.findOne({username}).populate({
            path: 'money_out',
            populate: {
                path: 'direct_material_purchase'
            }
        }).populate('suppliers');

        let currentSupplier;
        if(supplierID){
            for(let supplier of user.suppliers){
                if(supplier.id === supplierID){
                    currentSupplier = supplier;
                }
            }
        }

        const newDirectMaterialPurchase = new DirectMaterialPurchase({...req.body})
        currentSupplier ? newDirectMaterialPurchase.supplier.push(currentSupplier) : null
        await newDirectMaterialPurchase.save();
        user.money_out.direct_material_purchase.push(newDirectMaterialPurchase)
        await user.save();
        return res.status(200).json({"code": 200, "message": "Ok", "response": newDirectMaterialPurchase})
   } catch (e){
       return next(e)
   }
})

module.exports.directLabourPurchase = catchAsync( async (req, res, next) => {
    try {
        const { username } = req.session.currentUser;
        const { supplierID = null } = req.body;
        const user = await User.findOne({username}).populate({
            path: 'money_out',
            populate: {
                path: 'direct_labour'
            }
        }).populate('suppliers');
        let currentSupplier;
        if(supplierID){
            for(let supplier of user.suppliers){
                if(supplier.id === supplierID){
                    currentSupplier = supplier;
                }
            }
        }

        const newDirectLabourPurchase = new DirectLabourPurchase({...req.body})
        currentSupplier ? newDirectLabourPurchase.supplier.push(currentSupplier): null
        await newDirectLabourPurchase.save();
        user.money_out.direct_labour.push(newDirectLabourPurchase)
        await user.save();

        return res.status(200).json({"code": 200, "message": "ok", "response": newDirectLabourPurchase})


    } catch(e){
        return next(e)
    }
})

module.exports.overhead = catchAsync( async(req, res, next) => {
    try {
        const { username } = req.session.currentUser;
        const { supplierID = null } = req.body;
        const user = await User.findOne({username}).populate({
            path: 'money_out',
            populate: {
                path: 'overhead'
            }
        }).populate('suppliers');

        let currentSupplier;
        if(supplierID){
            for(let supplier of user.suppliers){
                if(supplier.id === supplierID){
                    currentSupplier = supplier;
                }
            }
        }

        const newOverhead = new Overhead({...req.body});
        currentSupplier ? newOverhead.supplier.push(currentSupplier) : null
        await newOverhead.save();
        user.money_out.overhead.push(newOverhead);
        await user.save();

        return res.status(200).json({"code": 200, "message": "ok", "response": newOverhead})

    } catch (e){
        return next(e)
    }
})

module.exports.assetPurchase = catchAsync(async(req, res, next) => {
        try {
            const { username } = req.session.currentUser;
            const { supplierID = null } = req.body;
            const user = await User.findOne({username}).populate({
                path: 'money_out',
                populate: {
                    path: 'asset_purchase'
                }
            }).populate('suppliers');
    
            let currentSupplier;
            if(supplierID){
                for(let supplier of user.suppliers){
                    if(supplier.id === supplierID){
                        currentSupplier = supplier;
                    }
                }
            }
    
            const newAssetPurchase = new AssetPurchase({...req.body});
            currentSupplier ? newAssetPurchase.supplier.push(currentSupplier) : null
            await newAssetPurchase.save();
            user.money_out.asset_purchase.push(newAssetPurchase);
            await user.save();
    
            return res.status(200).json({"code": 200, "message": "ok", "response": newAssetPurchase})
    
        } catch (e){
            return next(e)
        }
})

module.exports.refundGiven = catchAsync( async (req, res, next) => {
    try {
        const { username } = req.session.currentUser;
        const { customerID = null } = req.body;
        const user = await User.findOne({username}).populate({
            path: 'money_out',
            populate: {
                path: 'refund_given'
            }
        }).populate('customer');

        let currentCustomer;
        if(customerID){
            for(let customer of user.customer){
                if(customer.id === customerID){
                    currentCustomer = customer;
                }
            }
        }

        const newRefundGiven = new RefundGiven({...req.body});
        currentCustomer ? newRefundGiven.customer.push(currentCustomer) : null
        await newRefundGiven.save();
        user.money_out.refund_given.push(newRefundGiven);
        await user.save();

        return res.status(200).json({"code": 200, "message": "ok", "response": newRefundGiven})

    } catch (e){
        return next(e)
    }
})

module.exports.creditPurchase = catchAsync( async (req, res, next) => {
    try {
        const { username } = req.session.currentUser;
        const { customerID = null } = req.body;
        const user = await User.findOne({username}).populate({
            path: 'money_out',
            populate: {
                path: 'credit_purchase'
            }
        }).populate('customer');

        let currentCustomer;
        if(customerID){
            for(let customer of user.customer){
                if(customer.id === customerID){
                    currentCustomer = customer;
                }
            }
        }

        const newCreditPurchase = new RefundGiven({...req.body});
        currentCustomer ? newCreditPurchase.customer.push(currentCustomer) : null
        await newCreditPurchase.save();
        user.money_out.credit_purchase.push(newCreditPurchase);
        await user.save();

        return res.status(200).json({"code": 200, "message": "ok", "response": newCreditPurchase})

    } catch (e){
        return next(e)
    }
})



module.exports.otherTransaction = catchAsync(async(req, res, next) => {
    try {
        const { username } = req.session.currentUser;
        const { supplierID = null } = req.body;
        const user = await User.findOne({username}).populate({
            path: 'money_out',
            populate: {
                path: 'other_transaction'
            }
        }).populate('suppliers');

        let currentSupplier;
        if(supplierID){
            for(let supplier of user.suppliers){
                if(supplier.id === supplierID){
                    currentSupplier = supplier;
                }
            }
        }

        const newOtherTransaction = new OtherTransaction({...req.body});
        currentSupplier ? newOtherTransaction.supplier.push(currentSupplier) : null
        await newOtherTransaction.save();
        user.money_out.other_transaction.push(newOtherTransaction);
        await user.save();

        return res.status(200).json({"code": 200, "message": "ok", "response": newOtherTransaction})

    } catch (e){
        return next(e)
    }
})