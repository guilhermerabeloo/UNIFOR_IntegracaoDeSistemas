import mongoose from 'mongoose';

const FeiranteProdutoSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    feirante_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Feirantes', required: true },
    produto_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Produtos', required: true },
});

const Feirante_Produto = mongoose.model('Feirante_Produto', FeiranteProdutoSchema, 'feirante_produto');

export default Feirante_Produto;