// require necessary NPM packages
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

// instantiate express application object
const app = express()

// require route files
const exampleRoutes = require('./app/routes/example_routes')
const userRoutes = require('./app/routes/user_routes')
const profileRoutes = require('./app/routes/profile_routes')
const restaurantRoutes = require('./app/routes/restaurant_routes')
const commentRoutes = require('./app/routes/comment_routes')
const messageRoutes = require('./app/routes/message_routes')
const matchRoutes = require('./app/routes/match_routes')

// require middleware
const errorHandler = require('./lib/error_handler')
const replaceToken = require('./lib/replace_token')
const requestLogger = require('./lib/request_logger')

// require database configuration logic
// `db` will be the actual Mongo URI as a string
const db = require('./config/db')

// require configured passport authentication middleware
const auth = require('./lib/auth')

// define server and client ports
// used for cors and local port declaration
const serverDevPort = 8000
const clientDevPort = 3000

// establish database connection
// use new version of URL parser
// use createIndex instead of deprecated ensureIndex
mongoose.connect(db, {
	useNewUrlParser: true,
})

mongoose.connection.once('open', () => {
	console.log(`Connected to MOngoDB at ${mongoose.connection.host}:${mongoose.connection.port} `)
})

// set CORS headers on response from this API using the `cors` NPM package
// `CLIENT_ORIGIN` is an environment variable that will be set on Heroku
app.use(
	//says to allow request from all origins
	cors()
)

// define port for API to run on
// adding PORT= to your env file will be necessary for deployment
const port = process.env.PORT || serverDevPort

// this middleware makes it so the client can use the Rails convention
// of `Authorization: Token token=<token>` OR the Express convention of
// `Authorization: Bearer <token>`
app.use(replaceToken)

// register passport authentication middleware
app.use(auth)

// add `express.json` middleware which will parse JSON requests into
// JS objects before they reach the route files.
// The method `.use` sets up middleware for the Express application
app.use(express.json())
// this parses requests sent by `$.ajax`, which use a different content type
app.use(express.urlencoded({ extended: true }))

// log each request as it comes in for debugging
app.use(requestLogger)

// register route files
app.use(exampleRoutes)
app.use(userRoutes)
app.use(profileRoutes)
app.use(restaurantRoutes)
app.use(commentRoutes)
app.use(messageRoutes)
app.use(matchRoutes)
// register error handling middleware
// note that this comes after the route middlewares, because it needs to be
// passed any error messages from them
app.use(errorHandler)

// run API on designated port (4741 in this case)
app.listen(port, () => {
	console.log('Listening on port ' + port)
})

// needed for testing
module.exports = app
