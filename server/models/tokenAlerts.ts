import mongoose from 'mongoose'
import { Document, Schema } from 'mongoose'

export interface TokenAlertInterface extends Document {
  tokenSymbol: string,
  tokenName:string,
  // subscribers: mongoose.Schema.Types.ObjectId[]
  subscribers: string[],
  tokenAddress: string,
}

const tokenAlertSchema = new Schema({
  tokenSymbol: {
    type: String,
    required: true
  },
  tokenAddress: {
    type: String,
    required: true
  },
  tokenName: {
    type: String,
    required: true
  },
  subscribers: [
    {
      type: String,
      ref: 'User'
    }
  ]
})

export const TokenAlerts = mongoose.model<TokenAlertInterface>('TokenAlerts', tokenAlertSchema);