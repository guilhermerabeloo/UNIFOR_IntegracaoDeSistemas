import { jest } from '@jest/globals';

await jest.unstable_mockModule('../src/models/Produtos.js', () => ({
    default: { find: jest.fn() }
}));

await jest.unstable_mockModule('../src/models/FeiranteProduto.js', () => ({
    default: { find: jest.fn() }
}));

await jest.unstable_mockModule('../src/models/Feirantes.js', () => ({
    default: { find: jest.fn() }
}));

await jest.unstable_mockModule('../src/models/FeiraFeirante.js', () => ({
    default: { find: jest.fn() }
}));

await jest.unstable_mockModule('../src/models/Feiras.js', () => ({
    default: { find: jest.fn(), findById: jest.fn() }
}));

// importar os "módulos" (serão as versões mockadas)
const { default: Produto } = await import('../src/models/Produtos.js');
const { default: Feirante_Produto } = await import('../src/models/FeiranteProduto.js');
const { default: Feirante } = await import('../src/models/Feirantes.js');
const { default: Feira_Feirante } = await import('../src/models/FeiraFeirante.js');
const { default: Feira } = await import('../src/models/Feiras.js');
const { default: RelatoriosControllers } = await import('../src/controllers/RelatoriosControllers.js');

describe('RelatoriosControllers - unit tests', () => {
    let req;
    let res;

    beforeEach(() => {
        jest.clearAllMocks();

        res = {
        status: jest.fn(() => res),
        json: jest.fn(() => res)
        };

        req = { query: {}, params: {} };
    });

    test('buscaProdutos: retorna 400 quando parâmetro "produto" ausente', async () => {
        await RelatoriosControllers.buscaProdutos(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Parâmetro 'produto' é obrigatório" });
    });

    test('buscaProdutos: retorna feirante com produtos e feiras quando há correspondência', async () => {
        req.query.produto = 'Pastel';

        const produtoMock = { _id: 'p1', descricao: 'Pastel', tag: 'Alimentícios' };

        Produto.find.mockImplementation(() => ({
            lean: () => Promise.resolve([produtoMock])
        }));

        Feirante_Produto.find.mockImplementation(() => ({
            lean: () => Promise.resolve([{ feirante_id: 'f1', produto_id: 'p1' }])
        }));

        Feirante.find.mockImplementation(() => ({
            lean: () => Promise.resolve([{ _id: 'f1', descricao: 'Pastel do Irineu' }])
        }));

        Feira_Feirante.find.mockImplementation(() => ({
            lean: () => Promise.resolve([{ feira_id: 'fe1', feirante_id: 'f1' }])
        }));

        Feira.find.mockImplementation(() => ({
            lean: () => Promise.resolve([{ _id: 'fe1', descricao: 'Feira X' }])
        }));

        await RelatoriosControllers.buscaProdutos(req, res);

        expect(Produto.find).toHaveBeenCalled();
        expect(Feirante_Produto.find).toHaveBeenCalled();
        expect(Feirante.find).toHaveBeenCalled();
        expect(Feira.find).toHaveBeenCalled();

        expect(res.json).toHaveBeenCalled();
        const result = res.json.mock.calls[0][0];
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(1);

        const item = result[0];
        expect(item.feirante.descricao).toBe('Pastel do Irineu');
        expect(Array.isArray(item.produtos)).toBe(true);
        expect(item.produtos[0].descricao).toBe('Pastel');
        expect(Array.isArray(item.feiras)).toBe(true);
        expect(item.feiras[0].descricao).toBe('Feira X');
    });

    test('feiraOverview: retorna 404 quando feira não encontrada', async () => {
        Feira.findById.mockImplementation(() => ({
            lean: () => Promise.resolve(null)
        }));

        req.params.id = 'naoexiste';

        await RelatoriosControllers.feiraOverview(req, res);

        expect(Feira.findById).toHaveBeenCalledWith('naoexiste');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Feira não encontrada' });
    });
});
