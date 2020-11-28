const express = require('express')
const User = require('../models/user')

const auth  = require('../middleware/auth')

const router = new express.Router()

router.post('/users', async (req,res)=>{

    const user = new User(req.body)

    try{    
        //this is a custom function visisble in the user model folder
        //generates a token for the new user
        const token = await user.generateAuthToken()

        //saves the user in DB
        await user.save()
        
        //sending back response
        res.status(201).send({user,token})
    }catch(e){
        //sending error if above fails
        res.status(400).send(e)
    }
})

router.post('/users/login', async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        //calling genereate auth token
        const token = await user.generateAuthToken()
        //send back user and token
        res.status(200).send({user,token})
    }catch(e){
        res.status(400).send()
    }
})

router.post('/users/logout', async(req,res)=>{
    try{
        //removes the token that leads to return a false
        //only removes the token logging out from, does not logout all
        //if token = the token used then we remove it, thus deleting authentication
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })

        await req.user.save()

        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll', async(req,res)=>{
    try{
        //sign out everything, deletes your token array
        req.user.tokens = []
        await user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.get('/users', async (req,res)=>{
    try{
        const users = await User.find({})
        res.status(200).send(users)
    }catch(e){
        res.status(400).send(e)
    }
})

router.get('/users/me', auth, async (req,res)=>{
    try{
        res.status(200).send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

router.patch('/users', async (req,res)=>{
    
    //returns an array of fields in that object
    const updates = Object.keys(req.body)

    //user is allowed to update these fields
    const allowedUpdates = ['name', 'email', 'password','userName']

    //iterates through the updates array and allowed updates array to make sure they match
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    
    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates'})
    }
   
    try{

        updates.forEach((updates)=>{
            //sets req.user.update to req.body.update
            req.user[update]= req.body[update]
        })

        await req.user.save()
        res.status(200).send(req.user)
    }catch(e){
        res.status(500).send(e)
    }

})

router.delete('/users/me', auth, async (req,res)=>{
    
    try{

        await req.user.remove()
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports = router