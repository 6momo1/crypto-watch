import express from "express"
import cors from "cors"
import { useFetchedTokenDatas } from "./data/tokens/tokenData";
import { client } from "./apollo";
import web3 from "web3"
import { useFetchTokenPriceData } from "./data/tokens/priceData"

interface fetchTokenDatasPost {
    addresses: string[]
}


const app = express()

// Constants
const PORT: number = 5000

//middleware
app.use(cors());
app.use(express.json()); //req.body, allow express to read json

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Home Page" );
} );

app.post( "/fetchTokenDatas", async ( req: any , res ) => {

    console.log(req.body.addresses);

    if (!req.body.addresses) {
        return res.send("ERROR: invalid addresses")
    }

    // error handling for invalid arguments
    const validAdrs: string[] = []
    const invalidAdrs: string[] = []
    req.body.addresses.forEach( address => {
        if (web3.utils.isAddress(address)) {
            validAdrs.push(address)
        } else {
            invalidAdrs.push(address)
        }
    })
    
    // fetch token datas
    await useFetchedTokenDatas( validAdrs, client )
    .then( tokenDatas => {
        let result = { addresses: {valid: validAdrs, invalid: invalidAdrs} , tokenDatas }
        res.send(result)
        .catch( error => {
            res.send(error)
        })
    })
})


app.post ("/fetchTokenPriceData", async (req: any, res ) => {

    if (!req.body.address) {
        return res.send("ERROR: invalid address")
    }

    const adrs: string = req.body.address

    // fetch token prices
    await useFetchTokenPriceData(adrs, client)
    .then( data => {
        res.send( { data })
    })
    .catch( error => {
        res.send(error)
    })
})


app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});