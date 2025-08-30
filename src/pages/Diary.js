// src/pages/Diary.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../auth";
import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from "firebase/firestore";
import "./Diary.css";

export default function Diary() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("journal");
  const [journalEntry, setJournalEntry] = useState("");
  const [intentions, setIntentions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("Self-Care");
  const [gratitudeAnswers, setGratitudeAnswers] = useState({
    smallJoy: "",
    thankfulPerson: "",
    positiveMoment: ""
  });
  const [journalEntries, setJournalEntries] = useState([]);
  const [showGratitudeForm, setShowGratitudeForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data from Firebase on component mount
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Load journal entries
    const entriesQuery = query(
      collection(db, "diaryEntries"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc")
    );
    
    const unsubscribeEntries = onSnapshot(entriesQuery, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJournalEntries(entries);
    });

    // Load intentions
    const intentionsQuery = query(
      collection(db, "intentions"),
      where("userId", "==", user.uid),
      where("date", "==", new Date().toDateString())
    );
    
    const unsubscribeIntentions = onSnapshot(intentionsQuery, (snapshot) => {
      if (snapshot.empty) {
        // Create default intentions for today if none exist
        createDefaultIntentions();
      } else {
        const intentions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setIntentions(intentions);
      }
    });

    // Load tasks
    const tasksQuery = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid),
      where("date", "==", new Date().toDateString())
    );
    
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      if (snapshot.empty) {
        // Create default tasks for today if none exist
        createDefaultTasks();
      } else {
        const tasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTasks(tasks);
      }
    });

    setLoading(false);

    // Cleanup listeners
    return () => {
      unsubscribeEntries();
      unsubscribeIntentions();
      unsubscribeTasks();
    };
  }, [user]);

  const createDefaultIntentions = async () => {
    const defaultIntentions = [
      { text: "Be kind to myself", completed: false },
      { text: "Take a mindful break", completed: false },
      { text: "Practice gratitude", completed: false }
    ];

    for (const intention of defaultIntentions) {
      await addDoc(collection(db, "intentions"), {
        ...intention,
        userId: user.uid,
        date: new Date().toDateString(),
        timestamp: serverTimestamp()
      });
    }
  };

  const createDefaultTasks = async () => {
    const defaultTasks = [
      { text: "Morning meditation", category: "Self-Care", completed: false },
      { text: "Complete work project", category: "Work", completed: false },
      { text: "Do laundry", category: "Chores", completed: false }
    ];

    for (const task of defaultTasks) {
      await addDoc(collection(db, "tasks"), {
        ...task,
        userId: user.uid,
        date: new Date().toDateString(),
        timestamp: serverTimestamp()
      });
    }
  };

  const saveJournalEntry = async () => {
    if (journalEntry.trim()) {
      try {
        await addDoc(collection(db, "diaryEntries"), {
          content: journalEntry,
          userId: user.uid,
          date: new Date().toDateString(),
          timestamp: serverTimestamp(),
          type: "freeform"
        });
        setJournalEntry("");
      } catch (error) {
        console.error("Error saving journal entry:", error);
        alert("Failed to save entry. Please try again.");
      }
    }
  };

  const saveGratitudeEntry = async () => {
    if (gratitudeAnswers.smallJoy && gratitudeAnswers.thankfulPerson && gratitudeAnswers.positiveMoment) {
      try {
        await addDoc(collection(db, "diaryEntries"), {
          content: `Gratitude Journal:\n1. Small joy: ${gratitudeAnswers.smallJoy}\n2. Thankful person: ${gratitudeAnswers.thankfulPerson}\n3. Positive moment: ${gratitudeAnswers.positiveMoment}`,
          userId: user.uid,
          date: new Date().toDateString(),
          timestamp: serverTimestamp(),
          type: "gratitude"
        });
        setGratitudeAnswers({ smallJoy: "", thankfulPerson: "", positiveMoment: "" });
        setShowGratitudeForm(false);
      } catch (error) {
        console.error("Error saving gratitude entry:", error);
        alert("Failed to save entry. Please try again.");
      }
    }
  };

  const toggleIntention = async (id) => {
    try {
      const intentionRef = doc(db, "intentions", id);
      const intention = intentions.find(i => i.id === id);
      await updateDoc(intentionRef, {
        completed: !intention.completed
      });
    } catch (error) {
      console.error("Error updating intention:", error);
      alert("Failed to update intention. Please try again.");
    }
  };

  const addIntention = async () => {
    const text = prompt("Enter your intention:");
    if (text) {
      try {
        await addDoc(collection(db, "intentions"), {
          text,
          completed: false,
          userId: user.uid,
          date: new Date().toDateString(),
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error("Error adding intention:", error);
        alert("Failed to add intention. Please try again.");
      }
    }
  };

  const addTask = async () => {
    if (newTask.trim()) {
      try {
        await addDoc(collection(db, "tasks"), {
          text: newTask,
          category: newTaskCategory,
          completed: false,
          userId: user.uid,
          date: new Date().toDateString(),
          timestamp: serverTimestamp()
        });
        setNewTask("");
      } catch (error) {
        console.error("Error adding task:", error);
        alert("Failed to add task. Please try again.");
      }
    }
  };

  const toggleTask = async (id) => {
    try {
      const taskRef = doc(db, "tasks", id);
      const task = tasks.find(t => t.id === id);
      await updateDoc(taskRef, {
        completed: !task.completed
      });
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Please try again.");
    }
  };

  const deleteTask = async (id) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task. Please try again.");
    }
  };

  const resetDailyItems = async () => {
    try {
      // Reset intentions
      for (const intention of intentions) {
        await updateDoc(doc(db, "intentions", intention.id), {
          completed: false
        });
      }
      
      // Reset tasks
      for (const task of tasks) {
        await updateDoc(doc(db, "tasks", task.id), {
          completed: false
        });
      }
    } catch (error) {
      console.error("Error resetting daily items:", error);
      alert("Failed to reset daily items. Please try again.");
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="diary-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your diary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="diary-container">
      <div className="diary-header">
        <h1>My Diary</h1>
        <p className="current-date">{getCurrentDate()}</p>
      </div>

      <div className="diary-tabs">
        <button 
          className={`tab-button ${activeTab === "journal" ? "active" : ""}`}
          onClick={() => setActiveTab("journal")}
        >
          📝 Journal
        </button>
        <button 
          className={`tab-button ${activeTab === "intentions" ? "active" : ""}`}
          onClick={() => setActiveTab("intentions")}
        >
          ✨ Intentions
        </button>
        <button 
          className={`tab-button ${activeTab === "tasks" ? "active" : ""}`}
          onClick={() => setActiveTab("tasks")}
        >
          ✅ Tasks
        </button>
        <button 
          className={`tab-button ${activeTab === "prompts" ? "active" : ""}`}
          onClick={() => setActiveTab("prompts")}
        >
          🎯 Prompts
        </button>
      </div>

      {/* Journal Tab */}
      {activeTab === "journal" && (
        <div className="tab-content">
          <div className="journal-section">
            <h3>Today's Thoughts</h3>
            <textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder="Write your thoughts, feelings, and experiences here..."
              rows={8}
              className="journal-textarea"
            />
            <button onClick={saveJournalEntry} className="save-button">
              Save Entry
            </button>
          </div>

          <div className="entries-section">
            <h3>Previous Entries</h3>
            {journalEntries.length === 0 ? (
              <p className="no-entries">No entries yet. Start writing your first diary entry!</p>
            ) : (
              <div className="entries-list">
                {journalEntries.map(entry => (
                  <div key={entry.id} className={`entry-card ${entry.type}`}>
                    <div className="entry-header">
                      <span className="entry-date">{entry.date}</span>
                      <span className="entry-type">{entry.type === "gratitude" ? "🙏 Gratitude" : "📝 Journal"}</span>
                    </div>
                    <div className="entry-content">{entry.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Intentions Tab */}
      {activeTab === "intentions" && (
        <div className="tab-content">
          <div className="intentions-section">
            <h3>Daily Intentions</h3>
            <p className="section-description">
              Set positive, wellness-focused goals for today. Check them off as you complete them.
            </p>
            
            <div className="intentions-list">
              {intentions.map(intention => (
                <div key={intention.id} className="intention-item">
                  <input
                    type="checkbox"
                    checked={intention.completed}
                    onChange={() => toggleIntention(intention.id)}
                    id={`intention-${intention.id}`}
                  />
                  <label 
                    htmlFor={`intention-${intention.id}`}
                    className={intention.completed ? "completed" : ""}
                  >
                    {intention.text}
                  </label>
                </div>
              ))}
            </div>

            <button onClick={addIntention} className="add-button">
              + Add Intention
            </button>
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <div className="tab-content">
          <div className="tasks-section">
            <h3>Daily Tasks</h3>
            
            <div className="add-task-form">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a new task..."
                className="task-input"
              />
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className="category-select"
              >
                <option value="Self-Care">Self-Care</option>
                <option value="Work">Work</option>
                <option value="Chores">Chores</option>
                <option value="Health">Health</option>
                <option value="Learning">Learning</option>
              </select>
              <button onClick={addTask} className="add-button">
                Add Task
              </button>
            </div>

            <div className="tasks-list">
              {tasks.map(task => (
                <div key={task.id} className={`task-item ${task.category.toLowerCase().replace(' ', '-')}`}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    id={`task-${task.id}`}
                  />
                  <label 
                    htmlFor={`task-${task.id}`}
                    className={task.completed ? "completed" : ""}
                  >
                    {task.text}
                  </label>
                  <span className="task-category">{task.category}</span>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="delete-button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button onClick={resetDailyItems} className="reset-button">
              Reset Daily Items
            </button>
          </div>
        </div>
      )}

      {/* Prompts Tab */}
      {activeTab === "prompts" && (
        <div className="tab-content">
          <div className="prompts-section">
            <h3>Guided Journal Prompts</h3>
            <p className="section-description">
              Use these structured templates to guide your writing when you need inspiration.
            </p>

            <div className="prompt-templates">
              <div className="prompt-card">
                <h4>🙏 Gratitude Journal</h4>
                <p>Reflect on the positive aspects of your day</p>
                <button 
                  onClick={() => setShowGratitudeForm(true)}
                  className="use-template-button"
                >
                  Use This Template
                </button>
              </div>
            </div>

            {showGratitudeForm && (
              <div className="gratitude-form">
                <h4>Gratitude Journal</h4>
                <div className="form-group">
                  <label>1. What is one small thing you enjoyed today?</label>
                  <input
                    type="text"
                    value={gratitudeAnswers.smallJoy}
                    onChange={(e) => setGratitudeAnswers({...gratitudeAnswers, smallJoy: e.target.value})}
                    placeholder="e.g., the smell of coffee, a warm shower..."
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>2. Name a person you are thankful for:</label>
                  <input
                    type="text"
                    value={gratitudeAnswers.thankfulPerson}
                    onChange={(e) => setGratitudeAnswers({...gratitudeAnswers, thankfulPerson: e.target.value})}
                    placeholder="e.g., my friend Sarah, my mom..."
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>3. Describe a positive moment from today:</label>
                  <textarea
                    value={gratitudeAnswers.positiveMoment}
                    onChange={(e) => setGratitudeAnswers({...gratitudeAnswers, positiveMoment: e.target.value})}
                    placeholder="Describe a moment that made you smile or feel good..."
                    rows={3}
                    className="form-textarea"
                  />
                </div>
                <div className="form-actions">
                  <button onClick={saveGratitudeEntry} className="save-button">
                    Save Gratitude Entry
                  </button>
                  <button onClick={() => setShowGratitudeForm(false)} className="cancel-button">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
