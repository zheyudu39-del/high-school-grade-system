import { useState, useEffect } from 'react'
import { 
  BookOpen, TrendingUp, Target, Plus, Trash2, Edit2, Save, X, 
  BarChart3, Award, Calendar, ChevronDown, ChevronUp 
} from 'lucide-react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts'

const SUBJECTS = [
  { id: 'chinese', name: '语文', fullScore: 150 },
  { id: 'math', name: '数学', fullScore: 150 },
  { id: 'english', name: '英语', fullScore: 150 },
  { id: 'physics', name: '物理', fullScore: 100 },
  { id: 'chemistry', name: '化学', fullScore: 100 },
  { id: 'biology', name: '生物', fullScore: 100 },
  { id: 'history', name: '历史', fullScore: 100 },
  { id: 'geography', name: '地理', fullScore: 100 },
  { id: 'politics', name: '政治', fullScore: 100 },
]

const EXAM_TYPES = ['月考', '期中', '期末', '模拟考', '周测', '其他']

const GRADES = ['高一', '高二', '高三']
const SEMESTERS = ['上学期', '下学期']

function App() {
  const [activeTab, setActiveTab] = useState('record')
  const [exams, setExams] = useState([])
  const [goals, setGoals] = useState({})
  const [showAddExam, setShowAddExam] = useState(false)
  const [editingExam, setEditingExam] = useState(null)
  const [newExam, setNewExam] = useState({
    name: '',
    type: '月考',
    grade: '高一',
    semester: '上学期',
    date: new Date().toISOString().split('T')[0],
    scores: {}
  })
  const [filterGrade, setFilterGrade] = useState('all')
  const [filterSemester, setFilterSemester] = useState('all')

  const initialExams = [
    {
      id: 1,
      name: '第一次段考',
      type: '月考',
      grade: '高一',
      semester: '上学期',
      date: '2025-10-10',
      scores: {
        chinese: '98',
        math: '94',
        english: '102.5',
        physics: '76',
        chemistry: '89',
        biology: '88',
        politics: '68',
        history: '63',
        geography: '75'
      }
    },
    {
      id: 2,
      name: '期中考试',
      type: '期中',
      grade: '高一',
      semester: '上学期',
      date: '2025-11-11',
      scores: {
        chinese: '87',
        math: '97',
        english: '100.5',
        physics: '77',
        chemistry: '48',
        biology: '70',
        politics: '98',
        history: '96',
        geography: '95'
      }
    }
  ]

  useEffect(() => {
    const savedExams = localStorage.getItem('grade-tracker-exams')
    const savedGoals = localStorage.getItem('grade-tracker-goals')
    if (savedExams) {
      const parsed = JSON.parse(savedExams)
      if (parsed.length > 0) {
        setExams(parsed)
      } else {
        setExams(initialExams)
      }
    } else {
      setExams(initialExams)
    }
    if (savedGoals) setGoals(JSON.parse(savedGoals))
  }, [])

  useEffect(() => {
    localStorage.setItem('grade-tracker-exams', JSON.stringify(exams))
  }, [exams])

  useEffect(() => {
    localStorage.setItem('grade-tracker-goals', JSON.stringify(goals))
  }, [goals])

  const handleAddExam = () => {
    if (!newExam.name.trim()) return
    const exam = {
      ...newExam,
      id: Date.now(),
      scores: { ...newExam.scores }
    }
    setExams([...exams, exam])
    setNewExam({
      name: '',
      type: '月考',
      grade: '高一',
      semester: '上学期',
      date: new Date().toISOString().split('T')[0],
      scores: {}
    })
    setShowAddExam(false)
  }

  const handleUpdateExam = () => {
    if (!editingExam.name.trim()) return
    setExams(exams.map(e => e.id === editingExam.id ? editingExam : e))
    setEditingExam(null)
  }

  const handleDeleteExam = (id) => {
    if (confirm('确定删除这次考试记录吗？')) {
      setExams(exams.filter(e => e.id !== id))
    }
  }

  const calculateTotal = (scores) => {
    return Object.values(scores).reduce((sum, score) => sum + (parseFloat(score) || 0), 0)
  }

  const calculateAverage = (subjectId) => {
    const validScores = exams
      .map(e => parseFloat(e.scores[subjectId]))
      .filter(s => !isNaN(s) && s > 0)
    if (validScores.length === 0) return 0
    return (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
  }

  const getHighestScore = (subjectId) => {
    const validScores = exams
      .map(e => parseFloat(e.scores[subjectId]))
      .filter(s => !isNaN(s) && s > 0)
    return validScores.length > 0 ? Math.max(...validScores) : 0
  }

  const getLowestScore = (subjectId) => {
    const validScores = exams
      .map(e => parseFloat(e.scores[subjectId]))
      .filter(s => !isNaN(s) && s > 0)
    return validScores.length > 0 ? Math.min(...validScores) : 0
  }

  const getLatestExam = () => {
    if (exams.length === 0) return null
    return [...exams].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
  }

  const getTrendData = () => {
    return [...exams]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(exam => ({
        name: exam.name,
        总分: calculateTotal(exam.scores),
        ...SUBJECTS.reduce((acc, subj) => {
          acc[subj.name] = parseFloat(exam.scores[subj.id]) || 0
          return acc
        }, {})
      }))
  }

  const getRadarData = () => {
    const latest = getLatestExam()
    if (!latest) return []
    return SUBJECTS.map(subj => ({
      subject: subj.name,
      score: ((parseFloat(latest.scores[subj.id]) || 0) / subj.fullScore * 100).toFixed(1),
      fullMark: 100
    }))
  }

  const getGoalProgress = (subjectId) => {
    const goal = goals[subjectId]
    if (!goal) return null
    const latest = getLatestExam()
    if (!latest) return null
    const current = parseFloat(latest.scores[subjectId]) || 0
    const progress = (current / goal * 100).toFixed(1)
    return { goal, current, progress: Math.min(100, parseFloat(progress)) }
  }

  const tabs = [
    { id: 'record', name: '成绩录入', icon: Plus },
    { id: 'view', name: '成绩查看', icon: BookOpen },
    { id: 'stats', name: '统计分析', icon: BarChart3 },
    { id: 'trend', name: '趋势图表', icon: TrendingUp },
    { id: 'goals', name: '目标设定', icon: Target },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">高中成绩统计系统</h1>
          </div>
        </div>
      </header>

      <nav className="bg-white/60 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'record' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">录入考试成绩</h2>
              <button
                onClick={() => setShowAddExam(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4" />
                添加考试
              </button>
            </div>

            {showAddExam && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">新增考试记录</h3>
                  <button onClick={() => setShowAddExam(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">考试名称</label>
                    <input
                      type="text"
                      value={newExam.name}
                      onChange={e => setNewExam({...newExam, name: e.target.value})}
                      placeholder="例：第一次月考"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">年级</label>
                    <select
                      value={newExam.grade}
                      onChange={e => setNewExam({...newExam, grade: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {GRADES.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">学期</label>
                    <select
                      value={newExam.semester}
                      onChange={e => setNewExam({...newExam, semester: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {SEMESTERS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">考试类型</label>
                    <select
                      value={newExam.type}
                      onChange={e => setNewExam({...newExam, type: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {EXAM_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">考试日期</label>
                    <input
                      type="date"
                      value={newExam.date}
                      onChange={e => setNewExam({...newExam, date: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                  {SUBJECTS.map(subj => (
                    <div key={subj.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {subj.name} <span className="text-gray-400">({subj.fullScore}分)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={subj.fullScore}
                        value={newExam.scores[subj.id] || ''}
                        onChange={e => setNewExam({
                          ...newExam,
                          scores: {...newExam.scores, [subj.id]: e.target.value}
                        })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowAddExam(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleAddExam}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    <Save className="w-4 h-4" />
                    保存
                  </button>
                </div>
              </div>
            )}

            {exams.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">还没有考试记录，点击上方按钮添加</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">考试</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">日期</th>
                        {SUBJECTS.map(subj => (
                          <th key={subj.id} className="px-3 py-3 text-center text-sm font-semibold text-gray-600">
                            {subj.name}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">总分</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[...exams].sort((a, b) => new Date(b.date) - new Date(a.date)).map(exam => (
                        <tr key={exam.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">{exam.name}</div>
                            <div className="text-xs text-gray-500">{exam.grade || '高一'} {exam.semester || '上学期'} · {exam.type}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{exam.date}</td>
                          {SUBJECTS.map(subj => {
                            const score = parseFloat(exam.scores[subj.id])
                            const percentage = score / subj.fullScore
                            let colorClass = 'text-gray-400'
                            if (!isNaN(score)) {
                              if (percentage >= 0.9) colorClass = 'text-green-600 font-semibold'
                              else if (percentage >= 0.8) colorClass = 'text-blue-600'
                              else if (percentage >= 0.6) colorClass = 'text-yellow-600'
                              else colorClass = 'text-red-600'
                            }
                            return (
                              <td key={subj.id} className={`px-3 py-3 text-center text-sm ${colorClass}`}>
                                {isNaN(score) ? '-' : score}
                              </td>
                            )
                          })}
                          <td className="px-4 py-3 text-center font-semibold text-indigo-600">
                            {calculateTotal(exam.scores)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => setEditingExam({...exam})}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteExam(exam.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {editingExam && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">编辑考试记录</h3>
                    <button onClick={() => setEditingExam(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">考试名称</label>
                      <input
                        type="text"
                        value={editingExam.name}
                        onChange={e => setEditingExam({...editingExam, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">年级</label>
                      <select
                        value={editingExam.grade || '高一'}
                        onChange={e => setEditingExam({...editingExam, grade: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        {GRADES.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">学期</label>
                      <select
                        value={editingExam.semester || '上学期'}
                        onChange={e => setEditingExam({...editingExam, semester: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        {SEMESTERS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">考试类型</label>
                      <select
                        value={editingExam.type}
                        onChange={e => setEditingExam({...editingExam, type: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        {EXAM_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">考试日期</label>
                      <input
                        type="date"
                        value={editingExam.date}
                        onChange={e => setEditingExam({...editingExam, date: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    {SUBJECTS.map(subj => (
                      <div key={subj.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {subj.name} <span className="text-gray-400">({subj.fullScore}分)</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={subj.fullScore}
                          value={editingExam.scores[subj.id] || ''}
                          onChange={e => setEditingExam({
                            ...editingExam,
                            scores: {...editingExam.scores, [subj.id]: e.target.value}
                          })}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setEditingExam(null)}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleUpdateExam}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                      <Save className="w-4 h-4" />
                      保存修改
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'view' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">成绩查看</h2>
            
            {exams.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">暂无成绩记录</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {[...exams].sort((a, b) => new Date(b.date) - new Date(a.date)).map(exam => (
                  <div key={exam.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold">{exam.name}</h3>
                          <p className="text-indigo-100 text-sm">{exam.grade || '高一'} {exam.semester || '上学期'} · {exam.type} · {exam.date}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">{calculateTotal(exam.scores)}</div>
                          <div className="text-indigo-100 text-sm">总分</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
                        {SUBJECTS.map(subj => {
                          const score = parseFloat(exam.scores[subj.id])
                          const percentage = score / subj.fullScore * 100
                          let bgColor = 'bg-gray-100'
                          if (!isNaN(score)) {
                            if (percentage >= 90) bgColor = 'bg-green-100'
                            else if (percentage >= 80) bgColor = 'bg-blue-100'
                            else if (percentage >= 60) bgColor = 'bg-yellow-100'
                            else bgColor = 'bg-red-100'
                          }
                          return (
                            <div key={subj.id} className={`${bgColor} rounded-lg p-3 text-center`}>
                              <div className="text-xs text-gray-600 mb-1">{subj.name}</div>
                              <div className="text-xl font-bold text-gray-800">
                                {isNaN(score) ? '-' : score}
                              </div>
                              <div className="text-xs text-gray-500">/ {subj.fullScore}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">统计分析</h2>

            {exams.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">暂无数据可分析</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow p-6">
                    <div className="text-sm text-gray-500 mb-1">考试次数</div>
                    <div className="text-3xl font-bold text-indigo-600">{exams.length}</div>
                  </div>
                  <div className="bg-white rounded-xl shadow p-6">
                    <div className="text-sm text-gray-500 mb-1">最高总分</div>
                    <div className="text-3xl font-bold text-green-600">
                      {Math.max(...exams.map(e => calculateTotal(e.scores)))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow p-6">
                    <div className="text-sm text-gray-500 mb-1">最低总分</div>
                    <div className="text-3xl font-bold text-red-600">
                      {Math.min(...exams.map(e => calculateTotal(e.scores)))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow p-6">
                    <div className="text-sm text-gray-500 mb-1">平均总分</div>
                    <div className="text-3xl font-bold text-blue-600">
                      {(exams.reduce((sum, e) => sum + calculateTotal(e.scores), 0) / exams.length).toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="px-6 py-4 border-b">
                    <h3 className="font-semibold text-gray-800">各科目统计</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">科目</th>
                          <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">满分</th>
                          <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">平均分</th>
                          <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">最高分</th>
                          <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">最低分</th>
                          <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">得分率</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {SUBJECTS.map(subj => {
                          const avg = parseFloat(calculateAverage(subj.id))
                          const rate = (avg / subj.fullScore * 100).toFixed(1)
                          return (
                            <tr key={subj.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium text-gray-800">{subj.name}</td>
                              <td className="px-6 py-4 text-center text-gray-600">{subj.fullScore}</td>
                              <td className="px-6 py-4 text-center font-semibold text-indigo-600">{avg || '-'}</td>
                              <td className="px-6 py-4 text-center text-green-600">{getHighestScore(subj.id) || '-'}</td>
                              <td className="px-6 py-4 text-center text-red-600">{getLowestScore(subj.id) || '-'}</td>
                              <td className="px-6 py-4 text-center">
                                {avg > 0 ? (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                                    ${parseFloat(rate) >= 90 ? 'bg-green-100 text-green-700' :
                                      parseFloat(rate) >= 80 ? 'bg-blue-100 text-blue-700' :
                                      parseFloat(rate) >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'}`}>
                                    {rate}%
                                  </span>
                                ) : '-'}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {getLatestExam() && (
                  <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">最近考试能力分布</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={getRadarData()}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar
                            name="得分率"
                            dataKey="score"
                            stroke="#6366f1"
                            fill="#6366f1"
                            fillOpacity={0.5}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'trend' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">趋势图表</h2>

            {exams.length < 2 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">至少需要两次考试记录才能查看趋势</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">总分趋势</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getTrendData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="总分" 
                          stroke="#6366f1" 
                          strokeWidth={3}
                          dot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">各科成绩趋势</h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getTrendData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {SUBJECTS.map((subj, idx) => {
                          const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280']
                          return (
                            <Line 
                              key={subj.id}
                              type="monotone" 
                              dataKey={subj.name} 
                              stroke={colors[idx]}
                              strokeWidth={2}
                            />
                          )
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">各次考试成绩对比</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getTrendData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="总分" fill="#6366f1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">目标设定</h2>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-4">设置各科目标分数</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {SUBJECTS.map(subj => (
                  <div key={subj.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {subj.name} <span className="text-gray-400">({subj.fullScore}分)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={subj.fullScore}
                      value={goals[subj.id] || ''}
                      onChange={e => setGoals({...goals, [subj.id]: e.target.value})}
                      placeholder="目标分数"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {Object.keys(goals).filter(k => goals[k]).length > 0 && getLatestExam() && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-800 mb-4">目标完成进度（基于最近一次考试）</h3>
                <div className="space-y-4">
                  {SUBJECTS.filter(subj => goals[subj.id]).map(subj => {
                    const progress = getGoalProgress(subj.id)
                    if (!progress) return null
                    const isAchieved = progress.current >= progress.goal
                    return (
                      <div key={subj.id} className="flex items-center gap-4">
                        <div className="w-16 text-sm font-medium text-gray-700">{subj.name}</div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${isAchieved ? 'bg-green-500' : 'bg-indigo-500'}`}
                              style={{ width: `${progress.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-32 text-sm text-right">
                          <span className={isAchieved ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                            {progress.current}
                          </span>
                          <span className="text-gray-400"> / {progress.goal}</span>
                        </div>
                        {isAchieved && (
                          <Award className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow p-6 text-white">
              <h3 className="font-semibold mb-2">💡 学习建议</h3>
              <ul className="space-y-2 text-indigo-100">
                <li>• 设定合理目标：建议每次进步5-10分，循序渐进</li>
                <li>• 分析薄弱科目：重点攻克得分率低于80%的科目</li>
                <li>• 保持优势科目：得分率超过90%的科目继续保持</li>
                <li>• 定期复盘：每次考试后分析错题，总结经验</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white/60 border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          高中成绩统计系统 · 数据保存在本地浏览器中
        </div>
      </footer>
    </div>
  )
}

export default App
