import { ObjectId } from "mongodb";

// Database query optimization utilities
export class QueryOptimizer {
  // Create optimized aggregation pipeline for dashboard stats
  static getDashboardStatsPipeline(role: string, userId?: string) {
    const basePipeline = [
      {
        $facet: {
          // User statistics
          userStats: [
            { $count: "totalUsers" },
            { $addFields: { activeUsers: { $multiply: ["$totalUsers", 0.8] } } }
          ],
          // Leave statistics
          leaveStats: [
            { $match: { status: "pending" } },
            { $count: "pendingLeaves" }
          ],
          // Team statistics
          teamStats: [
            { $count: "totalTeams" }
          ],
          // Time entry statistics
          timeStats: [
            {
              $match: {
                date: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  $lte: new Date(new Date().setHours(23, 59, 59, 999))
                }
              }
            },
            { $count: "todayAttendance" }
          ]
        }
      },
      {
        $project: {
          totalUsers: { $arrayElemAt: ["$userStats.totalUsers", 0] },
          activeUsers: { $arrayElemAt: ["$userStats.activeUsers", 0] },
          pendingLeaves: { $arrayElemAt: ["$leaveStats.pendingLeaves", 0] },
          totalTeams: { $arrayElemAt: ["$teamStats.totalTeams", 0] },
          todayAttendance: { $arrayElemAt: ["$timeStats.todayAttendance", 0] }
        }
      }
    ];

    if (role === 'employee' && userId) {
      basePipeline[0].$facet.userStats = [
        { $match: { _id: new ObjectId(userId) } },
        { $count: "totalUsers" },
        { $addFields: { activeUsers: 1 } }
      ];
    }

    return basePipeline;
  }

  // Create optimized pipeline for recent activities
  static getRecentActivitiesPipeline(limit: number = 10) {
    return [
      {
        $lookup: {
          from: "users",
          localField: "employee_id",
          foreignField: "_id",
          as: "employee"
        }
      },
      {
        $unwind: {
          path: "$employee",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { created_at: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          id: { $toString: "$_id" },
          type: "leave_request",
          title: {
            $concat: [
              { $ifNull: ["$employee.full_name", "Employee"] },
              " submitted leave request"
            ]
          },
          description: {
            $concat: [
              "$leave_type",
              " leave from ",
              { $dateToString: { format: "%m/%d/%Y", date: "$start_date" } },
              " to ",
              { $dateToString: { format: "%m/%d/%Y", date: "$end_date" } }
            ]
          },
          timestamp: "$created_at",
          status: "$status",
          user: {
            name: { $ifNull: ["$employee.full_name", "Employee"] },
            email: { $ifNull: ["$employee.email", ""] },
            profile_photo: { $ifNull: ["$employee.profile_photo", null] },
            role: "employee"
          }
        }
      }
    ];
  }

  // Create optimized pipeline for upcoming birthdays
  static getUpcomingBirthdaysPipeline(limit: number = 10) {
    const today = new Date();
    const currentYear = today.getFullYear();

    return [
      {
        $match: {
          birth_date: { $exists: true, $ne: null }
        }
      },
      {
        $addFields: {
          birthDate: { $dateFromString: { dateString: "$birth_date" } },
          currentYear: currentYear
        }
      },
      {
        $addFields: {
          thisYearBirthday: {
            $dateFromParts: {
              year: "$currentYear",
              month: { $month: "$birthDate" },
              day: { $dayOfMonth: "$birthDate" }
            }
          }
        }
      },
      {
        $addFields: {
          nextBirthday: {
            $cond: {
              if: { $lt: ["$thisYearBirthday", today] },
              then: {
                $dateFromParts: {
                  year: { $add: ["$currentYear", 1] },
                  month: { $month: "$birthDate" },
                  day: { $dayOfMonth: "$birthDate" }
                }
              },
              else: "$thisYearBirthday"
            }
          }
        }
      },
      {
        $addFields: {
          daysUntilBirthday: {
            $ceil: {
              $divide: [
                { $subtract: ["$nextBirthday", today] },
                1000 * 60 * 60 * 24
              ]
            }
          },
          age: {
            $subtract: [
              { $year: "$nextBirthday" },
              { $year: "$birthDate" }
            ]
          }
        }
      },
      {
        $sort: { daysUntilBirthday: 1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          id: { $toString: "$_id" },
          full_name: 1,
          email: 1,
          profile_photo: 1,
          department: 1,
          position: 1,
          daysUntilBirthday: 1,
          birthdayMonth: { $month: "$birthDate" },
          birthdayDay: { $dayOfMonth: "$birthDate" },
          age: 1
        }
      }
    ];
  }

  // Create optimized pipeline for team data
  static getTeamsPipeline(limit: number = 10) {
    return [
      {
        $lookup: {
          from: "users",
          localField: "leader",
          foreignField: "_id",
          as: "leaderData"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "membersData"
        }
      },
      {
        $addFields: {
          leader: { $arrayElemAt: ["$leaderData", 0] },
          members: "$membersData"
        }
      },
      {
        $sort: { created_at: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          id: { $toString: "$_id" },
          name: 1,
          description: 1,
          leader: {
            id: { $toString: "$leader._id" },
            full_name: "$leader.full_name",
            email: "$leader.email",
            profile_photo: "$leader.profile_photo"
          },
          members: {
            $map: {
              input: "$members",
              as: "member",
              in: {
                id: { $toString: "$$member._id" },
                full_name: "$$member.full_name",
                email: "$$member.email",
                profile_photo: "$$member.profile_photo"
              }
            }
          },
          created_at: 1,
          updated_at: 1
        }
      }
    ];
  }

  // Create indexes for better performance
  static getRecommendedIndexes() {
    return [
      // Users collection indexes
      { collection: "users", index: { role: 1 } },
      { collection: "users", index: { last_sign_in_at: 1 } },
      { collection: "users", index: { birth_date: 1 } },
      { collection: "users", index: { department: 1, position: 1 } },
      
      // Leave requests collection indexes
      { collection: "leave_requests", index: { status: 1 } },
      { collection: "leave_requests", index: { employee_id: 1, status: 1 } },
      { collection: "leave_requests", index: { created_at: -1 } },
      { collection: "leave_requests", index: { start_date: 1, end_date: 1 } },
      
      // Time entries collection indexes
      { collection: "time_entries", index: { employee_id: 1, date: 1 } },
      { collection: "time_entries", index: { date: 1 } },
      { collection: "time_entries", index: { action: 1 } },
      
      // Teams collection indexes
      { collection: "teams", index: { created_at: -1 } },
      { collection: "teams", index: { leader: 1 } },
      { collection: "teams", index: { members: 1 } },
      
      // Leave balances collection indexes
      { collection: "leave_balances", index: { employee_id: 1, year: 1 } },
      { collection: "leave_balances", index: { leave_type: 1 } },
      
      // Leave types collection indexes
      { collection: "leave_types", index: { is_active: 1 } },
    ];
  }

  // Pagination helper
  static getPaginationPipeline(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    return [
      { $skip: skip },
      { $limit: limit }
    ];
  }

  // Search optimization
  static getSearchPipeline(searchTerm: string, searchFields: string[]) {
    if (!searchTerm.trim()) {
      return [];
    }

    const searchRegex = new RegExp(searchTerm, "i");
    const searchConditions = searchFields.map(field => ({
      [field]: { $regex: searchRegex }
    }));

    return [
      {
        $match: {
          $or: searchConditions
        }
      }
    ];
  }

  // Date range optimization
  static getDateRangePipeline(startDate: Date, endDate: Date, dateField: string = "created_at") {
    return [
      {
        $match: {
          [dateField]: {
            $gte: startDate,
            $lte: endDate
          }
        }
      }
    ];
  }

  // Aggregation for statistics
  static getStatisticsPipeline(groupBy: string, aggregateFields: Record<string, any>) {
    return [
      {
        $group: {
          _id: `$${groupBy}`,
          ...Object.entries(aggregateFields).reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {} as Record<string, any>)
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];
  }
}

// Query cache manager
export class QueryCacheManager {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static set(key: string, data: any, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  static get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  static delete(key: string) {
    this.cache.delete(key);
  }

  static clear() {
    this.cache.clear();
  }

  static getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Database connection pool optimization
export class ConnectionPoolOptimizer {
  static getOptimalPoolSize(): number {
    // Calculate optimal pool size based on system resources
    const cpuCount = require('os').cpus().length;
    return Math.min(cpuCount * 2, 20); // Max 20 connections
  }

  static getConnectionOptions() {
    return {
      maxPoolSize: this.getOptimalPoolSize(),
      minPoolSize: 2,
      maxIdleTimeMS: 30000, // 30 seconds
      serverSelectionTimeoutMS: 5000, // 5 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 10000, // 10 seconds
      bufferMaxEntries: 0,
      useUnifiedTopology: true,
    };
  }
}
