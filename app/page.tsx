"use client";

import { useWebsiteSettings } from "@/hooks/use-website-settings";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Zap,
  Target,
  Globe,
  Award,
  Star,
  Heart,
  Rocket,
  Crown,
  Gem
} from "lucide-react";

export default function HomePage() {
  const { settings } = useWebsiteSettings();

  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description: "Centralized employee records with easy onboarding & offboarding",
      gradient: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50"
    },
    {
      icon: Clock,
      title: "Smart Attendance", 
      description: "Biometric & online attendance tracking with leave approvals",
      gradient: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: DollarSign,
      title: "Payroll Automation",
      description: "Salary, tax, and deductions processed in one click",
      gradient: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50"
    },
    {
      icon: TrendingUp,
      title: "Performance Reviews",
      description: "Track goals, feedback, and employee growth",
      gradient: "from-indigo-500 to-blue-600",
      bgColor: "bg-indigo-50"
    },
    {
      icon: Smartphone,
      title: "Self-Service Portal",
      description: "Empower employees with leave requests, payslips & updates",
      gradient: "from-rose-500 to-red-600",
      bgColor: "bg-rose-50"
    },
    {
      icon: Shield,
      title: "Secure & Cloud-Based",
      description: "Access anytime, anywhere with enterprise-grade security",
      gradient: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-teal-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              {settings?.site_logo ? (
                <img 
                  src={settings.site_logo} 
                  alt="Logo" 
                  className="w-10 h-10 object-contain rounded-lg"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">MM</span>
                </div>
              )}
              <span className="text-2xl font-bold text-white">
                {settings?.site_name || "MM HRM"}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-300">
                  <Rocket className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 text-cyan-300 text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4 mr-2" />
                Next-Gen HR Management Platform
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                  MM HRM
                </span>
                <br />
                <span className="text-white text-5xl lg:text-6xl">Revolutionary</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                  HR Experience
                </span>
              </h1>
              
              <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Transform your workforce management with AI-powered insights, seamless automation, and beautiful user experiences that your team will love.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-start lg:justify-start">
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-cyan-500/25 transition-all duration-300 group">
                    <Crown className="mr-3 w-6 h-6 group-hover:rotate-12 transition-transform" />
                    Sign Up
                    <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-cyan-400 text-cyan-400 bg-transparent hover:bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-6 text-lg font-semibold">
                  <Gem className="mr-3 w-6 h-6" />
                  Login
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-16">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">10K+</div>
                  <div className="text-white/60 text-sm">Happy Companies</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-2">99.9%</div>
                  <div className="text-white/60 text-sm">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">24/7</div>
                  <div className="text-white/60 text-sm">Support</div>
                </div>
              </div>
            </div>

            {/* Interactive Dashboard Preview */}
            <div className="relative">
              <div className="relative">
                {/* Floating Cards */}
                <div className="absolute -top-18 -right-18 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-2xl transform rotate-12 hover:rotate-6 transition-transform duration-500">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">2,847</div>
                      <div className="text-white/80 text-sm">Active Users</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-18 -left-18 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 shadow-2xl transform -rotate-12 hover:-rotate-6 transition-transform duration-500">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">+47%</div>
                      <div className="text-white/80 text-sm">Productivity</div>
                    </div>
                  </div>
                </div>

                {/* Main Dashboard */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-white text-xl font-semibold">Dashboard Overview</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl p-6 border border-cyan-400/30">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-semibold">Team Members</h4>
                        <Users className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-2">156</div>
                      <div className="text-cyan-300 text-sm">+12 this week</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-2xl p-6 border border-emerald-400/30">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-semibold">Revenue</h4>
                        <DollarSign className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-2">$89K</div>
                      <div className="text-emerald-300 text-sm">+23% growth</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-600/10 rounded-2xl p-6 border border-purple-400/30">
                    <h4 className="text-white font-semibold mb-4">Recent Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
                        <span className="text-white/80 text-sm">New employee onboarded</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"></div>
                        <span className="text-white/80 text-sm">Payroll processed successfully</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
                        <span className="text-white/80 text-sm">Performance review completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 bg-gradient-to-b from-transparent to-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-600/20 border border-purple-400/30 text-purple-300 text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Powerful Features
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Everything You Need to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"> Succeed</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Discover the comprehensive suite of tools designed to revolutionize your HR operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group border-0 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white flex items-center group-hover:text-cyan-300 transition-colors">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/70 text-base leading-relaxed group-hover:text-white/90 transition-colors">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-white/5 to-transparent py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-8">
              {settings?.site_logo ? (
                <img 
                  src={settings.site_logo} 
                  alt="Logo" 
                  className="w-12 h-12 object-contain rounded-xl"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">MM</span>
                </div>
              )}
              <span className="text-2xl font-bold text-white">
                {settings?.site_name || "MM HRM"}
              </span>
            </div>
            
            <div className="border-t border-white/20 pt-8 text-white/60">
              <p className="flex text-center items-center justify-center text-sm">
                Made with ❤️ by Chandu © 2025 {settings?.site_name || "MM HRM"}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}