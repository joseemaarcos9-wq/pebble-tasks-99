import Task from '../models/Task.js';

// Criar nova tarefa
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, tags } = req.body;
    
    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      tags,
      createdBy: req.user?.id
    });

    await task.save();
    
    res.status(201).json({
      success: true,
      message: 'Tarefa criada com sucesso',
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erro ao criar tarefa',
      error: error.message
    });
  }
};

// Listar todas as tarefas
export const getTasks = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (req.user?.id) filter.createdBy = req.user.id;

    const tasks = await Task.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar tarefas',
      error: error.message
    });
  }
};

// Buscar tarefa por ID
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('createdBy', 'name email');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar tarefa',
      error: error.message
    });
  }
};

// Atualizar tarefa
export const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;
    
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, dueDate, tags },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tarefa atualizada com sucesso',
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erro ao atualizar tarefa',
      error: error.message
    });
  }
};

// Deletar tarefa
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tarefa deletada com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar tarefa',
      error: error.message
    });
  }
};