import app from './app'
import bot from './bot'

const run = async () => {
    try{
        app.listen(app.get('port'))
        console.log(`Server is connected on port ${ app.get('port') }`)
        await bot()
    }catch(ex){
        console.error(`Error: ${ ex.message }`)
    }
}

run()


