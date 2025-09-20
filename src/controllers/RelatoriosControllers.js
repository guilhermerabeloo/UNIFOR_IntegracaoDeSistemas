import Feira from "../models/Feiras.js";
import Feirante from "../models/Feirantes.js";
import Produto from "../models/Produtos.js";
import Feira_Feirante from "../models/FeiraFeirante.js";
import Feirante_Produto from "../models/FeiranteProduto.js";
import { getWeather } from "../services/weatherService.js";

class RelatoriosControllers {
    static async buscarFeiras(req, res) {
        try {
            const feiras = await Feira.find();
            console.log("Buscando feiras...");
            
            res.json(feiras);
        } catch (error) {
            res.status(500).json({ error: "Erro buscar feiras" });
        }    
    }

    static async buscaProdutos(req, res) {
        try {
            const { produto } = req.query;
            if (!produto || produto.trim() === '') {
                return res.status(400).json({ error: "Parâmetro 'produto' é obrigatório" });
            }

            const prodRegex = new RegExp(produto, 'i');
            const produtosEncontrados = await Produto.find({
                $or: [{ descricao: prodRegex }, { tag: prodRegex }]
            }).lean();

            if (!produtosEncontrados || produtosEncontrados.length === 0) {
                return res.json([]); 
            }

            // buscando relacionamentos
            const matchedprodutoIds = produtosEncontrados.map(p => p._id);

            const feiranteProdutos = await Feirante_Produto.find({ produto_id: { $in: matchedprodutoIds } }).lean();
            if (!feiranteProdutos || feiranteProdutos.length === 0) return res.json([]);

            const feiranteIds = [...new Set(feiranteProdutos.map(e => String(e.feirante_id)))];

            const feirantes = await Feirante.find({ _id: { $in: feiranteIds } }).lean();

            const feira_feirantes = await Feira_Feirante.find({ feirante_id: { $in: feiranteIds } }).lean();
            const feiraIds = [...new Set(feira_feirantes.map(e => String(e.feira_id)))];
            const feiras = await Feira.find({ _id: { $in: feiraIds } }).lean();

            const feiranteMap = new Map(feirantes.map(f => [String(f._id), f]));
            const feiraMap = new Map(feiras.map(f => [String(f._id), f]));

            // produtos por feirante
            const produtosPorFeirante = {};
            for (const entry of feiranteProdutos) {
                const fid = String(entry.feirante_id);
                const pid = String(entry.produto_id);
                const produtoObj = produtosEncontrados.find(p => String(p._id) === pid);
                if (!produtoObj) continue;
                if (!produtosPorFeirante[fid]) produtosPorFeirante[fid] = [];
                produtosPorFeirante[fid].push(produtoObj);
            }

            // feiras por feirante
            const feirasPorFeirante = {};
            for (const entry of feira_feirantes) {
                const fid = String(entry.feirante_id);
                const fidFeira = String(entry.feira_id);
                const feiraObj = feiraMap.get(fidFeira);
                if (!feiraObj) continue;
                if (!feirasPorFeirante[fid]) feirasPorFeirante[fid] = [];
                feirasPorFeirante[fid].push(feiraObj);
            }

            // resposta
            const response = [];
            for (const feiranteId of feiranteIds) {
                const feirante = feiranteMap.get(feiranteId);
                if (!feirante) continue;

                const produtos = produtosPorFeirante[feiranteId] || [];
                const feirasList = feirasPorFeirante[feiranteId] || [];

                response.push({
                    feirante,
                    produtos,
                    feiras: feirasList
                });
            }

            return res.json(response);
        } catch (error) {
            console.error('searchprodutos error', error);
            return res.status(500).json({ error: 'Erro na busca de produtos' });
        }
    }
    
    static async feiraOverview(req, res) {
        try {
        const { id } = req.params;
        const feira = await Feira.findById(id).lean();
        if (!feira) return res.status(404).json({ error: 'Feira não encontrada' });

        const latRaw = feira.latitude;
        const lonRaw = feira.longitude;

        const latitude = (latRaw === '' || latRaw == null) ? null : Number(latRaw);
        const longitude = (lonRaw === '' || lonRaw == null) ? null : Number(lonRaw);

        const hasCoords = Number.isFinite(latitude) && Number.isFinite(longitude);

        let weather = null;
        if (hasCoords) {
            weather = await getWeather(latitude, longitude);
        } else {
            console.warn(`Feira ${id} sem coordenadas válidas. latRaw='${latRaw}' lonRaw='${lonRaw}'`);
        }

        const overview = {
            feira,
            weather,
            note: hasCoords
                ? (weather ? 'Dados de clima fornecidos pelo OpenWeather' : 'Clima indisponível')
                : 'Coordenadas indisponíveis'
        };

        return res.json(overview);

        } catch (error) {
            console.error('feiraOverview error', error);
            return res.status(500).json({ error: 'Erro ao montar overview da feira' });
        }
    }

}

export default RelatoriosControllers;