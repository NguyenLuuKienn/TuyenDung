import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Bell, Briefcase, MessageSquare, CheckCircle, AlertCircle, Clock } from "lucide-react";

const MOCK_NOTIFICATIONS = [
  { id: 1, type: "application", title: "Application Viewed", message: "TechCorp Inc. has viewed your application for Senior Frontend Developer.", time: "10 mins ago", read: false, icon: Eye, color: "text-blue-600 bg-blue-100" },
  { id: 2, type: "message", title: "New Message", message: "You have a new message from DataFlow Recruiter.", time: "1 hour ago", read: false, icon: MessageSquare, color: "text-green-600 bg-green-100" },
  { id: 3, type: "status", title: "Application Status Update", message: "Your application for UI/UX Designer at Creative Studio has been shortlisted.", time: "2 hours ago", read: true, icon: CheckCircle, color: "text-purple-600 bg-purple-100" },
  { id: 4, type: "job_alert", title: "New Job Alert", message: "5 new jobs match your alert for 'React Developer in Ho Chi Minh City'.", time: "1 day ago", read: true, icon: Briefcase, color: "text-yellow-600 bg-yellow-100" },
  { id: 5, type: "system", title: "Profile Completion", message: "Complete your profile to increase your chances of getting hired by 40%.", time: "2 days ago", read: true, icon: AlertCircle, color: "text-red-600 bg-red-100" },
];

function Eye(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function Notifications() {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" /> Notifications
          </h1>
          <Button variant="ghost" size="sm" className="text-blue-600">Mark all as read</Button>
        </div>

        <Card>
          <CardContent className="p-0 divide-y divide-gray-100">
            {MOCK_NOTIFICATIONS.map((notif) => {
              const Icon = notif.icon;
              return (
                <div 
                  key={notif.id} 
                  className={`p-4 flex items-start gap-4 transition-colors hover:bg-gray-50 ${!notif.read ? "bg-blue-50/50" : ""}`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${notif.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`text-sm font-semibold truncate ${!notif.read ? "text-gray-900" : "text-gray-700"}`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0">
                        <Clock className="h-3 w-3" /> {notif.time}
                      </span>
                    </div>
                    <p className={`text-sm ${!notif.read ? "text-gray-800 font-medium" : "text-gray-600"}`}>
                      {notif.message}
                    </p>
                    {notif.type === 'job_alert' && (
                      <Button variant="outline" size="sm" className="mt-3 text-xs h-7">View Jobs</Button>
                    )}
                    {notif.type === 'message' && (
                      <Button variant="default" size="sm" className="mt-3 text-xs h-7 bg-blue-600">Reply</Button>
                    )}
                  </div>
                  {!notif.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <Button variant="outline" className="text-gray-500">Load Older Notifications</Button>
        </div>
      </div>
    </div>
  );
}
