"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface JobEntry {
  id: string
  date: string
  task: string
  hours: number
  unitsCompleted: number
  notes: string
  changeOrders: number
}

const TASKS = ["Subrough", "Water", "Drainage", "Fire & Nail", "Tubs", "Gas", "Heaters", "Water Main", "Finishs"]

export default function JobDailiesTracker() {
  const [entries, setEntries] = useState<JobEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string>("")
  const [formData, setFormData] = useState({
    date: "",
    task: "",
    hours: "",
    units: "",
    notes: "",
    changeOrders: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEntries = localStorage.getItem("jobDailiesEntries")
      if (savedEntries) {
        try {
          const parsedEntries = JSON.parse(savedEntries)
          // Sort by date
          parsedEntries.sort((a: JobEntry, b: JobEntry) => new Date(a.date).getTime() - new Date(b.date).getTime())
          setEntries(parsedEntries)
        } catch (error) {
          console.error("Error parsing saved entries:", error)
        }
      }
    }
    setLoading(false)
  }, [])

  const saveToLocalStorage = (newEntries: JobEntry[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("jobDailiesEntries", JSON.stringify(newEntries))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const newEntry = {
      date: formData.date,
      task: formData.task,
      hours: formData.hours ? Number.parseFloat(formData.hours) : 0,
      unitsCompleted: formData.units ? Number.parseFloat(formData.units) : 0,
      notes: formData.notes,
      changeOrders: formData.changeOrders ? Number.parseFloat(formData.changeOrders) : 0,
    }

    try {
      let updatedEntries: JobEntry[]

      if (editingId) {
        updatedEntries = entries.map((entry) => (entry.id === editingId ? { ...newEntry, id: editingId } : entry))
        setEditingId("")
      } else {
        const newEntryWithId = {
          ...newEntry,
          id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
        }
        updatedEntries = [...entries, newEntryWithId]
      }

      // Sort by date
      updatedEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setEntries(updatedEntries)
      saveToLocalStorage(updatedEntries)

      // Reset form
      setFormData({
        date: "",
        task: "",
        hours: "",
        units: "",
        notes: "",
        changeOrders: "",
      })
    } catch (error) {
      console.error("Error adding/updating entry:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id: string) => {
    const entry = entries.find((e) => e.id === id)
    if (entry) {
      setFormData({
        date: entry.date,
        task: entry.task,
        hours: entry.hours.toString(),
        units: entry.unitsCompleted.toString(),
        notes: entry.notes,
        changeOrders: entry.changeOrders.toString(),
      })
      setEditingId(id)
    }
  }

  const handleDelete = (id: string) => {
    const updatedEntries = entries.filter((entry) => entry.id !== id)
    setEntries(updatedEntries)
    saveToLocalStorage(updatedEntries)
  }

  const exportToCSV = () => {
    const headers = ["Date", "Task", "Hours", "Units Completed", "Notes", "Change Orders"]
    const csvContent = [
      headers.join(","),
      ...entries.map((entry) =>
        [
          entry.date,
          entry.task,
          entry.hours,
          entry.unitsCompleted,
          `"${entry.notes.replace(/"/g, '""')}"`, // Escape quotes in notes
          entry.changeOrders,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `job-dailies-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dailies Tracker</h1>
          <p className="text-gray-600 mb-4">Enter daily job details.</p>

          {loading && <div className="text-center text-gray-500 mb-4">Loading...</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                />
              </div>

              <div>
                <label htmlFor="task" className="block text-sm font-medium text-gray-700">
                  Task
                </label>
                <select
                  id="task"
                  required
                  value={formData.task}
                  onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                >
                  <option value="">Select a Task</option>
                  {TASKS.map((task) => (
                    <option key={task} value={task}>
                      {task}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="hours" className="block text-sm font-medium text-gray-700">
                  Hours
                </label>
                <input
                  type="number"
                  id="hours"
                  required
                  step="0.1"
                  min="0"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                />
              </div>

              <div>
                <label htmlFor="units" className="block text-sm font-medium text-gray-700">
                  Units Completed
                </label>
                <input
                  type="number"
                  id="units"
                  required
                  step="1"
                  min="0"
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                />
              </div>

              <div>
                <label htmlFor="changeOrders" className="block text-sm font-medium text-gray-700">
                  Change Orders (Hours)
                </label>
                <input
                  type="number"
                  id="changeOrders"
                  step="0.1"
                  min="0"
                  value={formData.changeOrders}
                  onChange={(e) => setFormData({ ...formData, changeOrders: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                />
              </div>

              <div className="lg:col-span-1">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={1}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <button
                type="button"
                onClick={exportToCSV}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Export as CSV
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {editingId ? "Update Entry" : "Add Entry"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change Orders
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.task}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {isNaN(entry.hours) ? 0 : entry.hours}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {isNaN(entry.unitsCompleted) ? 0 : entry.unitsCompleted}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{entry.notes}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {isNaN(entry.changeOrders) ? 0 : entry.changeOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(entry.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDelete(entry.id)} className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
