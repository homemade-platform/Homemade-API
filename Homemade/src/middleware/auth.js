//requiring JWT library
const jwt = require ('jsonwebtoken')

//requring the models user
const User = require('../models/user')

//authentication function
const auth = async(req,res, next)=>{


    try{

        
        //gets the token from the header
        const token = req.header('Authorization').replace('Bearer ', '')

        //verifyng the token
        const decoded = jwt.verify(token, 'secret')

        //once verified find a user with that token 
        const user = await User.findOne({_id: decoded._id, 'tokens.token':token})


        if(!user){
            throw new Error('No user')
        }

        //this user and token are available as req.user/token in other files
        req.token = token
        req.user = user
       
        next()
    }catch(e){
        //any error will read this
        res.status(400).send({error: 'Please Authenticate'})
    }
}

module.exports = auth