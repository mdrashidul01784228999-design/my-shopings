"use client";

import { useState } from "react";

export default function DocumentManager() {
  const [isInsertOpen, setIsInsertOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  // Insert API Call
  const handleInsert = async () => {
    await fetch("http://localhost:8000/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    alert("✅ Document Inserted");
    setIsInsertOpen(false);
    setTitle("");
    setContent("");
  };

  // Search API Call
  const handleSearch = async () => {
    const res = await fetch("http://localhost:8000/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    setResults(data);
  };

  return (
    <div className="p-6">
      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => setIsInsertOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          ➕ Insert Document
        </button>
        <button
          onClick={() => setIsSearchOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          🔍 Search
        </button>
      </div>

      {/* Insert Modal */}
      {isInsertOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Insert Document</h2>
            <input
              type="text"
              placeholder="Title"
              className="border p-2 w-full mb-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Content"
              className="border p-2 w-full mb-2"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsInsertOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleInsert}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[500px]">
            <h2 className="text-xl font-bold mb-4">Search Documents</h2>
            <input
              type="text"
              placeholder="বাংলা বা English লিখুন..."
              className="border p-2 w-full mb-2"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex justify-end space-x-2 mb-4">
              <button
                onClick={() => setIsSearchOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Search
              </button>
            </div>

            {/* Results */}
            <ul className="max-h-64 overflow-y-auto">
              {results.map((r: any) => (
                <li key={r.id} className="p-2 border-b">
                  <h3 className="font-bold">{r.title}</h3>
                  <p>{r.content}</p>
                </li>
              ))}
              {results.length === 0 && (
                <p className="text-gray-500">No results found</p>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
