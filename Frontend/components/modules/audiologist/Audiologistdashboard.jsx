"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Clock, CheckCircle, Activity } from "lucide-react";
import useAudiologist from "@/lib/hooks/useAudiologist";
import AppoinmentListCard from "./components/AppoinmentListCard";
import Pagination from "@/components/ui/Pagination";
import { getDashboardStats } from "@/lib/services/dashboard";

export default function AudiologistDashboard() {
  const [dashboardStats, setDashboardStats] = useState({
    pending_tests: 0,
    completed_tests: 0,
    trials_active: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  const {
    handleViewPatient,
    showVisitDeteail,
    prendingTestPage,
    appoinementList,
    completedTests,
    totalPendingTest,
    completedtestPage,
    totalCompletedTest,
    showCaseHistoryform,
    prevCompletedtest,
    nextCompletedTest,
    prevPendingtest,
    nextPendingtest,
  } = useAudiologist();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      const response = await getDashboardStats();
      console.log(response)
      if (response) {
        setDashboardStats(response);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primaryText">
          Audiologist Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Manage patient queue and audiological tests
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-0">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Users className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-slate-600 text-xs sm:text-sm">
                  Patients in Queue
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {loadingStats ? "..." : dashboardStats.pending_tests}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-slate-600 text-xs sm:text-sm">
                  Tests Completed
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {loadingStats ? "..." : dashboardStats.completed_tests}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-orange-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Activity className="w-5 sm:w-6 h-5 sm:h-6 text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="text-slate-600 text-xs sm:text-sm">
                  Active Trials
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {loadingStats ? "..." : dashboardStats.trials_active}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AppoinmentListCard
        appoinementList={appoinementList}
        handleViewPatient={handleViewPatient}
        page={prendingTestPage}
        totalPages={totalPendingTest}
        onNext={nextPendingtest}
        onPrev={prevPendingtest} 
      />

      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Tests Completed</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Recent audiological assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {completedTests.map((item) => (
              <div
                key={item.visit_id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4 border border-slate-200 rounded-lg hover:bg-slate-50 "
                
              >
                <div>
                  <h4 className="font-semibold text-sm sm:text-base hover:underline cursor-pointer" onClick={() => showVisitDeteail(item.visit_id)}>
                    {item.patient_name}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {item.visit_type}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-left sm:text-right">
                  <p className="text-xs sm:text-sm font-medium">
                    {item.present_complaint}
                  </p>
                  {item.step_process == 2 ? (
                    <Button variant="link" onClick={() => showCaseHistoryform(item.visit_id, item.step_process)}>Add reports</Button>
                  ):(
                    <Button variant="link" onClick={() => showCaseHistoryform(item.visit_id, item.step_process)}>Add Trail</Button>
                   )
                }
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={completedtestPage}
            totalPages={totalCompletedTest}
            onNext={nextCompletedTest}
            onPrev={prevCompletedtest}
          />
        </CardContent>
      </Card>
    </div>
  );
}
