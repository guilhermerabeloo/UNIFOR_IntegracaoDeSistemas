import mongoose from 'mongoose';

const FeiraFeiranteSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    feira_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Feiras', required: true },
    feirante_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Feirantes', required: true },
});

const Feira_Feirante = mongoose.model('Feira_Feirante', FeiraFeiranteSchema, 'feira_feirante');

export default Feira_Feirante;