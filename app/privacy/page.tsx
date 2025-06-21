import PublicLayout from "@/components/layouts/public-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Lock, Users, Database, Globe } from "lucide-react";

export default function PrivacyPage() {
    return (
        <PublicLayout>
            <div className="container mx-auto py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                        <p className="text-xl text-gray-600">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>
                    </div>

                    {/* Introduction */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Shield className="w-6 h-6 mr-2 text-purple-600" />
                                Introduction
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 leading-relaxed">
                                At PriceBot, we take your privacy seriously. This Privacy Policy explains how we collect,
                                use, disclose, and safeguard your information when you use our service. By using PriceBot,
                                you consent to the data practices described in this policy.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Information We Collect */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Eye className="w-6 h-6 mr-2 text-purple-600" />
                                Information We Collect
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Personal Information</h3>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    <li>Email address and authentication information</li>
                                    <li>Name and profile information</li>
                                    <li>Payment information (processed securely through third-party providers)</li>
                                    <li>Communication preferences</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Usage Information</h3>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    <li>Products you track and their URLs</li>
                                    <li>Price history and tracking preferences</li>
                                    <li>Search queries and interactions with our AI assistant</li>
                                    <li>Usage patterns and feature preferences</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Technical Information</h3>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    <li>IP address and device information</li>
                                    <li>Browser type and version</li>
                                    <li>Operating system</li>
                                    <li>Usage analytics and performance data</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* How We Use Information */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="w-6 h-6 mr-2 text-purple-600" />
                                How We Use Your Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-gray-700 space-y-2">
                                <li>Provide and maintain our price tracking service</li>
                                <li>Send price alerts and notifications</li>
                                <li>Process payments and manage subscriptions</li>
                                <li>Improve our AI assistant and recommendation algorithms</li>
                                <li>Provide customer support and respond to inquiries</li>
                                <li>Analyze usage patterns to enhance user experience</li>
                                <li>Comply with legal obligations and prevent fraud</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Data Sharing */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Globe className="w-6 h-6 mr-2 text-purple-600" />
                                Data Sharing and Disclosure
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-700">
                                We do not sell, trade, or rent your personal information to third parties. We may share
                                your information in the following circumstances:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 space-y-2">
                                <li><strong>Service Providers:</strong> With trusted third-party services for payment processing, hosting, and analytics</li>
                                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                                <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Data Security */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Lock className="w-6 h-6 mr-2 text-purple-600" />
                                Data Security
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 mb-4">
                                We implement appropriate technical and organizational measures to protect your personal
                                information against unauthorized access, alteration, disclosure, or destruction.
                            </p>
                            <ul className="list-disc list-inside text-gray-700 space-y-2">
                                <li>Encryption of data in transit and at rest</li>
                                <li>Regular security assessments and updates</li>
                                <li>Access controls and authentication measures</li>
                                <li>Secure data centers and infrastructure</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Data Retention */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Database className="w-6 h-6 mr-2 text-purple-600" />
                                Data Retention
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700">
                                We retain your personal information for as long as necessary to provide our services
                                and comply with legal obligations. You may request deletion of your data at any time,
                                subject to certain legal requirements.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Your Rights */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Your Rights</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 mb-4">
                                You have the following rights regarding your personal information:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 space-y-2">
                                <li><strong>Access:</strong> Request a copy of your personal data</li>
                                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                                <li><strong>Portability:</strong> Receive your data in a structured format</li>
                                <li><strong>Objection:</strong> Object to certain processing activities</li>
                                <li><strong>Withdrawal:</strong> Withdraw consent at any time</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Us</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 mb-4">
                                If you have any questions about this Privacy Policy or our data practices, please contact us:
                            </p>
                            <div className="space-y-2 text-gray-700">
                                <p><strong>Email:</strong> privacy@pricebot.com</p>
                                <p><strong>Address:</strong> [Your Business Address]</p>
                                <p><strong>Response Time:</strong> We aim to respond to privacy inquiries within 48 hours</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PublicLayout>
    );
} 