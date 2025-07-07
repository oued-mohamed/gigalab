import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  RotateCcw,
  Zap,
  Brain,
  Shield,
  Download,
  Share,
  Eye,
  Clock,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AnalysisResult {
  testType: string;
  result: 'POSITIVE' | 'NEGATIVE' | 'INVALID';
  confidence: number;
  analysis: {
    controlLine: { detected: boolean; intensity: number };
    testLine: { detected: boolean; intensity: number };
    background: { quality: string };
  };
  recommendations: string[];
  timestamp: string;
}

const ScanTest: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [testType, setTestType] = useState('COVID_19');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [location, setLocation] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Test types configuration
  const testTypes = [
    { id: 'COVID_19', name: 'COVID-19 Rapid Test', color: 'bg-red-500' },
    { id: 'PREGNANCY', name: 'Pregnancy Test', color: 'bg-pink-500' },
    { id: 'INFLUENZA_A', name: 'Influenza A', color: 'bg-blue-500' },
    { id: 'STREP_A', name: 'Strep A', color: 'bg-purple-500' }
  ];

  // Mock AI analysis function
  const analyzeImage = async (file: File): Promise<AnalysisResult> => {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock analysis result
    const results = [
      {
        testType,
        result: 'NEGATIVE' as const,
        confidence: 94.5,
        analysis: {
          controlLine: { detected: true, intensity: 0.89 },
          testLine: { detected: false, intensity: 0.12 },
          background: { quality: 'Good' }
        },
        recommendations: [
          'Control line detected - test is valid',
          'No test line detected - negative result',
          'Consider retesting in 24-48 hours if symptoms persist'
        ]
      },
      {
        testType,
        result: 'POSITIVE' as const,
        confidence: 96.8,
        analysis: {
          controlLine: { detected: true, intensity: 0.92 },
          testLine: { detected: true, intensity: 0.78 },
          background: { quality: 'Excellent' }
        },
        recommendations: [
          'Both control and test lines detected',
          'Follow local health guidelines for isolation',
          'Contact healthcare provider for next steps'
        ]
      }
    ];

    return {
      ...results[Math.floor(Math.random() * results.length)],
      timestamp: new Date().toISOString()
    };
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    toast.success('Image uploaded successfully!');
  }, []);

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  // Start camera
  const startCamera = async () => {
    try {
      // Request camera permissions and start stream
      const constraints = {
        video: {
          facingMode: 'environment', // Back camera preferred
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        // If back camera fails, try front camera
        console.log('Back camera not available, trying front camera...');
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          }
        });
      }
      
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Show camera modal immediately
        setShowCamera(true);
        
        // Wait for video to be ready and play
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Video playing successfully');
              toast.success('Camera ready! Position your test in the frame.');
            })
            .catch((error) => {
              console.error('Error playing video:', error);
              toast.error('Camera preview failed to start');
            });
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      let errorMessage = 'Unable to access camera. ';
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage += 'Please allow camera permissions in your browser.';
            break;
          case 'NotFoundError':
            errorMessage += 'No camera found on this device.';
            break;
          case 'NotReadableError':
            errorMessage += 'Camera is being used by another application.';
            break;
          case 'OverconstrainedError':
            errorMessage += 'Camera constraints not supported.';
            break;
          default:
            errorMessage += 'Please check your camera settings.';
        }
      }
      
      toast.error(errorMessage);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flip the image horizontally to match the mirrored preview
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `test-capture-${Date.now()}.jpg`, { 
              type: 'image/jpeg' 
            });
            handleFileSelect(file);
            stopCamera();
            toast.success('Photo captured successfully!');
          } else {
            toast.error('Failed to capture photo. Please try again.');
          }
        }, 'image/jpeg', 0.9);
      }
    } else {
      toast.error('Camera not ready. Please try again.');
    }
  };

  // Analyze image
  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeImage(selectedFile);
      setAnalysisResult(result);
      toast.success('Analysis completed!');
    } catch (error) {
      toast.error('Analysis failed. Please try again.');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset scan
  const resetScan = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get user location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          toast.success('Location added');
        },
        () => {
          toast.error('Unable to get location');
        }
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-2 mb-4">
          <Brain className="w-5 h-5 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-blue-700">AI-Powered Analysis</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Scan Your Test
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Upload an image of your rapid diagnostic test for instant AI-powered analysis with confidence scores and detailed insights.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Upload/Camera */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Test Type Selection */}
          <div className="bg-white rounded-2xl shadow-soft p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Test Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {testTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setTestType(type.id)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    testType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-3 h-3 ${type.color} rounded-full mb-2`}></div>
                  <div className="text-sm font-medium text-gray-900">{type.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-white rounded-2xl shadow-soft p-6 mb-6">
            <AnimatePresence mode="wait">
              {!previewUrl ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 transition-colors"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Upload Test Image
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Take a photo or select an image from your device
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startCamera}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </motion.button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    Supports JPG, PNG, HEIC up to 10MB
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative"
                >
                  <img
                    src={previewUrl}
                    alt="Test preview"
                    className="w-full h-80 object-cover rounded-xl shadow-lg"
                  />
                  <button
                    onClick={resetScan}
                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  {!analysisResult && (
                    <div className="mt-6 flex justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5 mr-2" />
                            Analyze Test
                          </>
                        )}
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Settings</h3>
            
            <div className="space-y-4">
              {/* Anonymous toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Anonymous Testing</div>
                  <div className="text-sm text-gray-500">Keep your test results private</div>
                </div>
                <button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isAnonymous ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isAnonymous ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter location or use GPS"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={getCurrentLocation}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Results/Info */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Analysis Status */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Status</h3>
            
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-6"
                >
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mb-2">Analyzing Image</div>
                  <div className="text-sm text-gray-600">AI is processing your test image...</div>
                </motion.div>
              ) : analysisResult ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Result Header */}
                  <div className={`p-4 rounded-xl mb-4 ${
                    analysisResult.result === 'POSITIVE' ? 'bg-red-50 border border-red-200' :
                    analysisResult.result === 'NEGATIVE' ? 'bg-green-50 border border-green-200' :
                    'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`flex items-center ${
                        analysisResult.result === 'POSITIVE' ? 'text-red-700' :
                        analysisResult.result === 'NEGATIVE' ? 'text-green-700' :
                        'text-yellow-700'
                      }`}>
                        {analysisResult.result === 'POSITIVE' ? <AlertCircle className="w-5 h-5 mr-2" /> :
                         analysisResult.result === 'NEGATIVE' ? <CheckCircle className="w-5 h-5 mr-2" /> :
                         <AlertCircle className="w-5 h-5 mr-2" />}
                        <span className="font-semibold">{analysisResult.result}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {analysisResult.confidence.toFixed(1)}% confidence
                      </span>
                    </div>
                    <div className="text-sm opacity-75">
                      {testTypes.find(t => t.id === analysisResult.testType)?.name}
                    </div>
                  </div>

                  {/* Analysis Details */}
                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 mb-1">Control Line</div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">
                          {analysisResult.analysis.controlLine.detected ? 'Detected' : 'Not detected'}
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {(analysisResult.analysis.controlLine.intensity * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="font-medium text-gray-900 mb-1">Test Line</div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">
                          {analysisResult.analysis.testLine.detected ? 'Detected' : 'Not detected'}
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {(analysisResult.analysis.testLine.intensity * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="font-medium text-gray-900 mb-1">Image Quality</div>
                      <span className="text-gray-600">{analysisResult.analysis.background.quality}</span>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="font-medium text-gray-900 mb-2">Recommendations</div>
                    <ul className="space-y-1">
                      {analysisResult.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 space-y-2">
                    <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </button>
                    <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <Share className="w-4 h-4 mr-2" />
                      Share Result
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <div className="text-gray-500">Upload an image to begin analysis</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Info */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <Camera className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Capture Image</div>
                  <div className="text-sm text-gray-600">Take a clear photo of your test</div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <Brain className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">AI Analysis</div>
                  <div className="text-sm text-gray-600">Advanced algorithms analyze the result</div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Get Results</div>
                  <div className="text-sm text-gray-600">Receive detailed analysis and recommendations</div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center mb-2">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-900">Privacy Protected</span>
            </div>
            <p className="text-sm text-green-700">
              Your images are processed securely and can be deleted immediately after analysis. 
              Anonymous mode ensures complete privacy.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[9999] p-4"
            style={{ zIndex: 9999 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-4 w-full max-w-4xl mx-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">📷 Camera Preview</h3>
                <button
                  onClick={stopCamera}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  type="button"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Video Container */}
              <div className="relative bg-black rounded-xl overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto min-h-[300px] max-h-[60vh] object-cover bg-gray-900"
                  style={{ 
                    display: 'block',
                    width: '100%',
                    height: 'auto'
                  }}
                />
                
                {/* Loading overlay */}
                {!videoRef.current?.srcObject && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-white text-center">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p>Starting camera...</p>
                    </div>
                  </div>
                )}
                
                {/* Positioning guides */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-white/50 rounded-lg p-4">
                    <div className="w-80 h-48 border-2 border-dashed border-white/70 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded">
                        📋 Position test here
                      </span>
                    </div>
                  </div>
                </div>

                {/* Corner guides */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/70 rounded-tl"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/70 rounded-tr"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/70 rounded-bl"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/70 rounded-br"></div>
              </div>

              {/* Instructions */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  📱 Position your rapid diagnostic test within the frame
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Make sure the test is well-lit and all lines are clearly visible
                </p>
              </div>

              {/* Controls */}
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={stopCamera}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  type="button"
                >
                  Cancel
                </button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={capturePhoto}
                  className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                  type="button"
                >
                  <Camera className="w-7 h-7" />
                </motion.button>
                
                <button
                  onClick={() => {
                    stopCamera();
                    setTimeout(startCamera, 100);
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                  type="button"
                >
                  <RotateCcw className="w-4 h-4" />
                  Flip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ScanTest;