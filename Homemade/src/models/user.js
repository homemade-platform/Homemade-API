  
//requiring mongoose
const mongoose = require('mongoose')

//loading in the validator npm
const validator = require('validator')

//requiring bcrypt
const bcrypt = require('bcryptjs')

//requiring th JSON webtokesn
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true

    },
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email invalid')
            }
                
        }
    },

    password:{
        type: String,
        required: true,
        validate(value){
            if(value.includes('password')){
                throw new Error('Invalid password (should not include password)')
            }
        }

    },
    avatar:{
        type: Buffer
    },

    tokens:[{
        token:{
            type: String,
            required: true
        }
    }]
})

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this

    const token = jwt.sign({_id: user._id.toString()},'secret')

    user.tokens = user.tokens.concat({token:token})

    await user.save()

    return token
}

userSchema.static.findByCredentials = async (email, password)=>{
    const user = await User.findOne({email})

    if(!user){
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error ('Unable to login')

    }

    return user
}

userSchema.pre('save', async function(next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }

    next()
})
const User = mongoose.model('User',userSchema)

module.exports = User