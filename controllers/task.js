import Task from '../models/Task.js';
import createError from '../utils/createError.js';

export const createTask = async (req, res, next) => {
  try {
    const { title, completed, priority, dueDate ,reminderDate } = req.body;

    if (!title) return res.status(400).json({ message: 'Title is required' });
  

    const newTask = new Task({
      title,
      completed: completed || false,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      user: req.user.id,
      reminderDate
    });

    const savedTask = await newTask.save();
    return res.status(201).json(savedTask);
  } catch (err) {
    return next(err);
  }
};


export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId).exec();
    if (!task) return next(createError({ status: 404, message: 'Task not found' }));
    if (task.user.toString() !== req.user.id) return next(createError({ status: 401, message: "It's not your todo." }));

    const updatedTask = await Task.findByIdAndUpdate(req.params.taskId, {
      title: req.body.title,
      completed: req.body.completed,
    }, { new: true });
    return res.status(200).json(updatedTask);
  } catch (err) {
    return next(err);
  }
};

export const getAllTasks = async (req, res, next) => {
  try {
    const { priority, status, sortBy, order } = req.query;

    let filter = {};
    if (priority) filter.priority = priority;
    if (status) filter.status = status;

    let sort = {};
    if (sortBy) sort[sortBy] = order === "desc" ? -1 : 1;

    const tasks = await Task.find(filter).sort(sort);

    return res.status(200).json(tasks);
  } catch (err) {
    return next(err);
  }
};


export const getCurrentUserTasks = async (req, res, next) => {
  try {
    const { completed, priority, dueBefore, dueAfter, search } = req.query;

    let filters = { user: req.user.id };

    if (completed !== undefined) {
      filters.completed = completed === 'true';
    }

    if (priority) {
      filters.priority = priority;
    }

    if (dueBefore || dueAfter) {
      filters.dueDate = {};
      if (dueBefore) filters.dueDate.$lte = new Date(dueBefore);
      if (dueAfter) filters.dueDate.$gte = new Date(dueAfter);
    }

    if (search) {
      filters.title = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(filters).sort({ dueDate: 1, createdAt: -1 });
    return res.status(200).json(tasks);
  } catch (err) {
    return next(err);
  }
};



export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (task.user === req.user.id) {
      return next(createError({ status: 401, message: "It's not your todo." }));
    }
    await Task.findByIdAndDelete(req.params.taskId);
    return res.json('Task Deleted Successfully');
  } catch (err) {
    return next(err);
  }
};

export const deleteAllTasks = async (req, res, next) => {
  try {
    await Task.deleteMany({ user: req.user.id });
    return res.json('All Todo Deleted Successfully');
  } catch (err) {
    return next(err);
  }
};
