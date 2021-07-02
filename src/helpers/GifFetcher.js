import fetch from 'node-fetch'

const API_URL = 'https://api.tenor.com/v1/search'

export const getGif = async ( search ) => {
    const response = await fetch(`${ API_URL }?q=${ encodeURI( search ) }&media_filter=minimal&limit=5`)
    const { results } = await response.json()
    const { gif } = results[1].media[0]

    return gif.url
}