import moment from 'moment'

export const formatSeconds = (seconds) => {
    let format

    //Check if seconds are lower than 1 hour
    if( seconds < 3600 ){
        format = 'm[m] s[s]'
    }else{
        format = 'H[h] m[m] s[s]'
    }

    return moment()
        .startOf("day")
        .seconds(seconds)
        .format(format)
}