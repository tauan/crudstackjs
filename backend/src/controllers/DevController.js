const axios = require('axios')
const Dev = require('../models/Dev')
const parseStringAsArray = require('../utils/parseStringAsArray')
const { findConnections, sendMessage } = require('../websocket') 

module.exports = {
    async index(req, resp){
        const devs = await Dev.find()
        return resp.json(devs)
    },
    async store(req, resp) {
        const { github_username, techs, latitude, longitude } = req.body
        let dev = await Dev.findOne({ github_username })

        if(!dev){
            const response = await axios.get(`https://api.github.com/users/${github_username}`)
    
            const { name = login, avatar_url, bio } = response.data
        
            const techArray = parseStringAsArray(techs)
        
            const location = {
                type: 'Point',
                coordinates: [longitude, latitude]
            }
            dev = await Dev.create({
                github_username,
                name,
                avatar_url, 
                bio,
                techs: techArray,
                location
            })


            const sendSocketMessageTo = findConnections(
                {latitude, longitude},
                techArray
            )
            sendMessage(sendSocketMessageTo, 'new-dev', dev)
        }
        return resp.json(dev)
    }





}