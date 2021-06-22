import { join } from 'path'
import { readdirSync, statSync } from "fs"

export const getCommandFiles = (fileList = []) => {
    const dir = join(__dirname, "commands")

    const files = readdirSync(dir)

    for(const file of files){
        if (statSync(join(dir, file)).isDirectory()) {
            fileList = getCommandFiles(join(dir, file), fileList)
        }else if(file.endsWith(".js")){
            fileList.push(join(dir, file))
        }
    }

    return filelist
        .map(file => file.replace(dir, ""))
}