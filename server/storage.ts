import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users, employees, departments, leaveRequests, approvalSteps, holidays,
  leaveBalances, leavePolicies, workflowConfigs, workflowSteps,
  type User, type Employee, type Department, type LeaveRequest, type ApprovalStep,
  type Holiday, type LeaveBalance, type LeavePolicy, type WorkflowConfig,
  type InsertUser, type InsertEmployee, type InsertDepartment, 
  type InsertLeaveRequest, type InsertApprovalStep, type InsertHoliday,
  type InsertLeaveBalance, type InsertLeavePolicy
} from "../shared/schema";

export interface IStorage {
  // User operations
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmployeeId(employeeId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Employee operations
  getAllEmployees(): Promise<Employee[]>;
  getEmployeeById(id: string): Promise<Employee | undefined>;
  getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee>;
  deleteEmployee(id: string): Promise<void>;

  // Department operations
  getAllDepartments(): Promise<Department[]>;
  getDepartmentById(id: string): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: string, department: Partial<InsertDepartment>): Promise<Department>;
  deleteDepartment(id: string): Promise<void>;

  // Leave Request operations
  getAllLeaveRequests(): Promise<LeaveRequest[]>;
  getLeaveRequestById(id: string): Promise<LeaveRequest | undefined>;
  getLeaveRequestsByEmployeeId(employeeId: string): Promise<LeaveRequest[]>;
  createLeaveRequest(leaveRequest: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequest(id: string, leaveRequest: Partial<InsertLeaveRequest>): Promise<LeaveRequest>;
  deleteLeaveRequest(id: string): Promise<void>;

  // Approval Step operations
  getApprovalStepsByLeaveRequestId(leaveRequestId: string): Promise<ApprovalStep[]>;
  createApprovalStep(approvalStep: InsertApprovalStep): Promise<ApprovalStep>;
  updateApprovalStep(id: string, approvalStep: Partial<InsertApprovalStep>): Promise<ApprovalStep>;

  // Holiday operations
  getAllHolidays(): Promise<Holiday[]>;
  createHoliday(holiday: InsertHoliday): Promise<Holiday>;
  updateHoliday(id: string, holiday: Partial<InsertHoliday>): Promise<Holiday>;
  deleteHoliday(id: string): Promise<void>;

  // Leave Balance operations
  getLeaveBalancesByEmployeeId(employeeId: string): Promise<LeaveBalance[]>;
  getLeaveBalanceByEmployeeIdAndType(employeeId: string, leaveType: string): Promise<LeaveBalance | undefined>;
  createLeaveBalance(leaveBalance: InsertLeaveBalance): Promise<LeaveBalance>;
  updateLeaveBalance(id: string, leaveBalance: Partial<InsertLeaveBalance>): Promise<LeaveBalance>;

  // Leave Policy operations
  getAllLeavePolicies(): Promise<LeavePolicy[]>;
  getLeavePolicyByType(leaveType: string): Promise<LeavePolicy | undefined>;
  createLeavePolicy(leavePolicy: InsertLeavePolicy): Promise<LeavePolicy>;
  updateLeavePolicy(id: string, leavePolicy: Partial<InsertLeavePolicy>): Promise<LeavePolicy>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmployeeId(employeeId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.employee_id, employeeId));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...user, updated_at: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Employee operations
  async getAllEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async getEmployeeById(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || undefined;
  }

  async getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.employee_id, employeeId));
    return employee || undefined;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db.insert(employees).values(employee).returning();
    return newEmployee;
  }

  async updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee> {
    const [updatedEmployee] = await db
      .update(employees)
      .set({ ...employee, updated_at: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return updatedEmployee;
  }

  async deleteEmployee(id: string): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }

  // Department operations
  async getAllDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }

  async getDepartmentById(id: string): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department || undefined;
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [newDepartment] = await db.insert(departments).values(department).returning();
    return newDepartment;
  }

  async updateDepartment(id: string, department: Partial<InsertDepartment>): Promise<Department> {
    const [updatedDepartment] = await db
      .update(departments)
      .set({ ...department, updated_at: new Date() })
      .where(eq(departments.id, id))
      .returning();
    return updatedDepartment;
  }

  async deleteDepartment(id: string): Promise<void> {
    await db.delete(departments).where(eq(departments.id, id));
  }

  // Leave Request operations
  async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    return await db.select().from(leaveRequests).orderBy(desc(leaveRequests.created_at));
  }

  async getLeaveRequestById(id: string): Promise<LeaveRequest | undefined> {
    const [leaveRequest] = await db.select().from(leaveRequests).where(eq(leaveRequests.id, id));
    return leaveRequest || undefined;
  }

  async getLeaveRequestsByEmployeeId(employeeId: string): Promise<LeaveRequest[]> {
    return await db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.employee_id, employeeId))
      .orderBy(desc(leaveRequests.created_at));
  }

  async createLeaveRequest(leaveRequest: InsertLeaveRequest): Promise<LeaveRequest> {
    const [newLeaveRequest] = await db.insert(leaveRequests).values(leaveRequest).returning();
    return newLeaveRequest;
  }

  async updateLeaveRequest(id: string, leaveRequest: Partial<InsertLeaveRequest>): Promise<LeaveRequest> {
    const [updatedLeaveRequest] = await db
      .update(leaveRequests)
      .set({ ...leaveRequest, updated_at: new Date() })
      .where(eq(leaveRequests.id, id))
      .returning();
    return updatedLeaveRequest;
  }

  async deleteLeaveRequest(id: string): Promise<void> {
    await db.delete(leaveRequests).where(eq(leaveRequests.id, id));
  }

  // Approval Step operations
  async getApprovalStepsByLeaveRequestId(leaveRequestId: string): Promise<ApprovalStep[]> {
    return await db
      .select()
      .from(approvalSteps)
      .where(eq(approvalSteps.leave_request_id, leaveRequestId))
      .orderBy(approvalSteps.step_order);
  }

  async createApprovalStep(approvalStep: InsertApprovalStep): Promise<ApprovalStep> {
    const [newApprovalStep] = await db.insert(approvalSteps).values(approvalStep).returning();
    return newApprovalStep;
  }

  async updateApprovalStep(id: string, approvalStep: Partial<InsertApprovalStep>): Promise<ApprovalStep> {
    const [updatedApprovalStep] = await db
      .update(approvalSteps)
      .set(approvalStep)
      .where(eq(approvalSteps.id, id))
      .returning();
    return updatedApprovalStep;
  }

  // Holiday operations
  async getAllHolidays(): Promise<Holiday[]> {
    return await db.select().from(holidays).orderBy(holidays.date);
  }

  async createHoliday(holiday: InsertHoliday): Promise<Holiday> {
    const [newHoliday] = await db.insert(holidays).values(holiday).returning();
    return newHoliday;
  }

  async updateHoliday(id: string, holiday: Partial<InsertHoliday>): Promise<Holiday> {
    const [updatedHoliday] = await db
      .update(holidays)
      .set({ ...holiday, updated_at: new Date() })
      .where(eq(holidays.id, id))
      .returning();
    return updatedHoliday;
  }

  async deleteHoliday(id: string): Promise<void> {
    await db.delete(holidays).where(eq(holidays.id, id));
  }

  // Leave Balance operations
  async getLeaveBalancesByEmployeeId(employeeId: string): Promise<LeaveBalance[]> {
    return await db.select().from(leaveBalances).where(eq(leaveBalances.employee_id, employeeId));
  }

  async getLeaveBalanceByEmployeeIdAndType(employeeId: string, leaveType: string): Promise<LeaveBalance | undefined> {
    const [leaveBalance] = await db
      .select()
      .from(leaveBalances)
      .where(and(
        eq(leaveBalances.employee_id, employeeId),
        eq(leaveBalances.leave_type, leaveType)
      ));
    return leaveBalance || undefined;
  }

  async createLeaveBalance(leaveBalance: InsertLeaveBalance): Promise<LeaveBalance> {
    const [newLeaveBalance] = await db.insert(leaveBalances).values(leaveBalance).returning();
    return newLeaveBalance;
  }

  async updateLeaveBalance(id: string, leaveBalance: Partial<InsertLeaveBalance>): Promise<LeaveBalance> {
    const [updatedLeaveBalance] = await db
      .update(leaveBalances)
      .set(leaveBalance)
      .where(eq(leaveBalances.id, id))
      .returning();
    return updatedLeaveBalance;
  }

  // Leave Policy operations
  async getAllLeavePolicies(): Promise<LeavePolicy[]> {
    return await db.select().from(leavePolicies).where(eq(leavePolicies.is_active, true));
  }

  async getLeavePolicyByType(leaveType: string): Promise<LeavePolicy | undefined> {
    const [leavePolicy] = await db
      .select()
      .from(leavePolicies)
      .where(and(
        eq(leavePolicies.leave_type, leaveType),
        eq(leavePolicies.is_active, true)
      ));
    return leavePolicy || undefined;
  }

  async createLeavePolicy(leavePolicy: InsertLeavePolicy): Promise<LeavePolicy> {
    const [newLeavePolicy] = await db.insert(leavePolicies).values(leavePolicy).returning();
    return newLeavePolicy;
  }

  async updateLeavePolicy(id: string, leavePolicy: Partial<InsertLeavePolicy>): Promise<LeavePolicy> {
    const [updatedLeavePolicy] = await db
      .update(leavePolicies)
      .set({ ...leavePolicy, updated_at: new Date() })
      .where(eq(leavePolicies.id, id))
      .returning();
    return updatedLeavePolicy;
  }
}

export const storage = new DatabaseStorage();