import mongoose, { Schema, Document } from 'mongoose'

export interface IWeatherCache extends Document {
  location: string
  tempC: number
  weatherCode: number
  fetchedAt: Date
}

const weatherCacheSchema = new Schema({
  location: { type: String, required: true, unique: true },
  tempC: { type: Number, required: true },
  weatherCode: { type: Number, required: true },
  fetchedAt: { type: Date, required: true },
})

const WeatherCache =
  mongoose.models.weather_cache || mongoose.model<IWeatherCache>('weather_cache', weatherCacheSchema)

export default WeatherCache
