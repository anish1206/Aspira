// src/pages/Diary.js
import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    deleteDoc,
    doc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Diary = () => {
    const [entry, setEntry] = useState("");
    const [entries, setEntries] = useState([]);
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("journal"); // journal, intentions, tasks, prompts
    const [intentions, setIntentions] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [taskCategory, setTaskCategory] = useState("Work");
    const [isGratitudeMode, setIsGratitudeMode] = useState(false);
    const [gratitudePrompts, setGratitudePrompts] = useState({
        highlight: "",
        person: "",
        lesson: ""
    });

    // Drawing state
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [ctx, setCtx] = useState(null);
    const [brushColor, setBrushColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(5);
    const [drawingMode, setDrawingMode] = useState("draw"); // draw, erase, text
    const [showTextInput, setShowTextInput] = useState(false);
    const [textInput, setTextInput] = useState("");
    const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;

        // Listen for journal entries
        const q = query(
            collection(db, "diary"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribeEntries = onSnapshot(q, (snapshot) => {
            setEntries(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });

        // Listen for intentions
        const qIntentions = query(
            collection(db, "intentions"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribeIntentions = onSnapshot(qIntentions, (snapshot) => {
            setIntentions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });

        // Listen for tasks
        const qTasks = query(
            collection(db, "tasks"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
            setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubscribeEntries();
            unsubscribeIntentions();
            unsubscribeTasks();
        };
    }, [user]);

    // Canvas initialization
    useEffect(() => {
        if (activeTab === "journal" && canvasRef.current && !isGratitudeMode) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            // Only set width/height if they haven't been set to avoid clearing on re-render
            if (canvas.width !== rect.width) {
                canvas.width = rect.width;
                canvas.height = 300;
            }

            const context = canvas.getContext("2d");
            context.lineCap = "round";
            context.lineJoin = "round";
            setCtx(context);
        }
    }, [activeTab, isGratitudeMode]);

    // Drawing Functions
    const getCoordinates = (e) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        let clientX, clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e) => {
        if (!ctx) return;
        if (drawingMode === "text") {
            const { x, y } = getCoordinates(e);
            setTextPosition({ x, y });
            setShowTextInput(true);
            return;
        }

        e.preventDefault(); // Prevent scrolling on touch
        const { x, y } = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing || !ctx || drawingMode === "text") return;
        e.preventDefault();
        const { x, y } = getCoordinates(e);

        if (drawingMode === "erase") {
            ctx.globalCompositeOperation = "destination-out";
            ctx.lineWidth = brushSize * 2;
        } else {
            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = brushColor;
            ctx.lineWidth = brushSize;
        }

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing && ctx) {
            ctx.closePath();
            setIsDrawing(false);
        }
    };

    const clearCanvas = () => {
        if (ctx && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const addTextToCanvas = () => {
        if (!ctx || !textInput) return;
        ctx.globalCompositeOperation = "source-over";
        ctx.font = `${brushSize * 3}px sans-serif`;
        ctx.fillStyle = brushColor;
        ctx.fillText(textInput, textPosition.x, textPosition.y);
        setTextInput("");
        setShowTextInput(false);
    };

    const isCanvasBlank = (canvas) => {
        const context = canvas.getContext('2d');
        const pixelBuffer = new Uint32Array(
            context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
        );
        return !pixelBuffer.some(color => color !== 0);
    };

    const saveEntry = async () => {
        if (!user) return;

        const hasText = entry.trim().length > 0;
        const hasDrawing = canvasRef.current && !isCanvasBlank(canvasRef.current);

        // Gratitude Mode
        if (isGratitudeMode) {
            if (!gratitudePrompts.highlight && !gratitudePrompts.person && !gratitudePrompts.lesson) {
                alert("Please fill in at least one gratitude prompt.");
                return;
            }
            try {
                await addDoc(collection(db, "diary"), {
                    userId: user.uid,
                    content: JSON.stringify(gratitudePrompts),
                    type: "gratitude",
                    createdAt: serverTimestamp(),
                });
                setGratitudePrompts({ highlight: "", person: "", lesson: "" });
                setIsGratitudeMode(false);
                alert("Gratitude entry saved!");
            } catch (error) {
                console.error("Error saving gratitude:", error);
                alert("Failed to save entry.");
            }
            return;
        }

        // Standard Mode
        if (!hasText && !hasDrawing) {
            alert("Please write something or draw before saving!");
            return;
        }

        let drawingDataUrl = null;
        if (hasDrawing) {
            drawingDataUrl = canvasRef.current.toDataURL();
        }

        try {
            await addDoc(collection(db, "diary"), {
                userId: user.uid,
                content: entry,
                drawing: drawingDataUrl,
                type: "journal",
                createdAt: serverTimestamp(),
            });
            setEntry("");
            clearCanvas();
            alert("Journal entry saved!");
        } catch (error) {
            console.error("Error saving entry:", error);
            alert("Failed to save entry.");
        }
    };

    const addIntention = async () => {
        const text = prompt("What is your intention for today?");
        if (!text || !user) return;
        try {
            await addDoc(collection(db, "intentions"), {
                userId: user.uid,
                text,
                completed: false,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error adding intention:", error);
        }
    };

    const toggleIntention = async (id) => {
        const intention = intentions.find(i => i.id === id);
        if (!intention) return;
        try {
            await updateDoc(doc(db, "intentions", id), {
                completed: !intention.completed
            });
        } catch (error) {
            console.error("Error toggling intention:", error);
        }
    };

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim() || !user) return;

        try {
            await addDoc(collection(db, "tasks"), {
                userId: user.uid,
                text: newTask,
                category: taskCategory,
                completed: false,
                createdAt: serverTimestamp(),
            });
            setNewTask("");
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const toggleTask = async (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        try {
            await updateDoc(doc(db, "tasks", id), {
                completed: !task.completed
            });
        } catch (error) {
            console.error("Error toggling task:", error);
        }
    };

    const deleteTask = async (id) => {
        try {
            await deleteDoc(doc(db, "tasks", id));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const resetDailyItems = async () => {
        // Optional: Implement logic to reset daily items
        alert("Reset daily items feature coming soon!");
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Please log in to access your diary.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-gray-900 to-green-900 rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10 text-center">
                        <h1 className="text-4xl font-bold mb-2">My Mindful Journal</h1>
                        <p className="text-primary-foreground/80 text-lg font-light">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {["journal", "intentions", "tasks", "prompts"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 capitalize ${activeTab === tab
                                ? "bg-primary text-primary-foreground shadow-lg scale-105"
                                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    {/* Journal Tab */}
                    {activeTab === "journal" && (
                        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-semibold text-foreground">Daily Reflection</h3>
                                <button
                                    onClick={() => setIsGratitudeMode(!isGratitudeMode)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isGratitudeMode
                                        ? "bg-green-100 text-green-700 border border-green-200"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        }`}
                                >
                                    {isGratitudeMode ? "✨ Gratitude Mode On" : "Switch to Gratitude"}
                                </button>
                            </div>

                            {isGratitudeMode ? (
                                <div className="bg-green-50/50 border border-green-100 rounded-xl p-6 space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-green-800">Highlight of the day</label>
                                        <input
                                            type="text"
                                            value={gratitudePrompts.highlight}
                                            onChange={(e) => setGratitudePrompts({ ...gratitudePrompts, highlight: e.target.value })}
                                            className="w-full p-3 rounded-lg border border-green-200 bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                            placeholder="What went well today?"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-green-800">Someone I appreciate</label>
                                        <input
                                            type="text"
                                            value={gratitudePrompts.person}
                                            onChange={(e) => setGratitudePrompts({ ...gratitudePrompts, person: e.target.value })}
                                            className="w-full p-3 rounded-lg border border-green-200 bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                            placeholder="Who made a difference?"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-green-800">A lesson learned</label>
                                        <textarea
                                            value={gratitudePrompts.lesson}
                                            onChange={(e) => setGratitudePrompts({ ...gratitudePrompts, lesson: e.target.value })}
                                            className="w-full p-3 rounded-lg border border-green-200 bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all min-h-[80px]"
                                            placeholder="What did today teach you?"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 mt-4">
                                        <button onClick={() => setIsGratitudeMode(false)} className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">Cancel</button>
                                        <button onClick={saveEntry} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md">Save Gratitude Entry</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <textarea
                                        value={entry}
                                        onChange={(e) => setEntry(e.target.value)}
                                        placeholder="Write your thoughts here..."
                                        className="w-full p-4 rounded-xl border border-input bg-muted/30 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[200px] resize-y text-base leading-relaxed"
                                    />

                                    {/* Drawing Tools */}
                                    <div className="bg-muted/30 rounded-xl p-4 border border-border">
                                        <div className="flex flex-wrap gap-4 mb-4 items-center">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setDrawingMode("draw")}
                                                    className={`p-2 rounded-lg transition-colors ${drawingMode === "draw" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                                                    title="Draw"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setDrawingMode("erase")}
                                                    className={`p-2 rounded-lg transition-colors ${drawingMode === "erase" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                                                    title="Erase"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setDrawingMode("text")}
                                                    className={`p-2 rounded-lg transition-colors ${drawingMode === "text" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                                                    title="Add Text"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="h-6 w-px bg-border mx-2"></div>

                                            <input
                                                type="color"
                                                value={brushColor}
                                                onChange={(e) => setBrushColor(e.target.value)}
                                                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                                            />

                                            <input
                                                type="range"
                                                min="1"
                                                max="20"
                                                value={brushSize}
                                                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                                className="w-32 accent-primary"
                                            />

                                            <div className="flex-1"></div>

                                            <button
                                                onClick={clearCanvas}
                                                className="px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                            >
                                                Clear
                                            </button>
                                        </div>

                                        <canvas
                                            ref={canvasRef}
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseLeave={stopDrawing}
                                            onTouchStart={startDrawing}
                                            onTouchMove={draw}
                                            onTouchEnd={stopDrawing}
                                            className="w-full bg-white rounded-xl shadow-sm border border-border cursor-crosshair touch-none"
                                        />

                                        <div className="mt-6 flex justify-end">
                                            <button
                                                onClick={saveEntry}
                                                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                                            >
                                                <span>Save Entry</span>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Intentions Tab */}
                    {activeTab === "intentions" && (
                        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-semibold text-foreground">Daily Intentions</h3>
                                <button onClick={addIntention} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                                    + Add Intention
                                </button>
                            </div>
                            <p className="text-muted-foreground mb-6">Set positive, wellness-focused goals for today.</p>

                            <div className="space-y-3">
                                {intentions.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8 italic">No intentions set yet.</p>
                                ) : (
                                    intentions.map(intention => (
                                        <div key={intention.id} className="flex items-center p-4 bg-muted/30 rounded-xl border border-transparent hover:border-border transition-all">
                                            <input
                                                type="checkbox"
                                                checked={intention.completed}
                                                onChange={() => toggleIntention(intention.id)}
                                                className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
                                            />
                                            <span className={`ml-3 flex-1 text-foreground ${intention.completed ? 'line-through text-muted-foreground' : ''}`}>
                                                {intention.text}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tasks Tab */}
                    {activeTab === "tasks" && (
                        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-2xl font-semibold text-foreground mb-6">Daily Tasks</h3>

                            <form onSubmit={addTask} className="flex flex-wrap gap-3 mb-8">
                                <input
                                    type="text"
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    placeholder="Add a new task..."
                                    className="flex-1 min-w-[200px] p-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                                <select
                                    value={taskCategory}
                                    onChange={(e) => setTaskCategory(e.target.value)}
                                    className="p-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    <option value="Work">Work</option>
                                    <option value="Self-Care">Self-Care</option>
                                    <option value="Health">Health</option>
                                    <option value="Chores">Chores</option>
                                    <option value="Learning">Learning</option>
                                </select>
                                <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity">
                                    Add Task
                                </button>
                            </form>

                            <div className="space-y-3">
                                {tasks.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8 italic">No tasks yet. Stay productive!</p>
                                ) : (
                                    tasks.map(task => (
                                        <div key={task.id} className="flex items-center p-4 bg-muted/30 rounded-xl border border-transparent hover:border-border transition-all group">
                                            <input
                                                type="checkbox"
                                                checked={task.completed}
                                                onChange={() => toggleTask(task.id)}
                                                className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
                                            />
                                            <span className={`ml-3 flex-1 text-foreground ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                                {task.text}
                                            </span>
                                            <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground mr-3">
                                                {task.category}
                                            </span>
                                            <button onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {tasks.length > 0 && (
                                <div className="mt-6 text-right">
                                    <button onClick={resetDailyItems} className="text-sm text-muted-foreground hover:text-foreground underline">
                                        Reset Daily Items
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Prompts Tab */}
                    {activeTab === "prompts" && (
                        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-2xl font-semibold text-foreground mb-6">Guided Journal Prompts</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                                    setActiveTab("journal");
                                    setIsGratitudeMode(true);
                                }}>
                                    <h4 className="font-semibold text-blue-900 mb-2">🙏 Gratitude Journal</h4>
                                    <p className="text-blue-700/80 text-sm">Reflect on the positive aspects of your day and practice thankfulness.</p>
                                </div>
                                <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                                    setActiveTab("journal");
                                    setEntry("Today I'm feeling...");
                                }}>
                                    <h4 className="font-semibold text-purple-900 mb-2">💭 Emotional Check-in</h4>
                                    <p className="text-purple-700/80 text-sm">How are you feeling right now? Explore your current emotions.</p>
                                </div>
                                <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                                    setActiveTab("journal");
                                    setEntry("One challenge I faced recently was...");
                                }}>
                                    <h4 className="font-semibold text-orange-900 mb-2">💪 Overcoming Challenges</h4>
                                    <p className="text-orange-700/80 text-sm">Write about a recent obstacle and how you handled it.</p>
                                </div>
                                <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                                    setActiveTab("journal");
                                    setEntry("My ideal peaceful moment looks like...");
                                }}>
                                    <h4 className="font-semibold text-green-900 mb-2">🌿 Peace & Calm</h4>
                                    <p className="text-green-700/80 text-sm">Describe a place or moment where you feel most at peace.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Entries List (Visible on Journal Tab) */}
                    {activeTab === "journal" && (
                        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
                            <h3 className="text-xl font-semibold text-foreground mb-6">Recent Entries</h3>
                            {entries.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
                                    <p>No entries yet. Start writing your story today.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {entries.map((entry) => (
                                        <div key={entry.id} className="group bg-muted/30 hover:bg-muted/50 rounded-xl p-5 transition-all border border-transparent hover:border-border">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <span className="text-sm font-medium text-muted-foreground">
                                                        {entry.createdAt?.toDate().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                                                    </span>
                                                    <span className={`ml-3 text-xs px-2 py-1 rounded-full ${entry.type === 'gratitude'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {entry.type === 'gratitude' ? 'Gratitude' : 'Journal'}
                                                    </span>
                                                </div>
                                            </div>

                                            {entry.type === 'gratitude' ? (
                                                <div className="space-y-2 text-sm">
                                                    {(() => {
                                                        try {
                                                            const content = JSON.parse(entry.content);
                                                            return (
                                                                <>
                                                                    <p><span className="font-medium text-foreground">Highlight:</span> <span className="text-muted-foreground">{content.highlight}</span></p>
                                                                    <p><span className="font-medium text-foreground">Appreciated:</span> <span className="text-muted-foreground">{content.person}</span></p>
                                                                    <p><span className="font-medium text-foreground">Lesson:</span> <span className="text-muted-foreground">{content.lesson}</span></p>
                                                                </>
                                                            );
                                                        } catch (e) {
                                                            return <p className="text-muted-foreground">{entry.content}</p>;
                                                        }
                                                    })()}
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                                                    {entry.drawing && (
                                                        <div className="mt-3 border border-border rounded-lg overflow-hidden bg-white inline-block">
                                                            <img src={entry.drawing} alt="Drawing" className="max-h-48 object-contain" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Text Input Modal for Canvas */}
            {showTextInput && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-card p-6 rounded-2xl shadow-2xl w-full max-w-md border border-border">
                        <h3 className="text-lg font-semibold mb-4">Add Text to Canvas</h3>
                        <input
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            className="w-full p-3 rounded-xl border border-input bg-background mb-4 focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="Enter text..."
                            autoFocus
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowTextInput(false)}
                                className="px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addTextToCanvas}
                                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                            >
                                Add Text
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Diary;