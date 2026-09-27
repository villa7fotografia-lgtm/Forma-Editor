export interface SampleFile {
  name: string;
  type: string;
  content: string;
  imageUrl?: string;
}

export interface SamplePair {
  id: string;
  title: string;
  description: string;
  category: 'Fotografia & Estúdio' | 'Financeiro' | 'Orçamento' | 'Estoque' | 'Contratos & Jurídico';
  fileA: SampleFile;
  fileB: SampleFile;
}

export const SAMPLE_PAIRS: SamplePair[] = [
  {
    id: 'photo-shoot-selection',
    title: 'Ensaio Fotográfico: Metadados RAW vs Seleção Final do Cliente',
    description: 'Comparativo de metadados EXIF (ISO, Obturador, Abertura, Lente), classificações de estrelas e comentários entre a sessão bruta e a seleção aprovada.',
    category: 'Fotografia & Estúdio',
    fileA: {
      name: 'Sessao_Bruta_RAW_Villa7_Studio.csv',
      type: 'text/csv',
      content: `Arquivo_RAW,Camera,Lente,Focal_mm,Abertura,Obturador,ISO,Balanço_Brancos,Classificacao_Estrelas,Status
DSC_0012.NEF,Nikon Z8,NIKKOR Z 85mm f/1.2 S,85,f/1.2,1/1000s,ISO 100,5600K,3,Bruta
DSC_0013.NEF,Nikon Z8,NIKKOR Z 85mm f/1.2 S,85,f/1.2,1/1000s,ISO 100,5600K,1,Descarte
DSC_0014.NEF,Nikon Z8,NIKKOR Z 85mm f/1.2 S,85,f/1.4,1/1250s,ISO 100,5600K,4,Bruta
DSC_0015.NEF,Nikon Z8,NIKKOR Z 50mm f/1.2 S,50,f/1.8,1/800s,ISO 200,5400K,5,Destaque
DSC_0016.NEF,Nikon Z8,NIKKOR Z 50mm f/1.2 S,50,f/1.8,1/800s,ISO 200,5400K,2,Bruta
DSC_0017.NEF,Nikon Z8,NIKKOR Z 35mm f/1.8 S,35,f/2.8,1/500s,ISO 400,5200K,5,Destaque`
    },
    fileB: {
      name: 'Selecao_Aprovada_Cliente_Villa7.csv',
      type: 'text/csv',
      content: `Arquivo_RAW,Cliente_Aprovou,Tratamento_Solicitado,Preset_Lightroom,Tamanho_Impressao,Status_Edicao
DSC_0012.NEF,Sim,Suavizar Pele e Aquecer Tom,Villa7 Golden Warm,30x40 cm,Pendente
DSC_0014.NEF,Sim,Remover Elementos de Fundo,Villa7 Editorial Clean,40x60 cm,Pendente
DSC_0015.NEF,Sim,Preto e Branco Dramático,Villa7 B&W Noir,60x90 cm (Quadros),Em Andamento
DSC_0017.NEF,Sim,Ajuste de Luz e Nitidez,Villa7 Natural Portrait,20x30 cm,Concluido`
    }
  },
  {
    id: 'photo-presets-comparison',
    title: 'Edição Lightroom: Presets de Cor A (Warm) vs Presets B (Cool Editorial)',
    description: 'Comparação técnica de valores HSL, curvas de tons e temperatura de cor aplicadas nos catálogos LR.',
    category: 'Fotografia & Estúdio',
    fileA: {
      name: 'Catalogo_Preset_GoldenWarm_LR.csv',
      type: 'text/csv',
      content: `Parametro,Valor_Warm,Categoria
Temperatura_Kelvin,+12 (5800K),Básico
Colorido_Tint,+4,Básico
Exposição_EV,+0.35,Básico
Contraste,+15,Básico
Realces_Highlights,-35,Básico
Sombras_Shadows,+25,Básico
Brancos_Whites,+10,Básico
Pretos_Blacks,-15,Básico
Textura,+8,Básico
Clareza_Clarity,+12,Básico
Desembaçar_Dehaze,+5,Básico
Vibração,+18,Básico
Saturação,-5,Básico
HSL_Laranja_Saturacao,+12,HSL
HSL_Amarelo_Luminancia,-8,HSL
Nitidez_Amount,45,Detalhe
Reducao_Ruido,15,Detalhe`
    },
    fileB: {
      name: 'Catalogo_Preset_CoolEditorial_LR.csv',
      type: 'text/csv',
      content: `Parametro,Valor_Editorial,Categoria
Temperatura_Kelvin,-8 (4800K),Básico
Colorido_Tint,-2,Básico
Exposição_EV,+0.10,Básico
Contraste,+28,Básico
Realces_Highlights,-50,Básico
Sombras_Shadows,+10,Básico
Brancos_Whites,+18,Básico
Pretos_Blacks,-22,Básico
Textura,+15,Básico
Clareza_Clarity,+5,Básico
Desembaçar_Dehaze,+12,Básico
Vibração,+5,Básico
Saturação,-12,Básico
HSL_Laranja_Saturacao,-5,HSL
HSL_Amarelo_Luminancia,+5,HSL
Nitidez_Amount,60,Detalhe
Reducao_Ruido,8,Detalhe`
    }
  },
  {
    id: 'financial-q1-q2',
    title: 'DRE Financeiro do Estúdio: Trimestre 1 vs Trimestre 2',
    description: 'Comparativo de receitas de ensaios, custos de equipamentos, software Adobe e margens.',
    category: 'Financeiro',
    fileA: {
      name: 'DRE_Financeiro_Q1_2026.csv',
      type: 'text/csv',
      content: `Categoria,Subcategoria,Janeiro,Fevereiro,Marco,Total_Q1
Receitas,Ensaios Fotográficos (B2C),125000,132000,140000,397000
Receitas,Fotografia Corporativa (B2B),85000,88000,92000,265000
Receitas,Venda de Albuns e Quadros,32000,28000,45000,105000
Custos Operacionais,Assinaturas Adobe Creative Cloud,1450,1450,1450,4350
Custos Operacionais,Manutenção de Câmeras e Lentes,6200,1200,2200,9600
Despesas,Assistentes e Editores,25000,25000,28000,78000
Despesas,Marketing e Redes Sociais,12000,15000,18000,45000`
    },
    fileB: {
      name: 'DRE_Financeiro_Q2_2026.csv',
      type: 'text/csv',
      content: `Categoria,Subcategoria,Abril,Maio,Junho,Total_Q2
Receitas,Ensaios Fotográficos (B2C),148000,155000,162000,465000
Receitas,Fotografia Corporativa (B2B),96000,102000,108000,306000
Receitas,Venda de Albuns e Quadros,38000,41000,50000,129000
Custos Operacionais,Assinaturas Adobe Creative Cloud,1450,1450,1450,4350
Custos Operacionais,Manutenção de Câmeras e Lentes,2100,1800,3500,7400
Despesas,Assistentes e Editores,30000,30000,32000,92000
Despesas,Marketing e Redes Sociais,20000,22000,25000,67000`
    }
  }
];
