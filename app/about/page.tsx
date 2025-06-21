import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Target, TrendingDown, Zap, Shield, Users } from "lucide-react";
import PublicLayout from "@/components/layouts/public-layout";

export default function AboutPage() {
    return (
        <PublicLayout>
            <div className="container mx-auto py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">About PriceBot</h1>
                        <p className="text-xl text-gray-600 mb-6">
                            Your intelligent shopping companion that helps you find the best deals and track prices across multiple platforms.
                        </p>
                        <div className="flex justify-center gap-4 flex-wrap">
                            <Badge variant="secondary" className="text-sm">
                                <Zap className="w-4 h-4 mr-1" />
                                AI-Powered
                            </Badge>
                            <Badge variant="secondary" className="text-sm">
                                <Target className="w-4 h-4 mr-1" />
                                Price Tracking
                            </Badge>
                            <Badge variant="secondary" className="text-sm">
                                <TrendingDown className="w-4 h-4 mr-1" />
                                Deal Alerts
                            </Badge>
                        </div>
                    </div>

                    {/* Mission Section */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="text-2xl">Our Mission</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                We believe everyone deserves to get the best value for their money. PriceBot combines
                                artificial intelligence with comprehensive price monitoring to help you make informed
                                purchasing decisions and never miss a great deal again.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Target className="w-6 h-6 mr-2 text-purple-600" />
                                    Smart Price Tracking
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Track prices across Amazon, eBay, Walmart, and more. Get notified when prices drop
                                    or when items go on sale.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Zap className="w-6 h-6 mr-2 text-purple-600" />
                                    AI Shopping Assistant
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Our AI helps you find the best products, compare prices, and discover hidden deals
                                    across multiple platforms.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <TrendingDown className="w-6 h-6 mr-2 text-purple-600" />
                                    Price History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    View historical price data to understand price trends and make better buying decisions.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Shield className="w-6 h-6 mr-2 text-purple-600" />
                                    Secure & Private
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Your data is protected with enterprise-grade security. We never share your personal
                                    information with third parties.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Supported Platforms */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="text-2xl">Supported Platforms</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    "Amazon", "eBay", "Walmart", "Etsy",
                                    "Best Buy", "Home Depot", "Zara"
                                ].map((platform) => (
                                    <div key={platform} className="flex items-center p-3 border rounded-lg">
                                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                        <span className="font-medium">{platform}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team/Contact Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Get in Touch</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Have questions, suggestions, or need support? We'd love to hear from you!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a
                                    href="mailto:support@pricebot.com"
                                    className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Contact Support
                                </a>
                                <a
                                    href="/dashboard/feedback"
                                    className="inline-flex items-center justify-center px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                                >
                                    Send Feedback
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PublicLayout>
    );
} 