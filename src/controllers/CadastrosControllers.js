import Feira from "../models/Feiras.js";
import Feirante from "../models/Feirantes.js";
import { geocodeAddress } from "../services/nominatimService.js";

class CadastrosControllers {
    static async cadastrarFeira(req, res) {
        try {
            let { descricao, endereco, latitude, longitude  } = req.body;
            if ((!descricao || descricao.trim() === '') || (!endereco || endereco.trim() === '')) {
                return res.status(400).json({ error: "Descrição e endereço são obrigatórios" });
            }

            if ((latitude == null || longitude == null || latitude === '' || longitude === '') && endereco) {
                const coords = await geocodeAddress(endereco);
                if (coords) {
                    latitude = coords.latitude;
                    longitude = coords.longitude;
                }
            }
            
            const novaFeira = new Feira({
                ...req.body,
            });

            novaFeira.latitude = latitude;
            novaFeira.longitude = longitude;
            
            const feiraSalva = await novaFeira.save();
            res.status(200).json(feiraSalva);
        } catch (error) {
            res.status(500).json({ error: "Erro cadastrar feira", details: error.message });
        }   
    }

    static async cadastrarFeirante(req, res) {
        try {
            const novoFeirante = new Feirante(req.body);

            const feiranteSalvo = await novoFeirante.save();
            res.status(200).json(feiranteSalvo);
        } catch (error) {
            res.status(500).json({ error: "Erro cadastrar feirante" });
        }   
    }
}

export default CadastrosControllers;