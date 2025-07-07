import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Calendar, 
  MapPin, 
  Filter,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  BarChart3,
  Eye,
  Share,
  FileText,
  ChevronDown,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface TestResult {
  id: string;
  type: 'COVID-19' | 'Influenza A' | 'Pregnancy' | 'Strep A';
  result: 'POSITIVE' | 'NEGATIVE' | 'INVALID';
  date: string;
  location: string;
  confidence: number;
  notes?: string;
  imageUrl?: string;
}

const TestHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data
  const mockTests: TestResult[] = [
    {
      id: '1',
      type: 'COVID-19',
      result: 'NEGATIVE',
      date: '2024-01-15T10:30:00Z',
      location: 'Casablanca, Morocco',
      confidence: 95.2,
      notes: 'Regular screening test'
    },
    {
      id: '2',
      type: 'Influenza A',
      result: 'POSITIVE',
      date: '2024-01-10T14:20:00Z',
      location: 'Rabat, Morocco',
      confidence: 88.7,
      notes: 'Symptoms present for 2 days'
    },
    {
      id: '3',
      type: 'COVID-19',
      result: 'NEGATIVE',
      date: '2024-01-08T09:15:00Z',
      location: 'Casablanca, Morocco',
      confidence: 92.1
    },
    {
      id: '4',
      type: 'Strep A',
      result: 'NEGATIVE',
      date: '2024-01-05T16:45:00Z',
      location: 'Marrakech, Morocco',
      confidence: 94.8
    },
    {
      id: '5',
      type: 'COVID-19',
      result: 'INVALID',
      date: '2024-01-03T11:20:00Z',
      location: 'Casablanca, Morocco',
      confidence: 45.2,
      notes: 'Poor image quality, retested'
    }
  ];

  // Filter and sort tests
  const filteredAndSortedTests = useMemo(() => {
    let filtered = mockTests.filter(test => {
      const matchesSearch = test.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           test.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           test.result.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = selectedFilter === 'all' || test.result === selectedFilter;
      
      const matchesPeriod = selectedPeriod === 'all' || (() => {
        const testDate = new Date(test.date);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - testDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (selectedPeriod) {
          case 'week': return daysDiff <= 7;
          case 'month': return daysDiff <= 30;
          case 'quarter': return daysDiff <= 90;
          default: return true;
        }
      })();
      
      return matchesSearch && matchesFilter && matchesPeriod;
    });

    // Sort tests
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'result':
          comparison = a.result.localeCompare(b.result);
          break;
        case 'confidence':
          comparison = a.confidence - b.confidence;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [mockTests, searchTerm, selectedFilter, selectedPeriod, sortBy, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredAndSortedTests.length;
    const positive = filteredAndSortedTests.filter(t => t.result === 'POSITIVE').length;
    const negative = filteredAndSortedTests.filter(t => t.result === 'NEGATIVE').length;
    const invalid = filteredAndSortedTests.filter(t => t.result === 'INVALID').length;
    const avgConfidence = total > 0 ? 
      filteredAndSortedTests.reduce((sum, t) => sum + t.confidence, 0) / total : 0;

    return { total, positive, negative, invalid, avgConfidence };
  }, [filteredAndSortedTests]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffDays === 0) {
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minutes ago`;
      }
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'POSITIVE': return 'text-red-600 bg-red-50 border-red-200';
      case 'NEGATIVE': return 'text-green-600 bg-green-50 border-green-200';
      case 'INVALID': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'POSITIVE': return <AlertTriangle className="w-4 h-4" />;
      case 'NEGATIVE': return <CheckCircle2 className="w-4 h-4" />;
      case 'INVALID': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const exportData = () => {
    // Mock export functionality
    const csvContent = [
      ['Date', 'Type', 'Result', 'Confidence', 'Location', 'Notes'],
      ...filteredAndSortedTests.map(test => [
        new Date(test.date).toLocaleDateString(),
        test.type,
        test.result,
        `${test.confidence}%`,
        test.location,
        test.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-blue-100 rounded-full px-6 py-2 mb-4">
          <History className="w-5 h-5 text-purple-600 mr-2" />
          <span className="text-sm font-medium text-purple-700">Test History</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Your Health Journey
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Track your test results over time and gain insights into your health patterns.
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          <div className="text-sm text-blue-600">Total Tests</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              {stats.total > 0 ? Math.round((stats.negative / stats.total) * 100) : 0}%
            </span>
          </div>
          <div className="text-2xl font-bold text-green-900">{stats.negative}</div>
          <div className="text-sm text-green-600">Negative Results</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
              {stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0}%
            </span>
          </div>
          <div className="text-2xl font-bold text-red-900">{stats.positive}</div>
          <div className="text-sm text-red-600">Positive Results</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">AVG</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{stats.avgConfidence.toFixed(1)}%</div>
          <div className="text-sm text-purple-600">Avg Confidence</div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        className="bg-white rounded-2xl shadow-soft p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Results</option>
              <option value="POSITIVE">Positive</option>
              <option value="NEGATIVE">Negative</option>
              <option value="INVALID">Invalid</option>
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="quarter">Past 3 Months</option>
            </select>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="type">Sort by Type</option>
                <option value="result">Sort by Result</option>
                <option value="confidence">Sort by Confidence</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={exportData}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </motion.div>

      {/* Test Results */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <AnimatePresence>
          {filteredAndSortedTests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 bg-white rounded-2xl shadow-soft"
            >
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tests found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or add a new test.</p>
            </motion.div>
          ) : (
            filteredAndSortedTests.map((test, index) => (
              <motion.div
                key={test.id}
                className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${getResultColor(test.result)}`}>
                      {getResultIcon(test.result)}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{test.type} Test</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(test.date)}
                        <MapPin className="w-4 h-4 ml-4 mr-1" />
                        {test.location}
                      </div>
                      {test.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{test.notes}"</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getResultColor(test.result)}`}>
                      {test.result}
                    </div>
                    <div className="text-sm text-gray-500">
                      {test.confidence.toFixed(1)}% confidence
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                        <Share className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Load More / Pagination */}
      {filteredAndSortedTests.length > 0 && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
            Load More Results
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default TestHistory;