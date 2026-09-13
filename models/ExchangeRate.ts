import mongoose, { Schema, Document } from 'mongoose'

export interface IExchangeRate extends Document {
  base: string
  rates: Record<string, number>
  fetchedAt: Date
}

const exchangeRateSchema = new Schema({
  base: { type: String, required: true, unique: true },
  rates: { type: Schema.Types.Mixed, required: true },
  fetchedAt: { type: Date, required: true },
})

const ExchangeRate =
  mongoose.models.exchange_rate || mongoose.model<IExchangeRate>('exchange_rate', exchangeRateSchema)

export default ExchangeRate
