import PublicLayout from "@/components/layouts/public-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertTriangle, Shield, Users, CreditCard, Globe } from "lucide-react";

export default function TermsPage() {
    return (
        <PublicLayout>
            <div className="container mx-auto py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                        <p className="text-xl text-gray-600">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>
                    </div>

                    {/* Introduction */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="w-6 h-6 mr-2 text-purple-600" />
                                Agreement to Terms
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 leading-relaxed">
                                By accessing and using PriceBot, you accept and agree to be bound by the terms and
                                provision of this agreement. If you do not agree to abide by the above, please do not
                                use this service.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Service Description */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Service Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 mb-4">
                                PriceBot is an AI-powered price tracking and shopping assistant service that helps users:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 space-y-2">
                                <li>Track product prices across multiple e-commerce platforms</li>
                                <li>Receive price drop alerts and notifications</li>
                                <li>Access AI-powered shopping assistance</li>
                                <li>View price history and trends</li>
                                <li>Compare prices across different retailers</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* User Accounts */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="w-6 h-6 mr-2 text-purple-600" />
                                User Accounts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Account Creation</h3>
                                <p className="text-gray-700">
                                    You must create an account to access our services. You are responsible for maintaining
                                    the confidentiality of your account credentials.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Account Responsibilities</h3>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    <li>Provide accurate and complete information</li>
                                    <li>Maintain the security of your account</li>
                                    <li>Notify us immediately of any unauthorized use</li>
                                    <li>Accept responsibility for all activities under your account</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Acceptable Use */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Shield className="w-6 h-6 mr-2 text-purple-600" />
                                Acceptable Use Policy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-700">
                                You agree to use our service only for lawful purposes and in accordance with these Terms.
                            </p>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">You agree NOT to:</h3>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    <li>Use the service for any illegal or unauthorized purpose</li>
                                    <li>Attempt to gain unauthorized access to our systems</li>
                                    <li>Interfere with or disrupt the service or servers</li>
                                    <li>Use automated tools to access the service excessively</li>
                                    <li>Share your account credentials with others</li>
                                    <li>Attempt to reverse engineer our technology</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Terms */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <CreditCard className="w-6 h-6 mr-2 text-purple-600" />
                                Payment Terms
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Pricing</h3>
                                <p className="text-gray-700">
                                    We offer various credit packages for our services. All prices are listed in USD and
                                    are subject to change with notice.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Payment Processing</h3>
                                <p className="text-gray-700">
                                    Payments are processed securely through third-party payment processors. By making a
                                    purchase, you authorize us to charge your payment method for the specified amount.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Refunds</h3>
                                <p className="text-gray-700">
                                    Credits are non-refundable once used. Unused credits may be refunded within 30 days
                                    of purchase, subject to our refund policy.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Service Limitations */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <AlertTriangle className="w-6 h-6 mr-2 text-purple-600" />
                                Service Limitations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-gray-700 space-y-2">
                                <li>Price data may not be real-time and is subject to delays</li>
                                <li>We cannot guarantee 100% accuracy of price information</li>
                                <li>Service availability may be affected by maintenance or technical issues</li>
                                <li>We are not responsible for changes made by third-party retailers</li>
                                <li>Price tracking is limited to supported platforms and regions</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Intellectual Property */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Intellectual Property</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 mb-4">
                                The service and its original content, features, and functionality are owned by PriceBot
                                and are protected by international copyright, trademark, patent, trade secret, and other
                                intellectual property laws.
                            </p>
                            <p className="text-gray-700">
                                You may not copy, modify, distribute, sell, or lease any part of our service without
                                our prior written consent.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Privacy */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Privacy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700">
                                Your privacy is important to us. Please review our Privacy Policy, which also governs
                                your use of the service, to understand our practices.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Disclaimers */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Disclaimers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 mb-4">
                                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
                                EITHER EXPRESS OR IMPLIED.
                            </p>
                            <ul className="list-disc list-inside text-gray-700 space-y-2">
                                <li>We do not guarantee uninterrupted or error-free service</li>
                                <li>We are not responsible for any decisions made based on our price data</li>
                                <li>We do not endorse or guarantee any products or retailers</li>
                                <li>Price information is for informational purposes only</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Limitation of Liability */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Limitation of Liability</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700">
                                IN NO EVENT SHALL PRICEBOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                                CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS,
                                DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Termination */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Termination</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 mb-4">
                                We may terminate or suspend your account and access to the service immediately, without
                                prior notice, for any reason, including breach of these Terms.
                            </p>
                            <p className="text-gray-700">
                                Upon termination, your right to use the service will cease immediately, and we may
                                delete your account and data.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Changes to Terms */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Changes to Terms</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700">
                                We reserve the right to modify these terms at any time. We will notify users of any
                                material changes via email or through the service. Your continued use of the service
                                after changes constitutes acceptance of the new terms.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 mb-4">
                                If you have any questions about these Terms of Service, please contact us:
                            </p>
                            <div className="space-y-2 text-gray-700">
                                <p><strong>Email:</strong> legal@pricebot.com</p>
                                <p><strong>Address:</strong> [Your Business Address]</p>
                                <p><strong>Response Time:</strong> We aim to respond to legal inquiries within 72 hours</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PublicLayout>
    );
} 