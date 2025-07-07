import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  History, 
  BarChart3, 
  Shield, 
  TrendingUp, 
  Award, 
  Clock,
  MapPin,
  Users,
  Zap,
  Calendar,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Heart,
  Target,
  Bell,
  Star,
  Download,
  TestTube
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface QuickStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
}

interface RecentTest {
  id: string;
  type: string;
  result: 'POSITIVE' | 'NEGATIVE' | 'INVALID';
  date: string;
  confidence: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  progress?: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Mock data
  const quickStats: QuickStat[] = [
    {
      label: 'Tests This Month',
      value: '12',
      change: '+3 from last month',
      trend: 'up',
      icon: TestTube,
      color: 'bg-blue-500'
    },
    {
      label: 'Health Score',
      value: '94%',
      change: '+2% improvement',
      trend: 'up',
      icon: Heart,
      color: 'bg-green-500'
    },
    {
      label: 'Streak Days',
      value: '7',
      change: 'Current streak',
      trend: 'neutral',
      icon: Target,
      color: 'bg-purple-500'
    },
    {
      label: 'Total Tests',
      value: '45',
      change: 'All time',
      trend: 'neutral',
      icon: Award,
      color: 'bg-orange-500'
    }
  ];

  const recentTests: RecentTest[] = [
    {
      id: '1',
      type: 'COVID-19',
      result: 'NEGATIVE',
      date: '2 hours ago',
      confidence: 95.2
    },
    {
      id: '2',
      type: 'Influenza A',
      result: 'NEGATIVE',
      date: '1 day ago',
      confidence: 92.8
    },
    {
      id: '3',
      type: 'COVID-19',
      result: 'NEGATIVE',
      date: '3 days ago',
      confidence: 96.1
    }
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Test',
      description: 'Complete your first diagnostic test',
      icon: Star,
      unlocked: true
    },
    {
      id: '2',
      title: 'Weekly Warrior',
      description: 'Complete 7 tests in a week',
      icon: Target,
      unlocked: false,
      progress: 60
    },
    {
      id: '3',
      title: 'Health Guardian',
      description: 'Maintain 30-day testing streak',
      icon: Shield,
      unlocked: false,
      progress: 23
    }
  ];

  const quickActions = [
    {
      title: 'Quick Scan',
      description: 'Start a new test analysis',
      icon: Camera,
      href: '/scan',
      color: 'from-blue-500 to-cyan-400',
      featured: true
    },
    {
      title: 'View History',
      description: 'See your test results',
      icon: History,
      href: '/history',
      color: 'from-green-500 to-emerald-400'
    },
    {
      title: 'Health Analytics',
      description: 'Track your health trends',
      icon: BarChart3,
      href: '/analytics',
      color: 'from-purple-500 to-pink-400'
    },
    {
      title: 'Privacy Settings',
      description: 'Manage your data',
      icon: Shield,
      href: '/privacy',
      color: 'from-orange-500 to-red-400'
    }
  ];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header with greeting and time */}
      <motion.div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Ready to monitor your health today?
              </p>
              <div className="flex items-center mt-3 text-blue-100">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/scan"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Camera className="w-5 h-5 mr-2" />
                Quick Scan
              </Link>
              
              <button className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-400/20 rounded-full blur-xl"></div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-soft-lg transition-all duration-300"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              {stat.trend === 'up' && (
                <TrendingUp className="w-4 h-4 text-green-500" />
              )}
            </div>
            
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {stat.label}
            </div>
            <div className={`text-xs font-medium ${
              stat.trend === 'up' ? 'text-green-600' : 'text-gray-500'
            }`}>
              {stat.change}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={action.href}
                    className={`block p-6 rounded-2xl bg-gradient-to-br ${action.color} text-white hover:shadow-lg transition-all duration-300 ${
                      action.featured ? 'md:col-span-2' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <action.icon className="w-8 h-8" />
                      {action.featured && (
                        <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                    <p className="text-white/80 text-sm">{action.description}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-soft p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Tests</h2>
              <Link 
                to="/history"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentTests.map((test, index) => (
                <motion.div
                  key={test.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      test.result === 'NEGATIVE' ? 'bg-green-100' : 
                      test.result === 'POSITIVE' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {test.result === 'NEGATIVE' ? (
                        <CheckCircle2 className={`w-5 h-5 text-green-600`} />
                      ) : (
                        <AlertTriangle className={`w-5 h-5 ${
                          test.result === 'POSITIVE' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{test.type}</div>
                      <div className="text-sm text-gray-500">{test.date}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      test.result === 'NEGATIVE' ? 'bg-green-100 text-green-800' :
                      test.result === 'POSITIVE' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {test.result}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {test.confidence}% confidence
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Health Insights */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <div className="flex items-center mb-4">
              <Activity className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-green-900">Health Insights</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Testing Frequency</span>
                <span className="text-sm font-medium text-green-900">Excellent</span>
              </div>
              
              <div className="w-full bg-green-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              
              <p className="text-xs text-green-600">
                You're testing regularly! Keep up the great work for optimal health monitoring.
              </p>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Achievements</h3>
            
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`p-3 rounded-xl border ${
                    achievement.unlocked 
                      ? 'bg-yellow-50 border-yellow-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      achievement.unlocked ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <achievement.icon className={`w-4 h-4 ${
                        achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${
                        achievement.unlocked ? 'text-yellow-900' : 'text-gray-600'
                      }`}>
                        {achievement.title}
                      </div>
                    </div>
                    {achievement.unlocked && (
                      <CheckCircle2 className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  
                  <p className={`text-xs ${
                    achievement.unlocked ? 'text-yellow-700' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                  
                  {achievement.progress && !achievement.unlocked && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full transition-all duration-300" 
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {achievement.progress}% complete
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center mb-4">
              <Zap className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-blue-900">Quick Tip</h3>
            </div>
            
            <p className="text-sm text-blue-700 mb-4">
              For best results, ensure your test is well-lit and the image is clear and focused.
            </p>
            
            <Link 
              to="/scan"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Try it now
              <Camera className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Call to Action */}
      <motion.div
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-white mb-4">
          Ready for your next health check?
        </h2>
        <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
          Stay on top of your health with regular testing. Our AI-powered analysis 
          provides instant results you can trust.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/scan"
            className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Camera className="w-5 h-5 mr-2" />
            Start New Test
          </Link>
          
          <Link
            to="/history"
            className="inline-flex items-center px-6 py-3 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-purple-600 transition-all duration-300"
          >
            <Download className="w-5 h-5 mr-2" />
            View Reports
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;