import { storage } from "./storage";
import type { Department, Employee } from "../shared/schema";

// Helper function for generating password hash (simplified for demo)
function hashPassword(password: string): string {
  // In a real application, use proper bcrypt hashing
  // For demo purposes, we'll just store as-is (NOT recommended for production)
  return password;
}

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // 1. Create departments
    const departments = [
      {
        name: "Engineering",
        description: "Software Development",
      },
      {
        name: "Human Resources", 
        description: "HR Management",
      },
      {
        name: "Marketing",
        description: "Marketing and Sales",
      },
    ];

    const createdDepartments: Department[] = [];
    for (const dept of departments) {
      const created = await storage.createDepartment(dept);
      createdDepartments.push(created);
      console.log(`✅ Created department: ${created.name}`);
    }

    // 2. Create employees
    const employees = [
      {
        name: "Admin User",
        employee_id: "EMP001",
        department_id: createdDepartments[1].id, // HR
        position: "System Admin",
        joining_date: "2024-01-01",
        status: "active" as const,
        email: "admin@company.com",
      },
      {
        name: "Sarah Johnson",
        employee_id: "EMP002", 
        department_id: createdDepartments[1].id, // HR
        position: "HR Manager",
        joining_date: "2024-01-15",
        status: "active" as const,
        email: "hr@company.com",
      },
      {
        name: "Mike Chen",
        employee_id: "EMP003",
        department_id: createdDepartments[0].id, // Engineering
        position: "Team Lead",
        joining_date: "2024-02-01", 
        status: "active" as const,
        email: "manager@company.com",
      },
      {
        name: "Emily Davis",
        employee_id: "EMP004",
        department_id: createdDepartments[0].id, // Engineering
        position: "Software Developer",
        joining_date: "2024-02-15",
        status: "active" as const,
        email: "employee@company.com",
      },
    ];

    const createdEmployees: Employee[] = [];
    for (const emp of employees) {
      const created = await storage.createEmployee(emp);
      createdEmployees.push(created);
      console.log(`✅ Created employee: ${created.name} (${created.employee_id})`);
    }

    // Set manager relationships
    await storage.updateEmployee(createdEmployees[3].id, {
      manager_id: createdEmployees[2].id, // Emily reports to Mike
    });

    // 3. Create users
    const users = [
      {
        username: "admin",
        email: "admin@company.com", 
        password_hash: hashPassword("password"),
        employee_id: "EMP001",
        role: "admin",
        is_active: true,
      },
      {
        username: "hr.manager",
        email: "hr@company.com",
        password_hash: hashPassword("password"),
        employee_id: "EMP002",
        role: "hr",
        is_active: true,
      },
      {
        username: "line.manager",
        email: "manager@company.com",
        password_hash: hashPassword("password"), 
        employee_id: "EMP003",
        role: "line_manager",
        is_active: true,
      },
      {
        username: "employee",
        email: "employee@company.com",
        password_hash: hashPassword("password"),
        employee_id: "EMP004", 
        role: "employee",
        is_active: true,
      },
    ];

    for (const user of users) {
      const created = await storage.createUser(user);
      console.log(`✅ Created user: ${created.username} (${created.role})`);
    }

    // 4. Create leave policies
    const leavePolicies = [
      {
        leave_type: "casual",
        annual_limit: 12,
        min_days_notice: 1,
        max_consecutive_days: 3,
        carry_forward_allowed: false,
        is_active: true,
      },
      {
        leave_type: "sick", 
        annual_limit: 10,
        min_days_notice: 0,
        max_consecutive_days: 7,
        carry_forward_allowed: false,
        requires_medical_certificate: true,
        is_active: true,
      },
      {
        leave_type: "paid",
        annual_limit: 21,
        min_days_notice: 7,
        max_consecutive_days: 14,
        carry_forward_allowed: true,
        carry_forward_limit: 5,
        is_active: true,
      },
      {
        leave_type: "personal",
        annual_limit: 5,
        min_days_notice: 3,
        max_consecutive_days: 2,
        carry_forward_allowed: false,
        is_active: true,
      },
    ];

    for (const policy of leavePolicies) {
      const created = await storage.createLeavePolicy(policy);
      console.log(`✅ Created leave policy: ${created.leave_type} (${created.annual_limit} days)`);
    }

    // 5. Create leave balances for all employees
    const currentYear = new Date().getFullYear();
    for (const employee of createdEmployees) {
      for (const policy of leavePolicies) {
        await storage.createLeaveBalance({
          employee_id: employee.id,
          leave_type: policy.leave_type,
          total_days: policy.annual_limit,
          used_days: 0,
          remaining_days: policy.annual_limit,
          year: currentYear,
        });
      }
    }
    console.log(`✅ Created leave balances for all employees`);

    // 6. Create some holidays
    const holidays = [
      {
        name: "New Year's Day",
        date: "2024-01-01",
        description: "New Year Holiday",
      },
      {
        name: "Independence Day",
        date: "2024-07-04", 
        description: "National Holiday",
      },
      {
        name: "Christmas",
        date: "2024-12-25",
        description: "Christmas Holiday",
      },
    ];

    for (const holiday of holidays) {
      const created = await storage.createHoliday(holiday);
      console.log(`✅ Created holiday: ${created.name} (${created.date})`);
    }

    console.log("🎉 Database seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}