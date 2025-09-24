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
  Award
} from "lucide-react";

export default function HomePage() {
  const { settings } = useWebsiteSettings();

  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description: "Centralized employee records with easy onboarding & offboarding"
    },
    {
      icon: Clock,
      title: "Smart Attendance", 
      description: "Biometric & online attendance tracking with leave approvals"
    },
    {
      icon: DollarSign,
      title: "Payroll Automation",
      description: "Salary, tax, and deductions processed in one click"
    },
    {
      icon: TrendingUp,
      title: "Performance Reviews",
      description: "Track goals, feedback, and employee growth"
    },
    {
      icon: Smartphone,
      title: "Self-Service Portal",
      description: "Empower employees with leave requests, payslips & updates"
    },
    {
      icon: Shield,
      title: "Secure & Cloud-Based",
      description: "Access anytime, anywhere with enterprise-grade security"
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Save 70% of HR admin time",
      description: "Automate repetitive tasks and focus on strategic HR initiatives"
    },
    {
      icon: Users,
      title: "Improve employee satisfaction",
      description: "Transparent processes and self-service capabilities"
    },
    {
      icon: Shield,
      title: "Stay compliant",
      description: "With labor laws & regulations automatically"
    },
    {
      icon: BarChart3,
      title: "Data-driven decisions",
      description: "Advanced analytics and reporting for better insights"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "HR Manager",
      company: "TechCorp",
      content: "MM HRM transformed our HR operations. Payroll and attendance tracking went from hours to minutes!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "CEO", 
      company: "RetailMart",
      content: "The employee self-service portal is a game-changer. Our staff loves the transparency.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      description: "For small teams",
      price: "Free",
      period: "14 days",
      features: [
        "Up to 10 employees",
        "Basic attendance tracking",
        "Simple payroll processing",
        "Email support"
      ],
      cta: "Start Free Trial",
      popular: false
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
        "Custom reports"
      ],
      cta: "Get Started",
      popular: true
    },
    {
      name: "Enterprise",
      description: "Custom solutions for large businesses", 
      price: "Custom",
      period: "",
      features: [
        "Unlimited employees",
        "White-label solution",
        "Dedicated support",
        "Custom integrations",
        "Advanced security"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              {settings?.site_logo ? (
                <img 
                  src={settings.site_logo} 
                  alt="Logo" 
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MM</span>
                </div>
              )}
              <span className="text-xl font-bold text-gray-900">
                {settings?.site_name || "MM HRM"}
              </span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition-colors">Benefits</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Testimonials</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-blue-50 to-purple-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 font-secondary">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-blue-600">
                  MM HRM
                </span>
                <br />
                <span className="text-gray-800 text-[40px]">Smart <br /> HR Management</span>
              </h1>
              <h2 className="text-xl lg:text-2xl text-gray-600 mb-8 font-secondary">
                Manage Your People. Grow Your Business.
              </h2>
              <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0">
                All-in-one HRM software to streamline employee management, payroll, attendance, and performance — so you can focus on what really matters: your people.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white px-8 py-4 text-lg">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">Total Employees</h3>
                      <Users className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-2xl font-bold text-red-600">40+</div>
                    <div className="text-sm text-gray-600">+12% this month</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">Payroll Processed</h3>
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">$45K</div>
                    <div className="text-sm text-gray-600">This month</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Recent Activities</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">5 new employees onboarded</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Payroll processed for 40+ employees</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">3 performance reviews completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-secondary">
              Why MM HRM?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your workforce efficiently and effectively
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-secondary">
              MM HRM helps you:
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-secondary">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-lg mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-blue-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-semibold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600">{testimonial.role}, {testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-secondary">
              Simple & Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              👉 First 14 days free. No credit card required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`border-2 ${plan.popular ? 'border-red-500 shadow-xl scale-105' : 'border-gray-200'} relative bg-white`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-red-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl text-gray-900">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-gray-600"> {plan.period}</span>}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white' : 'border-2 hover:bg-gray-50'}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 font-secondary">
            Ready to simplify HR?
          </h2>
          <p className="text-xl text-red-100 mb-10">
            Start managing your team smarter with MM HRM.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto bg-white text-red-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                {settings?.site_logo ? (
                  <img 
                    src={settings.site_logo} 
                    alt="Logo" 
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">MM</span>
                  </div>
                )}
                <span className="text-xl font-bold">
                  {settings?.site_name || "MM HRM"}
                </span>
              </div>
              <p className="text-gray-400">
                Smart HR Management Simplified. Manage your people, grow your business.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {settings?.site_name || "MM HRM"}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}