import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Form, useNavigate } from "@remix-run/react";
import { todosApi } from "~/utils/api";
import { isAuthenticated, removeToken } from "~/utils/auth";
import { useButton } from "@react-aria/button";
import { useTextField } from "@react-aria/textfield";
import { useCheckbox } from "@react-aria/checkbox";
import { useToggleState } from "@react-stately/toggle";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  isEditing?: boolean;
}

export default function TodosRoute() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const logoutButtonRef = useRef(null);
  const searchInputRef = useRef(null);
  const newTodoInputRef = useRef(null);

  const handleLogout = useCallback(() => {
    removeToken();
    navigate('/auth/login');
  }, [navigate]);

  const { buttonProps: logoutButtonProps } = useButton({
    onPress: handleLogout
  }, logoutButtonRef);

  const { inputProps: searchInputProps } = useTextField({
    label: 'Search todos',
    value: searchQuery,
    onChange: setSearchQuery
  }, searchInputRef);

  const { inputProps: newTodoInputProps } = useTextField({
    label: 'New todo',
    value: newTodoTitle,
    onChange: setNewTodoTitle,
    onKeyDown: (e) => {
      if (e.key === 'Enter') {
        handleCreateTodo(e as any);
      }
    }
  }, newTodoInputRef);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/auth/login');
      return;
    }

    fetchTodos();
  }, [navigate]);

  const fetchTodos = async () => {
    try {
      const fetchedTodos = await todosApi.getAll();
      setTodos(fetchedTodos);
    } catch (error) {
      console.error('Failed to fetch todos', error);
    }
  };

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      const newTodo = await todosApi.create(newTodoTitle);
      setTodos(prevTodos => [...prevTodos, newTodo]);
      setNewTodoTitle('');
    } catch (error) {
      console.error('Failed to create todo', error);
    }
  };

  const handleUpdateTodo = async (todoId: string, updates: Partial<Todo>) => {
    try {
      const updatedTodo = await todosApi.update(todoId, updates);
      setTodos(prevTodos => 
        prevTodos.map(t => t.id === todoId ? updatedTodo : t)
      );
    } catch (error) {
      console.error('Failed to update todo', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await todosApi.delete(id);
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Failed to delete todo', error);
    }
  };

  const filteredAndSortedTodos = useMemo(() => {
    let result = todos.filter(todo => 
      todo.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return result.sort((a, b) => a.title.localeCompare(b.title));
  }, [todos, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="bg-white shadow-lg rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">My Todos</h1>
            <button 
              ref={logoutButtonRef}
              {...logoutButtonProps}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              ref={searchInputRef}
              {...searchInputProps}
              placeholder="Search todos..."
              className="w-full px-4 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 bg-white"
            />
          </div>

          {/* Create Todo Form */}
          <Form onSubmit={handleCreateTodo} className="mb-8">
            <div className="flex">
              <input
                ref={newTodoInputRef}
                {...newTodoInputProps}
                placeholder="What needs to be done?"
                className="flex-grow px-4 py-3 text-lg border-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 bg-white"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-3 text-lg rounded-r-md hover:bg-blue-600 transition"
              >
                Add Todo
              </button>
            </div>
          </Form>

          {/* Todo List */}
          {filteredAndSortedTodos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xl text-gray-500">
                {searchQuery
                  ? `No todos found matching "${searchQuery}"`
                  : "No todos yet. Start adding some!"}
              </p>
            </div>
          ) : (
            <TodoList 
              todos={filteredAndSortedTodos} 
              onUpdate={handleUpdateTodo} 
              onDelete={handleDeleteTodo} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface TodoListProps {
  todos: Todo[];
  onUpdate: (todoId: string, updates: Partial<Todo>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function TodoList({ todos, onUpdate, onDelete }: TodoListProps) {
  return (
    <ul className="divide-y divide-gray-200">
      {todos.map(todo => (
        <TodoItem 
          key={todo.id} 
          todo={todo} 
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

interface TodoItemProps {
  todo: Todo;
  onUpdate: (todoId: string, updates: Partial<Todo>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function TodoItem({ 
  todo, 
  onUpdate, 
  onDelete 
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef(null);

  const state = useToggleState({
    isSelected: todo.completed,
    onChange: () => onUpdate(todo.id, { completed: !todo.completed })
  });

  const { inputProps: checkboxProps } = useCheckbox(
    {
      'aria-label': `Mark ${todo.title} as ${todo.completed ? 'incomplete' : 'complete'}`,
      isSelected: state.isSelected,
      onChange: state.setSelected
    },
    state,
    checkboxRef
  );

  const { inputProps: editInputProps } = useTextField({
    label: 'Edit todo',
    value: editTitle,
    onChange: setEditTitle
  }, editInputRef);

  const handleSave = async () => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle && trimmedTitle !== todo.title) {
      await onUpdate(todo.id, { title: trimmedTitle });
      setIsEditing(false);
    } else if (!trimmedTitle) {
      setEditTitle(todo.title); // Restaura o título original se estiver vazio
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditTitle(todo.title);
      setIsEditing(false);
    }
  };

  return (
    <li className="py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-grow">
          <input
            ref={checkboxRef}
            {...checkboxProps}
            type="checkbox"
            className="h-5 w-5 text-blue-500 rounded border-gray-300 focus:ring-blue-400"
          />
          {isEditing ? (
            <input
              ref={editInputRef}
              {...editInputProps}
              className="ml-3 flex-grow px-3 py-1 text-lg border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              autoFocus
            />
          ) : (
            <span 
              className={`ml-3 text-lg ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}
              onDoubleClick={() => setIsEditing(true)}
            >
              {todo.title}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-500 hover:text-blue-600 p-1"
          >
            Edit
          </button>
          {showDeleteConfirm ? (
            <>
              <span className="text-sm text-gray-500">Are you sure?</span>
              <button
                onClick={() => onDelete(todo.id)}
                className="text-red-500 hover:text-red-600 font-medium p-1"
              >
                Yes
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-500 hover:text-gray-600 p-1"
              >
                No
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-500 hover:text-red-600 p-1"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
