import React from "react";
import "./App.css";
import { Editor } from "@monaco-editor/react";
// Binds the shared Yjs document with the Monaco Editor
import { MonacoBinding } from "y-monaco";
import { useRef, useMemo, useState, useEffect } from "react";
// Core library for real-time collaborative editing
import * as Y from "yjs";
// Connects the frontend Yjs document with the backend through Socket.IO
import { SocketIOProvider } from "y-socket.io";

const App = () => {

  // Stores the Monaco editor instance after it is mounted
  const editorRef = useRef(null);

  // Read username from URL (example: ?username=Rahul)
  // This prevents asking for the username again after refreshing
  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });

  // Stores the list of currently connected users
  const [users, setUsers] = useState([]);

  // Create a shared Yjs document only once
  // This document stores the editor data shared by every user
  const ydoc = useMemo(() => new Y.Doc(), []);

  // Create a shared text object named "monaco"
  // Every user's editor will read and write to this shared text
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  // Called once when Monaco Editor is ready
  const handleMount = (editor) => {
    // Save the editor instance for later use
    editorRef.current = editor;
    // Connect the shared Yjs text with Monaco Editor
    // After this, typing by any user automatically updates everyone's editor
    new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
    );
  };

  // Runs when the Join button is clicked
  const handleJoin = (e) => {
    e.preventDefault();

    // Save username in React state
    setUsername(e.target.username.value);

    // Store username in the URL
    // So refreshing the page doesn't ask for the username again
    window.history.pushState({}, "", "?username=" + e.target.username.value);
  };

  // Runs whenever username changes
  useEffect(() => {

    // Wait until both username and editor are available
    if (username && editorRef.current) {

      // Connect this client to the collaboration server
      const provider = new SocketIOProvider(
        "/", // Backend server
        "monaco",                // Shared room/document name
        ydoc,                    // Shared Yjs document
        { autoConnect: true },   // Connect immediately
      );

      // Tell other users who this client is
      provider.awareness.setLocalStateField("user", { username });

      // Get all currently connected users
      const states = Array.from(provider.awareness.getStates().values());
      console.log(states);

      // Extract usernames and store them in state
      setUsers(
        states
          .filter((state) => state.user && state.user.username)
          .map((state) => state.user),
      );

      // Runs whenever someone joins or leaves the room
      provider.awareness.on("change", () => {
        // Get the latest list of connected users
        const states = Array.from(provider.awareness.getStates().values());
        // Update sidebar user list
        setUsers(
          states
            .filter((state) => state.user && state.user.username)
            .map((state) => state.user),
        );
      });

      // Before closing or refreshing the page,
      // remove this user from the online users list
      function handleBeforeUnload() {
        provider.awareness.setLocalStateField("user", null);
      }

      window.addEventListener("beforeunload", handleBeforeUnload);

      // Cleanup when component unmounts
      return () => {
        provider.disconnect();
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [username]);

  // If username is not available, show the Join screen
  if (!username) {
    return (
      <main className="h-screen w-full bg-gray-950 flex gap-4 items-center justify-center">
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter your username"
            className="p-2 rounded-lg bg-gray-800 text-white"
            name="username"
          />
          <button className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold">
            Join
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-4">

      {/* Sidebar showing all connected users */}
      <aside className="h-full w-1/4 bg-amber-50 rounded-lg">

        <h2 className="text-2xl font-bold p-4 border-b border-gray-300">
          Users
        </h2>

        {/* Display usernames */}
        {users.map((user) => (
          <div key={user.username} className="p-4 border-b">
            {user.username}
          </div>
        ))}

      </aside>

      {/* Shared Monaco code editor */}
      <section className="w-3/4 bg-neutral-800 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// some comment"
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>

    </main>
  );
};

export default App;