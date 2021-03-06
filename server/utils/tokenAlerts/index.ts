import { TokenAlertInterface, TokenAlerts } from '../../models/tokenAlerts'
import { User, UserInterface } from '../../models/users'
import { notifyByEmail, notifyByTelegram } from './notifyByServices'

/*
    alert user if token price is either above or below the user's price target
// */
function shouldAlertUser(
    tokenAddress: string, 
    currentPrice: number,
    user: UserInterface
):
{
    shouldAlert: boolean,
    error: boolean,
    message: string
}
{
    
    const watchlistObjIdx = user.tokenWatchlist.findIndex( item => item.tokenAddress === tokenAddress)

    const pricesAbove = user.tokenWatchlist[watchlistObjIdx].priceAlerts.above
    const pricesBelow = user.tokenWatchlist[watchlistObjIdx].priceAlerts.below
    

    // if user does not have any price targets, return
    if (!pricesAbove && !pricesBelow) {
        return {
            shouldAlert: false, 
            error: true, 
            message: "Token is not in " + user.googleId + "'s watchlist."
        }
    }

    // // if current price reaches above user's price target, alert
    for (let i = 0; i < pricesAbove.length; i++) {
        let priceAbove = pricesAbove[i]
        if (currentPrice >= priceAbove) {
            return {
                shouldAlert: true,
                error: false,
                message: "Should alert user."
            }
        }
    }

    // // if current price reaches below user's price target, alert
    for (let i = 0; i < pricesBelow.length; i++) {
        let priceAbove = pricesBelow[i]
        if (currentPrice >= priceAbove) {
            return {
                shouldAlert: true,
                error: false,
                message: "Should alert user."
            }
        }
    }

    return {
        shouldAlert: false,
        error: true,
        message: "Price targets not reached."
    }
}

export async function sendPriceAlertToAllUsers(
    price: number, 
    tokenAddress: string,
    tokenAlertObj: TokenAlertInterface
):
Promise<{
    error: boolean,
    alertsSentTo: {name:string, by: string}[],
    alertsNotSentTo: string[],
    message: string
}>
{
    // initate return objects for feedback
    const alertsSentTo: {name:string, by: string}[] = []
    const alertsNotSentTo: string[] = []
    
    // check if token exists
    if (!tokenAlertObj) {
        return { 
            error: true,
            alertsSentTo,
            alertsNotSentTo,
            message: "Token does not exists in tokenAlerts Database."
        }
    }

    // get token subscribers
    const subscribers: string[] = tokenAlertObj.subscribers
    if (!subscribers) {
        return { 
            error: true,
            alertsSentTo,
            alertsNotSentTo,
            message: "There are no subscribers for the token: " + tokenAddress + "."
        }
    }


    // // for each subscriber of a token, alert them by their desired notification
    // // service (email or telegram) if their price targets are reached.
    for (let i = 0; i < subscribers.length; i++) {
        
        const subscriber = subscribers[i]

        const clientInfo = await User.findOne({googleId:subscriber})

        const {shouldAlert, error, message } = shouldAlertUser(tokenAddress, price, clientInfo)
        
        if (shouldAlert) {
            
            if ( clientInfo.notifyBy.email ) {
                notifyByEmail(clientInfo, tokenAlertObj, price)
                alertsSentTo.push({name: subscriber, by: "email"})
            }
            if ( clientInfo.notifyBy.telegram ) {
                notifyByTelegram(clientInfo, tokenAlertObj, price)
                alertsSentTo.push({name: subscriber, by: "telegram"})
            }

        } else {
            alertsNotSentTo.push(subscriber)
        }
    }

    return {
        error: false,
        alertsSentTo,
        alertsNotSentTo,
        message: "sendPriceToAllUsers() Complete."
    }
}