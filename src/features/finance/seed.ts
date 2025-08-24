import { v4 as uuidv4 } from 'uuid';
import { format, addDays, subDays, addMonths } from 'date-fns';
import { Account, Category, Transaction, Recurrence, Budget } from './types';

export const createSeedData = () => {
  const now = new Date();
  const currentMonth = format(now, 'yyyy-MM');

  // Contas
  const carteira: Account = {
    id: uuidv4(),
    nome: 'Carteira',
    tipo: 'carteira',
    saldoInicial: 200,
    moeda: 'BRL',
    cor: '#10b981',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const banco: Account = {
    id: uuidv4(),
    nome: 'Banco Inter',
    tipo: 'banco',
    saldoInicial: 3500,
    moeda: 'BRL',
    cor: '#3b82f6',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const cartao: Account = {
    id: uuidv4(),
    nome: 'Cartão XPTO',
    tipo: 'cartao',
    saldoInicial: 0,
    moeda: 'BRL',
    cor: '#ef4444',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const accounts = [carteira, banco, cartao];

  // Categorias
  const salario: Category = {
    id: uuidv4(),
    nome: 'Salário',
    tipo: 'receita',
    createdAt: new Date()
  };

  const reembolsos: Category = {
    id: uuidv4(),
    nome: 'Reembolsos',
    tipo: 'receita',
    createdAt: new Date()
  };

  const moradia: Category = {
    id: uuidv4(),
    nome: 'Moradia',
    tipo: 'despesa',
    createdAt: new Date()
  };

  const aluguel: Category = {
    id: uuidv4(),
    nome: 'Aluguel',
    tipo: 'despesa',
    parentId: moradia.id,
    createdAt: new Date()
  };

  const alimentacao: Category = {
    id: uuidv4(),
    nome: 'Alimentação',
    tipo: 'despesa',
    createdAt: new Date()
  };

  const transporte: Category = {
    id: uuidv4(),
    nome: 'Transporte',
    tipo: 'despesa',
    createdAt: new Date()
  };

  const lazer: Category = {
    id: uuidv4(),
    nome: 'Lazer',
    tipo: 'despesa',
    createdAt: new Date()
  };

  const saude: Category = {
    id: uuidv4(),
    nome: 'Saúde',
    tipo: 'despesa',
    createdAt: new Date()
  };

  const categories = [salario, reembolsos, moradia, aluguel, alimentacao, transporte, lazer, saude];

  // Transações do mês atual
  const transactions: Transaction[] = [
    // Salário
    {
      id: uuidv4(),
      data: format(new Date(now.getFullYear(), now.getMonth(), 5), 'yyyy-MM-dd'),
      contaId: banco.id,
      valor: 5000,
      tipo: 'receita',
      categoriaId: salario.id,
      descricao: 'Salário mensal',
      tags: 'trabalho,renda',
      status: 'compensada',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Aluguel (atrasado)
    {
      id: uuidv4(),
      data: format(subDays(now, 5), 'yyyy-MM-dd'),
      contaId: banco.id,
      valor: -1200,
      tipo: 'despesa',
      categoriaId: aluguel.id,
      descricao: 'Aluguel apartamento',
      tags: 'moradia,fixo',
      status: 'pendente',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Mercado
    {
      id: uuidv4(),
      data: format(subDays(now, 2), 'yyyy-MM-dd'),
      contaId: cartao.id,
      valor: -230.50,
      tipo: 'despesa',
      categoriaId: alimentacao.id,
      descricao: 'Supermercado Extra',
      tags: 'alimentação,mercado',
      status: 'compensada',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Uber
    {
      id: uuidv4(),
      data: format(subDays(now, 1), 'yyyy-MM-dd'),
      contaId: cartao.id,
      valor: -25.50,
      tipo: 'despesa',
      categoriaId: transporte.id,
      descricao: 'Uber',
      tags: 'transporte,uber',
      status: 'pendente',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Cinema (hoje)
    {
      id: uuidv4(),
      data: format(now, 'yyyy-MM-dd'),
      contaId: carteira.id,
      valor: -35.00,
      tipo: 'despesa',
      categoriaId: lazer.id,
      descricao: 'Cinema Cinesystem',
      tags: 'lazer,cinema',
      status: 'pendente',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Farmácia (amanhã)
    {
      id: uuidv4(),
      data: format(addDays(now, 1), 'yyyy-MM-dd'),
      contaId: cartao.id,
      valor: -45.80,
      tipo: 'despesa',
      categoriaId: saude.id,
      descricao: 'Farmácia Droga Raia',
      tags: 'saúde,farmácia',
      status: 'pendente',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Transferência carteira -> banco
    {
      id: uuidv4(),
      data: format(subDays(now, 3), 'yyyy-MM-dd'),
      contaId: carteira.id,
      valor: -100,
      tipo: 'transferencia',
      descricao: 'Transferência para banco',
      tags: '',
      status: 'compensada',
      meta: { linkId: 'transfer-1', direction: 'origem' },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    {
      id: uuidv4(),
      data: format(subDays(now, 3), 'yyyy-MM-dd'),
      contaId: banco.id,
      valor: 100,
      tipo: 'transferencia',
      descricao: 'Transferência da carteira',
      tags: '',
      status: 'compensada',
      meta: { linkId: 'transfer-1', direction: 'destino' },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Mais transações variadas
    {
      id: uuidv4(),
      data: format(subDays(now, 10), 'yyyy-MM-dd'),
      contaId: cartao.id,
      valor: -89.90,
      tipo: 'despesa',
      categoriaId: alimentacao.id,
      descricao: 'iFood',
      tags: 'alimentação,delivery',
      status: 'compensada',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    {
      id: uuidv4(),
      data: format(subDays(now, 8), 'yyyy-MM-dd'),
      contaId: banco.id,
      valor: -120.00,
      tipo: 'despesa',
      categoriaId: transporte.id,
      descricao: 'Combustível posto Shell',
      tags: 'transporte,combustível',
      status: 'compensada',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    {
      id: uuidv4(),
      data: format(subDays(now, 6), 'yyyy-MM-dd'),
      contaId: cartao.id,
      valor: -78.50,
      tipo: 'despesa',
      categoriaId: lazer.id,
      descricao: 'Spotify Premium',
      tags: 'lazer,streaming,música',
      status: 'compensada',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    {
      id: uuidv4(),
      data: format(addDays(now, 3), 'yyyy-MM-dd'),
      contaId: banco.id,
      valor: -55.00,
      tipo: 'despesa',
      categoriaId: saude.id,
      descricao: 'Consulta médica',
      tags: 'saúde,consulta',
      status: 'pendente',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    {
      id: uuidv4(),
      data: format(addDays(now, 5), 'yyyy-MM-dd'),
      contaId: cartao.id,
      valor: -67.40,
      tipo: 'despesa',
      categoriaId: alimentacao.id,
      descricao: 'Restaurante japonês',
      tags: 'alimentação,restaurante,japonês',
      status: 'pendente',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Recorrências
  const recurrences: Recurrence[] = [
    {
      id: uuidv4(),
      tipo: 'receita',
      frequencia: 'mensal',
      diaBase: 5,
      proximaOcorrencia: format(new Date(now.getFullYear(), now.getMonth() + 1, 5), 'yyyy-MM-dd'),
      contaId: banco.id,
      valor: 5000,
      categoriaId: salario.id,
      descricao: 'Salário mensal',
      tags: 'trabalho,renda',
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    {
      id: uuidv4(),
      tipo: 'despesa',
      frequencia: 'mensal',
      diaBase: 5,
      proximaOcorrencia: format(new Date(now.getFullYear(), now.getMonth() + 1, 5), 'yyyy-MM-dd'),
      contaId: banco.id,
      valor: -1200,
      categoriaId: aluguel.id,
      descricao: 'Aluguel apartamento',
      tags: 'moradia,fixo',
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    {
      id: uuidv4(),
      tipo: 'despesa',
      frequencia: 'mensal',
      diaBase: 10,
      proximaOcorrencia: format(new Date(now.getFullYear(), now.getMonth() + 1, 10), 'yyyy-MM-dd'),
      contaId: banco.id,
      valor: -89.90,
      categoriaId: undefined, // Internet seria uma nova categoria
      descricao: 'Internet Vivo Fibra',
      tags: 'casa,internet,fixo',
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Orçamentos do mês atual
  const budgets: Budget[] = [
    {
      id: uuidv4(),
      categoriaId: alimentacao.id,
      valorPlanejado: 1200,
      mesAno: currentMonth,
      alertThresholdPct: 80,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    {
      id: uuidv4(),
      categoriaId: lazer.id,
      valorPlanejado: 400,
      mesAno: currentMonth,
      alertThresholdPct: 85,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    {
      id: uuidv4(),
      categoriaId: transporte.id,
      valorPlanejado: 600,
      mesAno: currentMonth,
      alertThresholdPct: 75,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  return {
    accounts,
    categories,
    transactions,
    recurrences,
    budgets
  };
};