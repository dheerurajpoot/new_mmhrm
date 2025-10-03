import { type NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server";
import { 
  getUsersCollection, 
  getLeaveRequestsCollection, 
  getTimeEntriesCollection,
  getLeaveTypesCollection,
  getTeamsCollection,
  getProfilesCollection
} from "@/lib/mongodb/collections";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const section = url.searchParams.get('section');
    const role = user.role;

    if (!section) {
      return NextResponse.json({ error: "Section parameter is required" }, { status: 400 });
    }

    let data = {};

    switch (section) {
      case 'overview':
        data = await getOverviewData(role, user._id);
        break;
      case 'users':
        data = await getUsersData(role, user._id);
        break;
      case 'teams':
        data = await getTeamsData(role, user._id);
        break;
      case 'employees':
        data = await getEmployeesData(role, user._id);
        break;
      case 'finances':
        data = await getFinancesData(role, user._id);
        break;
      case 'leaves':
        data = await getLeavesData(role, user._id);
        break;
      case 'attendance':
        data = await getAttendanceData(role, user._id);
        break;
      case 'time':
        data = await getAttendanceData(role, user._id);
        break;
      case 'profile':
        data = await getProfileData(role, user._id);
        break;
      case 'settings':
        data = await getSettingsData(role, user._id);
        break;
      default:
        return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Overview section data (stats, recent activity, birthdays)
async function getOverviewData(role: string, userId: ObjectId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  const [usersCollection, leaveRequestsCollection, timeEntriesCollection, teamsCollection, leaveTypesCollection] = await Promise.all([
    getUsersCollection(),
    getLeaveRequestsCollection(),
    getTimeEntriesCollection(),
    getTeamsCollection(),
    getLeaveTypesCollection()
  ]);

  const [users, leaveRequests, timeEntries, teams, leaveTypes] = await Promise.all([
    usersCollection.find({}).toArray(),
    leaveRequestsCollection.find({}).toArray(),
    timeEntriesCollection.find({}).toArray(),
    teamsCollection.find({}).toArray(),
    leaveTypesCollection.find({}).toArray()
  ]);

  // Calculate stats based on role
  let stats = {};
  let recentActivity = [];
  let upcomingBirthdays = [];

  if (role === 'admin') {
    stats = {
      totalUsers: users.length,
      activeUsers: users.filter((u: any) => u.last_sign_in_at).length,
      pendingLeaves: leaveRequests.filter((l: any) => l.status === "pending").length,
      todayAttendance: timeEntries.filter((a: any) => {
        const entryDate = new Date(a.date);
        return entryDate >= today && entryDate <= endOfToday;
      }).length,
      totalLeaveTypes: leaveTypes.length,
      totalTeams: teams.length,
      userGrowth: 20,
      attendanceGrowth: 15,
      leaveGrowth: -5,
      teamGrowth: 25,
    };

    // Recent activity for admin
    recentActivity = leaveRequests
      .filter((l: any) => l.status === "pending")
      .slice(0, 10)
      .map((leave: any) => ({
        id: `leave-request-${leave._id}`,
        type: "leave_request",
        title: `${leave.employee?.full_name || "Employee"} submitted leave request`,
        description: `${leave.leave_type} leave from ${new Date(leave.start_date).toLocaleDateString()} to ${new Date(leave.end_date).toLocaleDateString()}`,
        timestamp: leave.created_at,
        status: leave.status,
        user: {
          name: leave.employee?.full_name || "Employee",
          email: leave.employee?.email || "",
          profile_photo: leave.employee?.profile_photo,
          role: "employee"
        }
      }));

    // Recent teams
    const recentTeams = teams
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    // Upcoming birthdays
    upcomingBirthdays = users
      .filter((emp: any) => emp.birth_date)
      .map((emp: any) => {
        const birthDate = new Date(emp.birth_date);
        const today = new Date();
        const currentYear = today.getFullYear();
        
        if (isNaN(birthDate.getTime())) {
          return null;
        }
        
        let thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
        if (thisYearBirthday < today) {
          thisYearBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
        }
        
        const daysUntilBirthday = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          ...emp,
          daysUntilBirthday,
          birthdayMonth: birthDate.toLocaleString('default', { month: 'long' }),
          birthdayDay: birthDate.getDate(),
          age: currentYear - birthDate.getFullYear()
        };
      })
      .filter((emp: any) => emp !== null) // Remove null entries
      .sort((a: any, b: any) => a.daysUntilBirthday - b.daysUntilBirthday)
      .slice(0, 10);

    return {
      stats,
      recentActivity,
      recentTeams,
      upcomingBirthdays
    };
  } else if (role === 'hr') {
    stats = {
      totalEmployees: users.filter((u: any) => u.role === "employee").length,
      pendingLeaves: leaveRequests.filter((l: any) => l.status === "pending").length,
      todayAttendance: timeEntries.filter((a: any) => {
        const entryDate = new Date(a.date);
        return entryDate >= today && entryDate <= endOfToday;
      }).length,
      overdueApprovals: leaveRequests.filter((l: any) => {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        return l.status === "pending" && new Date(l.created_at) < threeDaysAgo;
      }).length,
      employeeGrowth: 15,
      leaveGrowth: 8,
      attendanceGrowth: 22,
      approvalGrowth: -12,
    };

    recentActivity = leaveRequests
      .filter((l: any) => l.status === "pending")
      .slice(0, 4)
      .map((leave: any) => ({
        id: `leave-${leave._id}`,
        type: "leave",
        message: `${leave.employee?.full_name || "Employee"} submitted leave request`,
        timestamp: leave.created_at,
        user: leave.employee?.full_name || "Employee",
        status: "pending"
      }));

    return {
      stats,
      recentActivity,
      upcomingBirthdays: users
        .filter((emp: any) => emp.birth_date)
        .slice(0, 10)
    };
  } else if (role === 'employee') {
    const currentYear = new Date().getFullYear();
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [leaveBalancesCollection, leaveRequestsCollection, timeEntriesCollection, leaveTypesCollection] = await Promise.all([
      getLeaveRequestsCollection(), // Using leave requests for balances
      getLeaveRequestsCollection(),
      getTimeEntriesCollection(),
      getLeaveTypesCollection()
    ]);

    const [leaveBalances, leaveRequests, timeEntries, leaveTypes] = await Promise.all([
      leaveRequestsCollection.find({ employee_id: userId }).toArray(),
      leaveRequestsCollection.find({ employee_id: userId, status: "pending" }).toArray(),
      timeEntriesCollection.find({ employee_id: userId }).toArray(),
      leaveTypesCollection.find({}).toArray()
    ]);

    const weekEntries = timeEntries.filter((entry: any) => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfWeek;
    });
    const hoursThisWeek = weekEntries.reduce((sum: number, entry: any) => sum + (entry.total_hours || 0), 0);

    const todayEntries = timeEntries.filter((entry: any) => {
      const entryDate = new Date(entry.date);
      return entryDate >= today && entryDate <= endOfToday;
    });
    const todayHours = todayEntries.reduce((sum: number, entry: any) => sum + (entry.total_hours || 0), 0);

    const isCurrentlyClockedIn = timeEntries.some((entry: any) => 
      entry.employee_id.toString() === userId.toString() && 
      entry.action === 'clock_in' && 
      !entry.action === 'clock_out'
    );

    stats = {
      remainingLeaves: leaveBalances.reduce((sum: number, balance: any) => sum + (balance.remaining_days || 0), 0),
      hoursThisWeek,
      pendingRequests: leaveRequests.length,
      currentSalary: 0, // This would come from finances collection
      isCurrentlyClockedIn,
      todayHours,
      leaveGrowth: 5,
      hoursGrowth: 12,
      salaryGrowth: 8,
      requestGrowth: -3,
    };

    return {
      stats,
      upcomingBirthdays: users
        .filter((emp: any) => emp.birth_date)
        .slice(0, 10),
      leaveBalances: leaveBalances.map((balance: any) => ({
        id: balance._id.toString(),
        leave_type: balance.leave_type,
        remaining_days: balance.remaining_days || 0,
        total_days: balance.total_days || 0,
        used_days: balance.used_days || 0
      })),
      leaveTypes: leaveTypes.map((type: any) => ({
        id: type._id.toString(),
        name: type.name,
        description: type.description,
        max_days: type.max_days,
        is_active: type.is_active
      }))
    };
  }

  return { stats: {}, recentActivity: [], upcomingBirthdays: [] };
}

// Users section data
async function getUsersData(role: string, userId: string) {
  if (!["admin", "hr"].includes(role)) {
    return { error: "Access denied" };
  }

  const usersCollection = await getUsersCollection();
  const users = await usersCollection.find({}).toArray();

  return {
    users: users.map((user: any) => ({
      id: user._id.toString(),
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      department: user.department,
      position: user.position,
      phone: user.phone,
      address: user.address,
      birth_date: user.birth_date,
      profile_photo: user.profile_photo,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      is_active: user.is_active
    }))
  };
}

// Teams section data
async function getTeamsData(role: string, userId: string) {
  if (!["admin", "hr"].includes(role)) {
    return { error: "Access denied" };
  }

  const teamsCollection = await getTeamsCollection();
  const teams = await teamsCollection.find({}).toArray();

  return {
    teams: teams.map((team: any) => ({
      id: team._id.toString(),
      name: team.name,
      description: team.description,
      leader: team.leader,
      members: team.members,
      created_at: team.created_at,
      updated_at: team.updated_at
    }))
  };
}

// Employees section data
async function getEmployeesData(role: string, userId: string) {
  if (!["admin", "hr"].includes(role)) {
    return { error: "Access denied" };
  }

  const usersCollection = await getUsersCollection();
  const employees = await usersCollection.find({ role: "employee" }).toArray();

  return {
    employees: employees.map((emp: any) => ({
      id: emp._id.toString(),
      email: emp.email,
      full_name: emp.full_name,
      department: emp.department,
      position: emp.position,
      phone: emp.phone,
      address: emp.address,
      birth_date: emp.birth_date,
      profile_photo: emp.profile_photo,
      created_at: emp.created_at,
      last_sign_in_at: emp.last_sign_in_at,
      is_active: emp.is_active
    }))
  };
}

// Finances section data
async function getFinancesData(role: string, userId: string) {
  if (role === 'employee') {
    // Employee can only see their own finances
    const profilesCollection = await getProfilesCollection();
    const profile = await profilesCollection.findOne({ _id: new ObjectId(userId) });
    
    return {
      finances: profile ? {
        id: profile._id.toString(),
        employee_id: profile._id.toString(),
        base_salary: profile.base_salary || null,
        hourly_rate: profile.hourly_rate || null,
        currency: profile.currency || 'USD',
        pay_frequency: profile.pay_frequency || 'monthly'
      } : null
    };
  } else if (["admin", "hr"].includes(role)) {
    // Admin/HR can see all finances
    const profilesCollection = await getProfilesCollection();
    const profiles = await profilesCollection.find({}).toArray();

    return {
      finances: profiles.map((profile: any) => ({
        id: profile._id.toString(),
        employee_id: profile._id.toString(),
        base_salary: profile.base_salary || null,
        hourly_rate: profile.hourly_rate || null,
        currency: profile.currency || 'USD',
        pay_frequency: profile.pay_frequency || 'monthly'
      }))
    };
  }

  return { finances: [] };
}

// Leaves section data
async function getLeavesData(role: string, userId: string) {
  const leaveRequestsCollection = await getLeaveRequestsCollection();
  const leaveTypesCollection = await getLeaveTypesCollection();

  if (role === 'employee') {
    const userIdObj = new ObjectId(userId);
    const [leaveRequests, leaveBalances, leaveTypes] = await Promise.all([
      leaveRequestsCollection.find({ employee_id: userIdObj }).toArray(),
      leaveRequestsCollection.find({ employee_id: userIdObj }).toArray(), // Using same collection for now
      leaveTypesCollection.find({}).toArray()
    ]);

    return {
      leaveRequests: leaveRequests.map((req: any) => ({
        id: req._id.toString(),
        leave_type: req.leave_type,
        start_date: req.start_date,
        end_date: req.end_date,
        days_requested: req.days_requested,
        status: req.status,
        reason: req.reason,
        created_at: req.created_at,
        approved_at: req.approved_at
      })),
      leaveBalances: leaveBalances.map((balance: any) => ({
        id: balance._id.toString(),
        leave_type: balance.leave_type,
        remaining_days: balance.remaining_days || 0,
        total_days: balance.total_days || 0,
        used_days: balance.used_days || 0
      })),
      leaveTypes: leaveTypes.map((type: any) => ({
        id: type._id.toString(),
        name: type.name,
        description: type.description,
        max_days: type.max_days,
        is_active: type.is_active
      }))
    };
  } else if (["admin", "hr"].includes(role)) {
    const [leaveRequests, leaveTypes] = await Promise.all([
      leaveRequestsCollection.find({}).toArray(),
      leaveTypesCollection.find({}).toArray()
    ]);

    return {
      leaveRequests: leaveRequests.map((req: any) => ({
        id: req._id.toString(),
        employee_id: req.employee_id.toString(),
        leave_type: req.leave_type,
        start_date: req.start_date,
        end_date: req.end_date,
        days_requested: req.days_requested,
        status: req.status,
        reason: req.reason,
        created_at: req.created_at,
        approved_at: req.approved_at,
        employee: req.employee
      })),
      leaveTypes: leaveTypes.map((type: any) => ({
        id: type._id.toString(),
        name: type.name,
        description: type.description,
        max_days: type.max_days,
        is_active: type.is_active
      }))
    };
  }

  return { leaveRequests: [], leaveBalances: [], leaveTypes: [] };
}

// Attendance section data
async function getAttendanceData(role: string, userId: ObjectId) {
  try {
    console.log("[Dashboard Sections API] Getting attendance data for:", {
      role,
      userId: userId.toString(),
      userIdType: typeof userId
    });

    const timeEntriesCollection = await getTimeEntriesCollection();

    if (role === 'employee') {
      const timeEntries = await timeEntriesCollection.find({ employee_id: userId }).toArray();
      console.log("[Dashboard Sections API] Found time entries for employee:", timeEntries.length);

      return {
        timeEntries: timeEntries.map((entry: any) => ({
          id: entry._id.toString(),
          employee_id: entry.employee_id.toString(),
          date: entry.date,
          clock_in: entry.clock_in,
          clock_out: entry.clock_out,
          total_hours: entry.total_hours,
          action: entry.action,
          created_at: entry.created_at
        }))
      };
    } else if (["admin", "hr"].includes(role)) {
      const timeEntries = await timeEntriesCollection.find({}).toArray();
      console.log("[Dashboard Sections API] Found time entries for admin/hr:", timeEntries.length);

      return {
        timeEntries: timeEntries.map((entry: any) => ({
          id: entry._id.toString(),
          employee_id: entry.employee_id.toString(),
          date: entry.date,
          clock_in: entry.clock_in,
          clock_out: entry.clock_out,
          total_hours: entry.total_hours,
          action: entry.action,
          created_at: entry.created_at
        }))
      };
    }

    return { timeEntries: [] };
  } catch (error) {
    console.error("[Dashboard Sections API] Error in getAttendanceData:", error);
    throw error;
  }
}

// Profile section data
async function getProfileData(role: string, userId: string) {
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

  if (!user) {
    return { error: "User not found" };
  }

  return {
    profile: {
      id: user._id.toString(),
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      department: user.department,
      position: user.position,
      phone: user.phone,
      address: user.address,
      birth_date: user.birth_date,
      profile_photo: user.profile_photo,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at
    }
  };
}

// Settings section data
async function getSettingsData(role: string, userId: string) {
  if (!["admin", "hr"].includes(role)) {
    return { error: "Access denied" };
  }

  // This would typically come from a settings collection
  return {
    settings: {
      company_name: "Your Company",
      timezone: "UTC",
      working_hours: {
        start: "09:00",
        end: "17:00"
      },
      leave_policy: {
        annual_leave_days: 25,
        sick_leave_days: 12
      }
    }
  };
}
