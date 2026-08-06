import React, { useState, useEffect } from 'react';
import {
  StickyNote,
  CheckSquare,
  Target,
  IndianRupee,
  Plus,
  Trash2,
  Edit3,
  X,
  Calendar,
  CheckCircle2,
  Circle,
  TrendingUp,
  Clock,
  AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '../../utils/api';
import { alertSuccess, alertError, alertConfirm } from '../../utils/alert';

const base_url = BASE_URL;

const NOTES_COLORS = ['#ffffff', '#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3', '#f3e8ff', '#fed7aa'];

const Productivity = () => {
  const [activeTab, setActiveTab] = useState('notes');
  const [loading, setLoading] = useState(true);

  const [notes, setNotes] = useState([]);
  const [todos, setTodos] = useState([]);
  const [goals, setGoals] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [summary, setSummary] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [noteForm, setNoteForm] = useState({ title: '', content: '', color: '#ffffff' });
  const [todoForm, setTodoForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  const [goalForm, setGoalForm] = useState({ title: '', description: '', targetDate: '', progress: 0, status: 'active' });
  const [incomeForm, setIncomeForm] = useState({ amount: '', category: 'General', note: '', date: new Date().toISOString().split('T')[0] });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAll = async () => {
    try {
      const [notesRes, todosRes, goalsRes, incomesRes, summaryRes] = await Promise.all([
        axios.get(`${base_url}/api/productivity/notes`, { headers }),
        axios.get(`${base_url}/api/productivity/todos`, { headers }),
        axios.get(`${base_url}/api/productivity/goals`, { headers }),
        axios.get(`${base_url}/api/productivity/incomes`, { headers }),
        axios.get(`${base_url}/api/productivity/summary`, { headers }),
      ]);
      setNotes(notesRes.data.notes);
      setTodos(todosRes.data.todos);
      setGoals(goalsRes.data.goals);
      setIncomes(incomesRes.data.incomes);
      setSummary(summaryRes.data.summary);
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  const openAddForm = () => {
    setEditingItem(null);
    resetForms();
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    if (activeTab === 'notes') setNoteForm({ title: item.title, content: item.content, color: item.color });
    if (activeTab === 'todos') setTodoForm({ title: item.title, description: item.description, priority: item.priority, dueDate: item.dueDate ? item.dueDate.split('T')[0] : '' });
    if (activeTab === 'goals') setGoalForm({ title: item.title, description: item.description, targetDate: item.targetDate ? item.targetDate.split('T')[0] : '', progress: item.progress, status: item.status });
    if (activeTab === 'incomes') setIncomeForm({ amount: item.amount, category: item.category, note: item.note, date: item.date ? item.date.split('T')[0] : '' });
    setShowForm(true);
  };

  const resetForms = () => {
    setNoteForm({ title: '', content: '', color: '#ffffff' });
    setTodoForm({ title: '', description: '', priority: 'medium', dueDate: '' });
    setGoalForm({ title: '', description: '', targetDate: '', progress: 0, status: 'active' });
    setIncomeForm({ amount: '', category: 'General', note: '', date: new Date().toISOString().split('T')[0] });
  };

  // ==================== NOTES ====================
  const handleSaveNote = async () => {
    try {
      if (editingItem) {
        const res = await axios.put(`${base_url}/api/productivity/notes/${editingItem._id}`, noteForm, { headers });
        setNotes(notes.map(n => n._id === editingItem._id ? res.data.note : n));
        alertSuccess('Note updated!');
      } else {
        const res = await axios.post(`${base_url}/api/productivity/notes`, noteForm, { headers });
        setNotes([res.data.note, ...notes]);
        alertSuccess('Note created!');
      }
      setShowForm(false);
      resetForms();
    } catch (error) {
      alertError('Failed', error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDeleteNote = async (id) => {
    const confirmed = await alertConfirm('Delete note?', 'This action cannot be undone.');
    if (!confirmed) return;
    try {
      await axios.delete(`${base_url}/api/productivity/notes/${id}`, { headers });
      setNotes(notes.filter(n => n._id !== id));
      alertSuccess('Note deleted!');
    } catch {
      alertError('Failed', 'Could not delete note');
    }
  };

  // ==================== TODOS ====================
  const handleSaveTodo = async () => {
    try {
      const payload = { ...todoForm, dueDate: todoForm.dueDate || null };
      if (editingItem) {
        const res = await axios.put(`${base_url}/api/productivity/todos/${editingItem._id}`, payload, { headers });
        setTodos(todos.map(t => t._id === editingItem._id ? res.data.todo : t));
        alertSuccess('Todo updated!');
      } else {
        const res = await axios.post(`${base_url}/api/productivity/todos`, payload, { headers });
        setTodos([res.data.todo, ...todos]);
        alertSuccess('Todo created!');
      }
      setShowForm(false);
      resetForms();
    } catch (error) {
      alertError('Failed', error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleToggleTodo = async (todo) => {
    try {
      const res = await axios.put(`${base_url}/api/productivity/todos/${todo._id}`, { completed: !todo.completed }, { headers });
      setTodos(todos.map(t => t._id === todo._id ? res.data.todo : t));
    } catch {
      alertError('Failed', 'Could not update todo');
    }
  };

  const handleDeleteTodo = async (id) => {
    const confirmed = await alertConfirm('Delete todo?', 'This action cannot be undone.');
    if (!confirmed) return;
    try {
      await axios.delete(`${base_url}/api/productivity/todos/${id}`, { headers });
      setTodos(todos.filter(t => t._id !== id));
      alertSuccess('Todo deleted!');
    } catch {
      alertError('Failed', 'Could not delete todo');
    }
  };

  // ==================== GOALS ====================
  const handleSaveGoal = async () => {
    try {
      const payload = { ...goalForm, targetDate: goalForm.targetDate || null };
      if (editingItem) {
        const res = await axios.put(`${base_url}/api/productivity/goals/${editingItem._id}`, payload, { headers });
        setGoals(goals.map(g => g._id === editingItem._id ? res.data.goal : g));
        alertSuccess('Goal updated!');
      } else {
        const res = await axios.post(`${base_url}/api/productivity/goals`, payload, { headers });
        setGoals([res.data.goal, ...goals]);
        alertSuccess('Goal created!');
      }
      setShowForm(false);
      resetForms();
    } catch (error) {
      alertError('Failed', error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDeleteGoal = async (id) => {
    const confirmed = await alertConfirm('Delete goal?', 'This action cannot be undone.');
    if (!confirmed) return;
    try {
      await axios.delete(`${base_url}/api/productivity/goals/${id}`, { headers });
      setGoals(goals.filter(g => g._id !== id));
      alertSuccess('Goal deleted!');
    } catch {
      alertError('Failed', 'Could not delete goal');
    }
  };

  // ==================== INCOME ====================
  const handleSaveIncome = async () => {
    try {
      if (!incomeForm.amount || Number(incomeForm.amount) <= 0) {
        return alertError('Invalid amount', 'Please enter a valid amount');
      }
      const payload = { ...incomeForm, amount: Number(incomeForm.amount) };
      if (editingItem) {
        await axios.delete(`${base_url}/api/productivity/incomes/${editingItem._id}`, { headers });
        const res = await axios.post(`${base_url}/api/productivity/incomes`, payload, { headers });
        setIncomes([res.data.income, ...incomes.filter(i => i._id !== editingItem._id)]);
        alertSuccess('Income updated!');
      } else {
        const res = await axios.post(`${base_url}/api/productivity/incomes`, payload, { headers });
        setIncomes([res.data.income, ...incomes]);
        alertSuccess('Income added!');
      }
      setShowForm(false);
      resetForms();
    } catch (error) {
      alertError('Failed', error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDeleteIncome = async (id) => {
    const confirmed = await alertConfirm('Delete entry?', 'This action cannot be undone.');
    if (!confirmed) return;
    try {
      await axios.delete(`${base_url}/api/productivity/incomes/${id}`, { headers });
      setIncomes(incomes.filter(i => i._id !== id));
      alertSuccess('Entry deleted!');
    } catch {
      alertError('Failed', 'Could not delete entry');
    }
  };

  // ==================== TAB CONFIG ====================
  const tabs = [
    { id: 'notes', label: 'Notes', icon: <StickyNote size={18} /> },
    { id: 'todos', label: 'Todos', icon: <CheckSquare size={18} /> },
    { id: 'goals', label: 'Goals', icon: <Target size={18} /> },
    { id: 'incomes', label: 'Income', icon: <IndianRupee size={18} /> },
  ];

  const priorityColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };

  const statusColors = {
    active: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    abandoned: 'bg-gray-100 text-gray-500',
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
        <p className="text-gray-600 font-medium">Loading Productivity...</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header + Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "Playfair Display, cursive" }}>
            Productivity
          </h1>
          <p className="text-gray-500 mt-1">Manage your notes, tasks, goals and income.</p>
        </div>
        <button
          onClick={openAddForm}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
        >
          <Plus size={20} />
          <span>Add {tabs.find(t => t.id === activeTab)?.label}</span>
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600"><StickyNote size={20} /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Notes</p>
              <p className="text-lg font-bold text-gray-900">{summary.totalNotes}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><CheckSquare size={20} /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Pending Todos</p>
              <p className="text-lg font-bold text-gray-900">{summary.pendingTodos}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Target size={20} /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Active Goals</p>
              <p className="text-lg font-bold text-gray-900">{summary.activeGoals}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg text-green-600"><TrendingUp size={20} /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Income</p>
              <p className="text-lg font-bold text-gray-900">{formatINR(summary.totalIncome)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 flex gap-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setShowForm(false); setEditingItem(null); resetForms(); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== NOTES TAB ==================== */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-400">
              <StickyNote size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No notes yet. Create one!</p>
            </div>
          ) : (
            notes.map(note => (
              <div
                key={note._id}
                className="rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
                style={{ backgroundColor: note.color }}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{note.title}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => openEditForm(note)} className="p-1.5 rounded-lg hover:bg-black/10 text-gray-500 hover:text-gray-700 transition-colors">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDeleteNote(note._id)} className="p-1.5 rounded-lg hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {note.content && <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{note.content}</p>}
                <p className="text-xs text-gray-400 mt-auto">{new Date(note.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* ==================== TODOS TAB ==================== */}
      {activeTab === 'todos' && (
        <div className="space-y-3">
          {todos.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <CheckSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No todos yet. Add one!</p>
            </div>
          ) : (
            todos.map(todo => (
              <div
                key={todo._id}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow ${
                  todo.completed ? 'opacity-60' : ''
                }`}
              >
                <button onClick={() => handleToggleTodo(todo)} className="flex-shrink-0">
                  {todo.completed
                    ? <CheckCircle2 size={24} className="text-green-500" />
                    : <Circle size={24} className="text-gray-300 hover:text-blue-500 transition-colors" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-gray-900 ${todo.completed ? 'line-through text-gray-400' : ''}`}>{todo.title}</p>
                  {todo.description && <p className="text-sm text-gray-500 mt-0.5 truncate">{todo.description}</p>}
                  {todo.dueDate && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${new Date(todo.dueDate) < new Date() && !todo.completed ? 'text-red-500' : 'text-gray-400'}`}>
                      <Calendar size={12} />
                      {new Date(todo.dueDate).toLocaleDateString()}
                      {new Date(todo.dueDate) < new Date() && !todo.completed && <AlertCircle size={12} />}
                    </p>
                  )}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priorityColors[todo.priority]}`}>
                  {todo.priority}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => openEditForm(todo)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDeleteTodo(todo._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ==================== GOALS TAB ==================== */}
      {activeTab === 'goals' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-400">
              <Target size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No goals yet. Set one!</p>
            </div>
          ) : (
            goals.map(goal => (
              <div key={goal._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg">{goal.title}</h3>
                    {goal.description && <p className="text-sm text-gray-500 mt-1">{goal.description}</p>}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => openEditForm(goal)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDeleteGoal(goal._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span className="font-bold">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[goal.status]}`}>
                    {goal.status}
                  </span>
                  {goal.targetDate && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={12} />
                      Target: {new Date(goal.targetDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ==================== INCOME TAB ==================== */}
      {activeTab === 'incomes' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {incomes.length > 0 && (
            <div className="p-5 border-b border-gray-100 bg-green-50">
              <p className="text-sm text-green-700 font-medium">Total Income</p>
              <p className="text-2xl font-bold text-green-800">{formatINR(incomes.reduce((sum, i) => sum + i.amount, 0))}</p>
            </div>
          )}
          {incomes.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <IndianRupee size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No income entries yet. Add one!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-400">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Note</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {incomes.map(income => (
                    <tr key={income._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(income.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">{income.category}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{income.note || '-'}</td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">{formatINR(income.amount)}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteIncome(income._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== FORM MODAL ==================== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingItem ? 'Edit' : 'Add'} {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <button onClick={() => { setShowForm(false); resetForms(); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* NOTES FORM */}
              {activeTab === 'notes' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={noteForm.title}
                      onChange={e => setNoteForm({ ...noteForm, title: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Note title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Content</label>
                    <textarea
                      value={noteForm.content}
                      onChange={e => setNoteForm({ ...noteForm, content: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Write something..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                    <div className="flex gap-2">
                      {NOTES_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setNoteForm({ ...noteForm, color: c })}
                          className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${noteForm.color === c ? 'border-blue-500 scale-110' : 'border-gray-200'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* TODOS FORM */}
              {activeTab === 'todos' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={todoForm.title}
                      onChange={e => setTodoForm({ ...todoForm, title: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="What needs to be done?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                    <textarea
                      value={todoForm.description}
                      onChange={e => setTodoForm({ ...todoForm, description: e.target.value })}
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Optional details"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                      <select
                        value={todoForm.priority}
                        onChange={e => setTodoForm({ ...todoForm, priority: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={todoForm.dueDate}
                        onChange={e => setTodoForm({ ...todoForm, dueDate: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* GOALS FORM */}
              {activeTab === 'goals' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={goalForm.title}
                      onChange={e => setGoalForm({ ...goalForm, title: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your goal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                    <textarea
                      value={goalForm.description}
                      onChange={e => setGoalForm({ ...goalForm, description: e.target.value })}
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Optional details"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Progress: {goalForm.progress}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goalForm.progress}
                      onChange={e => setGoalForm({ ...goalForm, progress: Number(e.target.value) })}
                      className="w-full accent-blue-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                      <select
                        value={goalForm.status}
                        onChange={e => setGoalForm({ ...goalForm, status: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="abandoned">Abandoned</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Target Date</label>
                      <input
                        type="date"
                        value={goalForm.targetDate}
                        onChange={e => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* INCOME FORM */}
              {activeTab === 'incomes' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (INR) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={incomeForm.amount}
                      onChange={e => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                      <select
                        value={incomeForm.category}
                        onChange={e => setIncomeForm({ ...incomeForm, category: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Salary">Salary</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Business">Business</option>
                        <option value="Investment">Investment</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={incomeForm.date}
                        onChange={e => setIncomeForm({ ...incomeForm, date: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Note</label>
                    <input
                      type="text"
                      value={incomeForm.note}
                      onChange={e => setIncomeForm({ ...incomeForm, note: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional note"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => { setShowForm(false); resetForms(); }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeTab === 'notes') handleSaveNote();
                  if (activeTab === 'todos') handleSaveTodo();
                  if (activeTab === 'goals') handleSaveGoal();
                  if (activeTab === 'incomes') handleSaveIncome();
                }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition-colors"
              >
                {editingItem ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productivity;
