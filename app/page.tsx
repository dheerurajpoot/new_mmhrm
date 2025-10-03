"use client";

import { useWebsiteSettings } from "@/hooks/use-website-settings";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  Smartphone,
  ArrowRight,
  CheckCircle,
  Star,
  BarChart3,
  UserCheck,
  Calendar,
  FileText,
  PieChart,
  Settings,
  Zap,
  Target,
  Globe,
  Award,
  Play,
  ChevronDown,
  Sparkles,
  Rocket,
  Heart,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Github,
  Menu,
  X,
  Plus,
  Minus,
  Quote,
  ThumbsUp,
  TrendingDown,
  Activity,
  Brain,
  Lightbulb,
  Lock,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react";
import { useState, useEffect } from "react";

export default function HomePage() {
  const { settings } = useWebsiteSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description: "Centralized employee records with easy onboarding & offboarding",
      color: "from-blue-500 to-cyan-500",
      stats: "10,000+ employees managed"
    },
    {
      icon: Clock,
      title: "Smart Attendance",
      description: "Biometric & online attendance tracking with leave approvals",
      color: "from-purple-500 to-pink-500",
      stats: "99.9% accuracy rate"
    },
    {
      icon: DollarSign,
      title: "Payroll Automation",
      description: "Salary, tax, and deductions processed in one click",
      color: "from-green-500 to-emerald-500",
      stats: "70% time saved"
    },
    {
      icon: TrendingUp,
      title: "Performance Reviews",
      description: "Track goals, feedback, and employee growth",
      color: "from-orange-500 to-red-500",
      stats: "85% employee satisfaction"
    },
    {
      icon: Smartphone,
      title: "Self-Service Portal",
      description: "Empower employees with leave requests, payslips & updates",
      color: "from-indigo-500 to-purple-500",
      stats: "24/7 access"
    },
    {
      icon: Shield,
      title: "Secure & Cloud-Based",
      description: "Access anytime, anywhere with enterprise-grade security",
      color: "from-teal-500 to-blue-500",
      stats: "SOC 2 compliant"
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Save 70% of HR admin time",
      description: "Automate repetitive tasks and focus on strategic HR initiatives",
      metric: "70%",
      color: "text-blue-600"
    },
    {
      icon: Users,
      title: "Improve employee satisfaction",
      description: "Transparent processes and self-service capabilities",
      metric: "95%",
      color: "text-green-600"
    },
    {
      icon: Shield,
      title: "Stay compliant",
      description: "With labor laws & regulations automatically",
      metric: "100%",
      color: "text-purple-600"
    },
    {
      icon: BarChart3,
      title: "Data-driven decisions",
      description: "Advanced analytics and reporting for better insights",
      metric: "50%",
      color: "text-orange-600"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Users", icon: Users },
    { number: "500+", label: "Companies", icon: Globe },
    { number: "99.9%", label: "Uptime", icon: Activity },
    { number: "24/7", label: "Support", icon: MessageCircle }
  ];

  const faqs = [
    {
      question: "How quickly can I get started?",
      answer: "You can start using MM HRM within minutes. Simply sign up, invite your team, and begin managing your workforce immediately."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we use enterprise-grade security with SOC 2 compliance, end-to-end encryption, and regular security audits."
    },
    {
      question: "Can I integrate with existing systems?",
      answer: "Absolutely! MM HRM offers seamless integrations with popular tools like Slack, Microsoft Teams, and various payroll systems."
    },
    {
      question: "What support do you provide?",
      answer: "We offer 24/7 customer support via chat, email, and phone, plus comprehensive documentation and training resources."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "HR Manager",
      company: "TechCorp",
      content: "MM HRM transformed our HR operations. Payroll and attendance tracking went from hours to minutes!",
      rating: 5,
      avatar: "SJ",
      verified: true
    },
    {
      name: "Michael Chen",
      role: "CEO",
      company: "RetailMart",
      content: "The employee self-service portal is a game-changer. Our staff loves the transparency.",
      rating: 5,
      avatar: "MC",
      verified: true
    },
    {
      name: "Emily Rodriguez",
      role: "Operations Director",
      company: "StartupXYZ",
      content: "The analytics and reporting features give us insights we never had before. Game-changing!",
      rating: 5,
      avatar: "ER",
      verified: true
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      description: "Perfect for small teams getting started",
      price: "Free",
      period: "14 days trial",
      features: [
        "Up to 10 employees",
        "Basic attendance tracking",
        "Simple payroll processing",
        "Email support",
        "Mobile app access"
      ],
      cta: "Start Free Trial",
      popular: false,
      color: "border-gray-200",
      buttonColor: "bg-gray-900 hover:bg-gray-800"
    },
    {
      name: "Professional",
      description: "For growing companies",
      price: "$29",
      period: "per month",
      features: [
        "Up to 100 employees",
        "Advanced analytics",
        "Automated payroll",
        "Priority support",
        "Custom reports",
        "API access",
        "Advanced security"
      ],
      cta: "Get Started",
      popular: true,
      color: "border-blue-500",
      buttonColor: "bg-blue-600 hover:bg-blue-700"
    },
    {
      name: "Enterprise",
      description: "Custom solutions for large businesses",
      price: "Custom",
      period: "contact us",
      features: [
        "Unlimited employees",
        "White-label solution",
        "Dedicated support",
        "Custom integrations",
        "Advanced security",
        "SLA guarantee",
        "Custom training"
      ],
      cta: "Contact Sales",
      popular: false,
      color: "border-purple-200",
      buttonColor: "bg-purple-600 hover:bg-purple-700"
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo - Left */}
            <div className="flex items-center space-x-3">
              {settings?.site_logo ? (
                <img
                  src={settings.site_logo}
                  alt="Logo"
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">MM</span>
                </div>
              )}
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {settings?.site_name || "MM HRM"}
                </span>
                <div className="text-xs text-gray-500 font-medium">Smart HR Management</div>
              </div>
            </div>

            {/* Animated Text - Center */}
            <div className="flex-1 flex justify-center hidden md:flex">
              <div className="relative">
                <span className="text-2xl lg:text-3xl font-bold font-mono">
                  <span className="text-blue-500 animate-pulse">#</span>
                  <span className="text-green-500 animate-bounce" style={{ animationDelay: '0.1s' }}>w</span>
                  <span className="text-yellow-500 animate-bounce" style={{ animationDelay: '0.2s' }}>e</span>
                  <span className="text-red-500 animate-bounce" style={{ animationDelay: '0.3s' }}>t</span>
                  <span className="text-purple-500 animate-bounce" style={{ animationDelay: '0.4s' }}>h</span>
                  <span className="text-pink-500 animate-bounce" style={{ animationDelay: '0.5s' }}>e</span>
                  <span className="text-indigo-500 animate-bounce" style={{ animationDelay: '0.6s' }}>m</span>
                  <span className="text-cyan-500 animate-bounce" style={{ animationDelay: '0.7s' }}>a</span>
                  <span className="text-orange-500 animate-bounce" style={{ animationDelay: '0.8s' }}>v</span>
                  <span className="text-teal-500 animate-bounce" style={{ animationDelay: '0.9s' }}>e</span>
                  <span className="text-rose-500 animate-bounce" style={{ animationDelay: '1.0s' }}>r</span>
                  <span className="text-lime-500 animate-bounce" style={{ animationDelay: '1.1s' }}>i</span>
                  <span className="text-emerald-500 animate-bounce" style={{ animationDelay: '1.2s' }}>c</span>
                  <span className="text-violet-500 animate-bounce" style={{ animationDelay: '1.3s' }}>k</span>
                  <span className="text-sky-500 animate-bounce" style={{ animationDelay: '1.4s' }}>s</span>
                </span>
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 via-red-500 via-purple-500 via-pink-500 to-indigo-500 animate-pulse"></div>
              </div>
            </div>

            {/* Get Started Button - Right */}
            <div className="flex items-center">
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  Get Started
                  <Rocket className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-pink-400 to-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className={`text-center lg:text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm mb-8">
                <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Trusted by 500+ companies worldwide</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  Smart HR
                </span>
                <br />
                <span className="text-gray-900">Management</span>
                <br />
                <span className="text-4xl lg:text-5xl text-gray-600 font-normal">Made Simple</span>
              </h1>

              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Transform your HR operations with our all-in-one platform. Streamline employee management, automate payroll, and boost productivity with intelligent insights.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 px-8 py-4 text-lg">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    Sign Up
                    <Rocket className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>

            </div>

            {/* Interactive Dashboard Preview */}
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="relative">
                {/* Main dashboard card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 transform hover:scale-105 transition-all duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Dashboard Overview</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800">Total Employees</h4>
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-blue-600 mb-1">1,247</div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        +12% this month
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800">Payroll Processed</h4>
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-3xl font-bold text-green-600 mb-1">$245K</div>
                      <div className="text-sm text-gray-600">This month</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                    <h4 className="font-semibold text-gray-800 mb-4">Recent Activities</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">15 new employees onboarded</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">Payroll processed for 1,200+ employees</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">8 performance reviews completed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4 border border-gray-200 animate-bounce">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-800">Task Completed</div>
                      <div className="text-xs text-gray-500">Payroll processed</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 border border-gray-200 animate-pulse">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-800">Live Activity</div>
                      <div className="text-xs text-gray-500">3 users online</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </div>
      </section>


      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Get Started Today
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Simple, Fast, and
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"> Risk-Free</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Start your HR transformation journey with our easy-to-use platform. No commitments, no hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">14-Day Free Trial</h3>
                <p className="text-gray-600 leading-relaxed">
                  Experience the full power of MM HRM for 14 days completely free. No limitations, no restrictions.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Credit Card Required</h3>
                <p className="text-gray-600 leading-relaxed">
                  Start immediately without providing any payment information. Your privacy and security are our priority.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Setup in 5 Minutes</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get up and running in just 5 minutes with our intuitive setup wizard. Import your data and start managing your team.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright */}
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 {settings?.site_name || "MM HRM"}. All rights reserved.
            </div>

            {/* Logo Center */}
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              {settings?.site_logo ? (
                <img
                  src={settings.site_logo}
                  alt="Logo"
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">MM</span>
                </div>
              )}
              <span className="text-xl font-bold">
                {settings?.site_name || "MM HRM"}
              </span>
            </div>

            {/* Made by */}
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Made with ❤️ by Chandu</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}