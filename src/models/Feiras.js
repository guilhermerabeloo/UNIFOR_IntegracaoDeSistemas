import mongoose from 'mongoose';

const FeirasSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  descricao: String,
  endereco: String,
  latitude: Number,
  longitude: Number,
  dias_funcionamento: [String],
  horarios_funcionamento: String
});

const Feira = mongoose.model('Feira', FeirasSchema, 'feiras');

export default Feira;