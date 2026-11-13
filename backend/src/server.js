import app from './app.js'
import { config } from './config.js'

app.listen(config.porta, () => {
  console.log(`Headstock API em http://localhost:${config.porta}`)
  console.log(`Documentação em http://localhost:${config.porta}/docs`)
})
