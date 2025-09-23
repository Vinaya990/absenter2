import { drizzle } from "drizzle-orm/neon-serverless";
import { pgTable, varchar, text, timestamp, boolean, integer, serial, decimal } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
  employee_id: varchar("employee_id", { length: 20 }).notNull().unique(),
  role: varchar("role", { length: 20 }).notNull(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  last_login: timestamp("last_login"),
});

// Departments table
export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Employees table
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  employee_id: varchar("employee_id", { length: 20 }).notNull().unique(),
  department_id: varchar("department_id").references(() => departments.id),
  position: varchar("position", { length: 100 }).notNull(),
  manager_id: varchar("manager_id").references(() => employees.id),
  joining_date: varchar("joining_date").notNull(),
  status: varchar("status", { length: 20 }).default("active"),
  email: varchar("email", { length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Leave Requests table
export const leaveRequests = pgTable("leave_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employee_id: varchar("employee_id").references(() => employees.id).notNull(),
  leave_type: varchar("leave_type", { length: 20 }).notNull(),
  from_date: varchar("from_date").notNull(),
  to_date: varchar("to_date").notNull(),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  days_count: integer("days_count").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Approval Steps table
export const approvalSteps = pgTable("approval_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leave_request_id: varchar("leave_request_id").references(() => leaveRequests.id).notNull(),
  step_order: integer("step_order").notNull(),
  approver_role: varchar("approver_role", { length: 20 }).notNull(),
  approver_id: varchar("approver_id").references(() => users.id),
  status: varchar("status", { length: 20 }).default("pending"),
  comments: text("comments"),
  approved_at: timestamp("approved_at"),
  is_current: boolean("is_current").default(false),
});

// Holidays table
export const holidays = pgTable("holidays", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  date: varchar("date").notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Leave Balances table
export const leaveBalances = pgTable("leave_balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employee_id: varchar("employee_id").references(() => employees.id).notNull(),
  leave_type: varchar("leave_type", { length: 20 }).notNull(),
  total_days: integer("total_days").notNull(),
  used_days: integer("used_days").default(0),
  remaining_days: integer("remaining_days").notNull(),
  year: integer("year").notNull(),
});

// Leave Policies table
export const leavePolicies = pgTable("leave_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leave_type: varchar("leave_type", { length: 20 }).notNull(),
  annual_limit: integer("annual_limit").notNull(),
  min_days_notice: integer("min_days_notice").default(0),
  max_consecutive_days: integer("max_consecutive_days"),
  carry_forward_allowed: boolean("carry_forward_allowed").default(false),
  carry_forward_limit: integer("carry_forward_limit"),
  requires_medical_certificate: boolean("requires_medical_certificate").default(false),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Workflow Configs table
export const workflowConfigs = pgTable("workflow_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Workflow Steps table
export const workflowSteps = pgTable("workflow_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflow_config_id: varchar("workflow_config_id").references(() => workflowConfigs.id).notNull(),
  order: integer("order").notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  required: boolean("required").default(true),
});

// Define relations
export const usersRelations = relations(users, ({ one }) => ({
  employee: one(employees, {
    fields: [users.employee_id],
    references: [employees.employee_id],
  }),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.employee_id],
    references: [users.employee_id],
  }),
  department: one(departments, {
    fields: [employees.department_id],
    references: [departments.id],
  }),
  manager: one(employees, {
    fields: [employees.manager_id],
    references: [employees.id],
  }),
  leaveRequests: many(leaveRequests),
  leaveBalances: many(leaveBalances),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  employees: many(employees),
}));

export const leaveRequestsRelations = relations(leaveRequests, ({ one, many }) => ({
  employee: one(employees, {
    fields: [leaveRequests.employee_id],
    references: [employees.id],
  }),
  approvals: many(approvalSteps),
}));

export const approvalStepsRelations = relations(approvalSteps, ({ one }) => ({
  leaveRequest: one(leaveRequests, {
    fields: [approvalSteps.leave_request_id],
    references: [leaveRequests.id],
  }),
  approver: one(users, {
    fields: [approvalSteps.approver_id],
    references: [users.id],
  }),
}));

export const leaveBalancesRelations = relations(leaveBalances, ({ one }) => ({
  employee: one(employees, {
    fields: [leaveBalances.employee_id],
    references: [employees.id],
  }),
}));

export const workflowConfigsRelations = relations(workflowConfigs, ({ many }) => ({
  steps: many(workflowSteps),
}));

export const workflowStepsRelations = relations(workflowSteps, ({ one }) => ({
  workflowConfig: one(workflowConfigs, {
    fields: [workflowSteps.workflow_config_id],
    references: [workflowConfigs.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = typeof leaveRequests.$inferInsert;
export type ApprovalStep = typeof approvalSteps.$inferSelect;
export type InsertApprovalStep = typeof approvalSteps.$inferInsert;
export type Holiday = typeof holidays.$inferSelect;
export type InsertHoliday = typeof holidays.$inferInsert;
export type LeaveBalance = typeof leaveBalances.$inferSelect;
export type InsertLeaveBalance = typeof leaveBalances.$inferInsert;
export type LeavePolicy = typeof leavePolicies.$inferSelect;
export type InsertLeavePolicy = typeof leavePolicies.$inferInsert;
export type WorkflowConfig = typeof workflowConfigs.$inferSelect;
export type InsertWorkflowConfig = typeof workflowConfigs.$inferInsert;
export type WorkflowStep = typeof workflowSteps.$inferSelect;
export type InsertWorkflowStep = typeof workflowSteps.$inferInsert;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, created_at: true, updated_at: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, created_at: true, updated_at: true });
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true, created_at: true, updated_at: true });
export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({ id: true, created_at: true, updated_at: true });
export const insertHolidaySchema = createInsertSchema(holidays).omit({ id: true, created_at: true, updated_at: true });
export const insertLeaveBalanceSchema = createInsertSchema(leaveBalances).omit({ id: true });
export const insertLeavePolicySchema = createInsertSchema(leavePolicies).omit({ id: true, created_at: true, updated_at: true });

export type InsertUserType = z.infer<typeof insertUserSchema>;
export type InsertEmployeeType = z.infer<typeof insertEmployeeSchema>;
export type InsertDepartmentType = z.infer<typeof insertDepartmentSchema>;
export type InsertLeaveRequestType = z.infer<typeof insertLeaveRequestSchema>;
export type InsertHolidayType = z.infer<typeof insertHolidaySchema>;
export type InsertLeaveBalanceType = z.infer<typeof insertLeaveBalanceSchema>;
export type InsertLeavePolicyType = z.infer<typeof insertLeavePolicySchema>;