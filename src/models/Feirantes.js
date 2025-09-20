import mongoose from 'mongoose';

const FeirantesSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    descricao: String,
    slogan: String,
    telefone: String,
    email: String,
    ativo: Boolean
});

const Feirante = mongoose.model('Feirantes', FeirantesSchema, 'feirantes');

export default Feirante;