import mongoose from 'mongoose';

const ProdutosSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  descricao: String,
  tag: String,
});

const Produto = mongoose.model('Produto', ProdutosSchema, 'produtos');

export default Produto;