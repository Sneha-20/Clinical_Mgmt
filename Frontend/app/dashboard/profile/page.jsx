"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Mail, Phone, Calendar, Briefcase, MapPin, Edit, Key } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getUserProfile } from '@/lib/services/dashboard';
import ChangePasswordModal from '@/components/ui/ChangePasswordModal';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      if (response?.status === 200 && response?.data) {
        const data = response.data;
        setUserData({
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role?.name || 'Unknown',
          clinic: data.clinic?.name || 'Unknown Clinic',
          clinicAddress: data.clinic?.address || 'No address available',
          clinicPhone: data.clinic?.phone || 'No phone available',
          // joinDate: data.clinic?.created_at ? new Date(data.clinic.created_at).toLocaleDateString() : 'Unknown',
          totalPatients: "0", // Add if API provides this data
          totalRevenue: "0"  // Add if API provides this data
        });
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({ 
        title: 'Error', 
        description: 'Unable to fetch user profile data' 
      });
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">No profile data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-teal-600">User Profile</h1>
            <p className="text-sm text-gray-600">View and manage your account information</p>
          </div>
        </div>
        {/* <Button className="bg-teal-600">
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-teal-600" />
              </div>
              <CardTitle className="text-xl">{userData.name}</CardTitle>
              <p className="text-gray-600">{userData.role}</p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{userData.email}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{userData.phone}</span>
                </div>
                
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Professional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Role</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{userData.role}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Clinic</label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{userData.clinic}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Clinic Phone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{userData.clinicPhone}</span>
                    </div>
                  </div>
                </div>
                {/* <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Patients</label>
                    <div className="text-xl font-bold text-teal-600">{userData.totalPatients}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Revenue</label>
                    <div className="text-xl font-bold text-teal-600">₹{userData.totalRevenue}</div>
                  </div>
                </div> */}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email Address</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{userData.email}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{userData.phone}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Clinic Address</label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{userData.clinicAddress}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Button>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}
