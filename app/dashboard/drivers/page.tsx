"use client"

import { useState } from "react"
import { Bus, User, LogOut, Phone, Mail, Car } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DashboardLayout from '@/components/DashboardLayout'




export default function DriversPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [driversList, setDriversList] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicle: '',
    status: 'available',
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "on-route":
        return "bg-blue-100 text-blue-800"
      case "off-duty":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddDriver = () => {
    if (formData.name && formData.email && formData.phone && formData.vehicle) {
      setDriversList([...driversList, { ...formData, id: String(Date.now()) }])
      setFormData({ name: '', email: '', phone: '', vehicle: '', status: 'available' })
      setShowAddForm(false)
    } else {
      alert('Please fill out all fields')
    }
  }

  return (
    <DashboardLayout
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
      onSettingsClick={() => { setMenuOpen(false); }}
      onProfileClick={() => { setMenuOpen(false); }}
      onHelpClick={() => { setMenuOpen(false); }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Drivers</h1>
          <Button onClick={() => setShowAddForm(true)}>Add Driver</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {driversList.map((driver) => (
            <Card key={driver.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {driver.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{driver.name}</CardTitle>
                  <Badge className={`mt-1 ${getStatusColor(driver.status)}`}>{driver.status.replace("-", " ")}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{driver.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{driver.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Car className="h-4 w-4" />
                  <span>{driver.vehicle}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Driver Modal */}
      {showAddForm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowAddForm(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 w-96 max-w-[90vw] p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Add New Driver</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 font-semibold block mb-2">NAME</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Enter driver name"
                  value={formData.name}
                  onChange={e => handleFormChange('name', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 font-semibold block mb-2">EMAIL</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Enter email address"
                  type="email"
                  value={formData.email}
                  onChange={e => handleFormChange('email', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 font-semibold block mb-2">PHONE</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={e => handleFormChange('phone', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 font-semibold block mb-2">VEHICLE</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Enter vehicle info (e.g., Van #101)"
                  value={formData.vehicle}
                  onChange={e => handleFormChange('vehicle', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 font-semibold block mb-2">STATUS</label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={formData.status}
                  onChange={e => handleFormChange('status', e.target.value)}
                >
                  <option value="available">Available</option>
                  <option value="on-route">On Route</option>
                  <option value="off-duty">Off Duty</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDriver}
                className="flex-1 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Add Driver
              </button>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
