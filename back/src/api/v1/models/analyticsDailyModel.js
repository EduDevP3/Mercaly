import { Schema, model } from 'mongoose';

const analyticsDailySchema = new Schema({
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true,
  },
  date: {
    type: String, // Formato YYYY-MM-DD
    required: true,
    index: true,
  },
  visits: {
    type: Number,
    default: 0,
    min: 0,
  },
  productViews: {
    type: Number,
    default: 0,
    min: 0,
  },
  addToCart: {
    type: Number,
    default: 0,
    min: 0,
  },
  whatsappClicks: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
  versionKey: false,
});

analyticsDailySchema.index({ storeId: 1, date: 1 }, { unique: true });

export const AnalyticsDaily = model('AnalyticsDaily', analyticsDailySchema);
export default AnalyticsDaily;
